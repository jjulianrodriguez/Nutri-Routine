"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";

import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  createProfessionalAccountSchema,
  type CreateProfessionalAccountValues,
  type ProfessionalSpecialty,
} from "@/lib/validations/professional-accounts";
import type { Enums } from "@/types/database";

const CONFIGURATION_PATH = "/app/configuracion";
const PROFESSIONAL_ACCOUNTS_PATH = "/app/configuracion/profesionales";
const PRIVILEGED_ROLES = new Set<ProfileRole>(["admin", "professional"]);

type ProfileRole = Enums<"profile_role">;
type ProfessionalAccountFieldErrors = Partial<
  Record<keyof CreateProfessionalAccountValues, string>
>;

export type CreateProfessionalAccountResult =
  | {
      createdUserId: string;
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: ProfessionalAccountFieldErrors;
      message: string;
      status: "error";
    };

export type ProfessionalAccountListItem = {
  createdAt: string;
  email: string;
  fullName: string;
  id: string;
  specialty: ProfessionalSpecialty;
};

export type ProfessionalAccountListResult = {
  error?: string;
  items: ProfessionalAccountListItem[];
};

function getFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ]),
  ) as ProfessionalAccountFieldErrors;
}

function isValidAccessCode(candidate: string, expected: string) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

function getAdminAuthErrorMessage(message: string, code?: string) {
  const normalized = `${code ?? ""} ${message}`.toLowerCase();

  if (
    normalized.includes("already") ||
    normalized.includes("exists") ||
    normalized.includes("registered")
  ) {
    return "Ya existe una cuenta con este email.";
  }

  if (normalized.includes("password")) {
    return "La contrasena temporal no cumple los requisitos de seguridad.";
  }

  if (normalized.includes("email")) {
    return "El email no pudo usarse para crear la cuenta.";
  }

  return "No se pudo crear la cuenta profesional. Intentalo de nuevo.";
}

function isProfessionalSpecialty(
  specialty: unknown,
): specialty is ProfessionalSpecialty {
  return (
    specialty === "nutrition" ||
    specialty === "training" ||
    specialty === "both"
  );
}

async function getCurrentPrivilegedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Debes iniciar sesion para crear cuentas profesionales.",
      profile: null,
      user: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      error: "No se pudo validar tu perfil actual.",
      profile: null,
      user,
    };
  }

  if (!profile) {
    return {
      error: "Tu usuario no tiene un perfil asociado.",
      profile: null,
      user,
    };
  }

  if (!PRIVILEGED_ROLES.has(profile.role)) {
    return {
      error: "No tienes permisos para crear cuentas profesionales.",
      profile: null,
      user,
    };
  }

  return {
    error: null,
    profile,
    user,
  };
}

async function deleteCreatedUser(userId: string) {
  try {
    await createAdminClient().auth.admin.deleteUser(userId);
  } catch {
    // The user creation flow reports the original database error.
  }
}

export async function createProfessionalAccount(
  values: CreateProfessionalAccountValues,
): Promise<CreateProfessionalAccountResult> {
  const parsed = createProfessionalAccountSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const privilegedContext = await getCurrentPrivilegedProfile();

  if (privilegedContext.error) {
    return {
      message: privilegedContext.error,
      status: "error",
    };
  }

  const expectedAdminCode = process.env.ADMIN_CREATION_ACCESS_CODE?.trim();

  if (!expectedAdminCode) {
    return {
      message:
        "Configura ADMIN_CREATION_ACCESS_CODE antes de crear cuentas profesionales.",
      status: "error",
    };
  }

  if (!isValidAccessCode(parsed.data.adminAccessCode, expectedAdminCode)) {
    return {
      fieldErrors: {
        adminAccessCode: "Codigo administrativo invalido.",
      },
      message: "Codigo administrativo invalido.",
      status: "error",
    };
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      message:
        "Configura SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY para crear usuarios.",
      status: "error",
    };
  }

  const adminSupabase = createAdminClient();
  const { data: authData, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email: parsed.data.email,
      email_confirm: true,
      password: parsed.data.temporaryPassword,
      user_metadata: {
        full_name: parsed.data.fullName,
      },
    });

  if (authError) {
    return {
      message: getAdminAuthErrorMessage(authError.message, authError.code),
      status: "error",
    };
  }

  const createdUser = authData.user;

  if (!createdUser) {
    return {
      message: "Supabase no devolvio el usuario creado.",
      status: "error",
    };
  }

  const { error: profileError } = await adminSupabase.from("profiles").upsert(
    {
      full_name: parsed.data.fullName,
      id: createdUser.id,
      role: "admin",
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    await deleteCreatedUser(createdUser.id);

    return {
      message:
        "La cuenta se creo en Auth, pero no se pudo asignar el perfil admin.",
      status: "error",
    };
  }

  const { error: professionalProfileError } = await adminSupabase
    .from("professional_profiles")
    .upsert(
      {
        profile_id: createdUser.id,
        specialty: parsed.data.specialty,
      },
      {
        onConflict: "profile_id",
      },
    );

  if (professionalProfileError) {
    await deleteCreatedUser(createdUser.id);

    return {
      message:
        "La cuenta se creo en Auth, pero no se pudo asignar la especialidad.",
      status: "error",
    };
  }

  revalidatePath(CONFIGURATION_PATH);
  revalidatePath(PROFESSIONAL_ACCOUNTS_PATH);

  return {
    createdUserId: createdUser.id,
    message: "Cuenta profesional creada correctamente.",
    status: "success",
  };
}

export async function listProfessionalAccounts(): Promise<ProfessionalAccountListResult> {
  const privilegedContext = await getCurrentPrivilegedProfile();

  if (privilegedContext.error) {
    return {
      error: privilegedContext.error,
      items: [],
    };
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      error:
        "Configura SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY para ver emails.",
      items: [],
    };
  }

  const adminSupabase = createAdminClient();
  const { data: professionalProfiles, error: professionalProfilesError } =
    await adminSupabase
      .from("professional_profiles")
      .select("profile_id, specialty, created_at")
      .order("created_at", { ascending: false });

  if (professionalProfilesError) {
    return {
      error: "No se pudo cargar la lista de profesionales.",
      items: [],
    };
  }

  const allProfessionalRows = professionalProfiles ?? [];
  const professionalRows = allProfessionalRows.filter(
    (
      item,
    ): item is (typeof allProfessionalRows)[number] & {
      specialty: ProfessionalSpecialty;
    } => isProfessionalSpecialty(item.specialty),
  );
  const profileIds = professionalRows.map((item) => item.profile_id);

  if (profileIds.length === 0) {
    return {
      items: [],
    };
  }

  const [{ data: profiles, error: profilesError }, { data: authUsers }] =
    await Promise.all([
      adminSupabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds),
      adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      }),
    ]);

  if (profilesError) {
    return {
      error: "No se pudieron cargar los perfiles profesionales.",
      items: [],
    };
  }

  const profilesById = new Map(
    profiles.map((profile) => [profile.id, profile.full_name ?? "Sin nombre"]),
  );
  const emailsById = new Map(
    (authUsers?.users ?? []).map((user) => [user.id, user.email ?? ""]),
  );

  return {
    items: professionalRows.map((item) => ({
      createdAt: item.created_at,
      email: emailsById.get(item.profile_id) ?? "",
      fullName: profilesById.get(item.profile_id) ?? "Sin nombre",
      id: item.profile_id,
      specialty: item.specialty,
    })),
  };
}

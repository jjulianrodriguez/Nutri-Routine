"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  clientActivationSchema,
  type ClientActivationService,
  type ClientActivationValues,
} from "@/lib/validations/client-activation";
import type { Enums, Tables } from "@/types/database";

const CLIENTS_PATH = "/app/clientes";
const DASHBOARD_PATH = "/app/dashboard";
const PENDING_PATH = "/app/pending";
const PRIVILEGED_ROLES = new Set<ProfileRole>(["admin", "professional"]);

type ProfileRole = Enums<"profile_role">;
type ProfessionalSpecialty = Enums<"professional_specialty">;
type AdminSupabase = ReturnType<typeof createAdminClient>;
type ClientActivationFieldErrors = Partial<
  Record<keyof ClientActivationValues, string>
>;

export type ClientAccountsFilter =
  | "active"
  | "all"
  | "both"
  | "none"
  | "nutrition"
  | "pending"
  | "training";

export type AssignableProfessional = {
  email: string;
  fullName: string;
  id: string;
  specialty: ProfessionalSpecialty;
};

export type ClientAccountListItem = {
  assignedNutritionistId: string | null;
  assignedNutritionistName: string | null;
  assignedTrainerId: string | null;
  assignedTrainerName: string | null;
  clientProfileExists: boolean;
  createdAt: string;
  email: string;
  fullName: string;
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  id: string;
  isClientActivated: boolean;
  serviceType: "both" | "none" | "nutrition" | "training";
};

export type ClientActivationData = {
  canManageNutrition: boolean;
  canManageTraining: boolean;
  clients: ClientAccountListItem[];
  counts: Record<ClientAccountsFilter, number>;
  currentUserId: string;
  error?: string;
  nutritionists: AssignableProfessional[];
  trainers: AssignableProfessional[];
};

export type ActivateClientAccountResult =
  | {
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: ClientActivationFieldErrors;
      message: string;
      status: "error";
    };

function getFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ]),
  ) as ClientActivationFieldErrors;
}

function canSpecialtyManage(
  role: ProfileRole,
  specialty: ProfessionalSpecialty | null,
  service: "nutrition" | "training",
) {
  if (role === "admin" && specialty === null) {
    return true;
  }

  return specialty === service || specialty === "both";
}

function serviceNeeds(
  serviceType: ClientActivationService,
  service: "nutrition" | "training",
) {
  return serviceType === service || serviceType === "both";
}

function isProfessionalAllowedForService(
  specialty: ProfessionalSpecialty | null,
  service: "nutrition" | "training",
) {
  return specialty === service || specialty === "both";
}

function getServiceType({
  hasNutritionService,
  hasTrainingService,
}: {
  hasNutritionService: boolean;
  hasTrainingService: boolean;
}): ClientAccountListItem["serviceType"] {
  if (hasNutritionService && hasTrainingService) {
    return "both";
  }

  if (hasNutritionService) {
    return "nutrition";
  }

  if (hasTrainingService) {
    return "training";
  }

  return "none";
}

function normalizeFilter(filter?: string | null): ClientAccountsFilter {
  if (
    filter === "active" ||
    filter === "all" ||
    filter === "both" ||
    filter === "none" ||
    filter === "nutrition" ||
    filter === "pending" ||
    filter === "training"
  ) {
    return filter;
  }

  return "pending";
}

function matchesFilter(
  client: ClientAccountListItem,
  filter: ClientAccountsFilter,
) {
  switch (filter) {
    case "active":
      return client.isClientActivated;
    case "all":
      return true;
    case "both":
    case "nutrition":
    case "training":
      return client.serviceType === filter;
    case "none":
    case "pending":
      return !client.isClientActivated;
  }
}

async function getCurrentActivationActor() {
  if (!hasSupabaseAdminConfig()) {
    return {
      adminSupabase: null,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: "",
      error:
        "Configura SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY para administrar clientes.",
      role: null,
      specialty: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      adminSupabase: null,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: "",
      error: "Debes iniciar sesion para administrar clientes.",
      role: null,
      specialty: null,
    };
  }

  const adminSupabase = createAdminClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      adminSupabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "No se pudo validar tu perfil administrativo.",
      role: null,
      specialty: null,
    };
  }

  if (!PRIVILEGED_ROLES.has(profile.role)) {
    return {
      adminSupabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "No tienes permisos para administrar clientes.",
      role: profile.role,
      specialty: null,
    };
  }

  const { data: professionalProfile } = await adminSupabase
    .from("professional_profiles")
    .select("specialty")
    .eq("profile_id", user.id)
    .maybeSingle();
  const specialty = professionalProfile?.specialty ?? null;
  const canManageNutrition = canSpecialtyManage(
    profile.role,
    specialty,
    "nutrition",
  );
  const canManageTraining = canSpecialtyManage(
    profile.role,
    specialty,
    "training",
  );

  return {
    adminSupabase,
    canManageNutrition,
    canManageTraining,
    currentUserId: user.id,
    error: null,
    role: profile.role,
    specialty,
  };
}

async function validateAssignableProfessional({
  adminSupabase,
  professionalId,
  service,
}: {
  adminSupabase: AdminSupabase;
  professionalId: string;
  service: "nutrition" | "training";
}) {
  const [{ data: profile }, { data: professionalProfile }] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select("id, role")
      .eq("id", professionalId)
      .maybeSingle(),
    adminSupabase
      .from("professional_profiles")
      .select("profile_id, specialty")
      .eq("profile_id", professionalId)
      .maybeSingle(),
  ]);

  return Boolean(
    profile &&
      PRIVILEGED_ROLES.has(profile.role) &&
      isProfessionalAllowedForService(
        professionalProfile?.specialty ?? null,
        service,
      ),
  );
}

export async function activateClientAccount(
  values: ClientActivationValues,
): Promise<ActivateClientAccountResult> {
  const parsed = clientActivationSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const actor = await getCurrentActivationActor();

  if (actor.error || !actor.adminSupabase || !actor.role) {
    return {
      message: actor.error ?? "No se pudo validar tu sesion.",
      status: "error",
    };
  }

  const needsNutrition = serviceNeeds(parsed.data.serviceType, "nutrition");
  const needsTraining = serviceNeeds(parsed.data.serviceType, "training");

  if (needsNutrition && !actor.canManageNutrition) {
    return {
      message: "No tienes permisos para activar nutricion.",
      status: "error",
    };
  }

  if (needsTraining && !actor.canManageTraining) {
    return {
      message: "No tienes permisos para activar entrenamiento.",
      status: "error",
    };
  }

  const { data: clientProfile, error: clientError } = await actor.adminSupabase
    .from("profiles")
    .select("id, role")
    .eq("id", parsed.data.clientId)
    .maybeSingle();

  if (clientError || !clientProfile || clientProfile.role !== "client") {
    return {
      message: "La cuenta seleccionada no es un cliente valido.",
      status: "error",
    };
  }

  const { data: existingAssignment } = await actor.adminSupabase
    .from("client_profiles")
    .select("assigned_nutritionist_id, assigned_trainer_id")
    .eq("profile_id", parsed.data.clientId)
    .maybeSingle();

  const nutritionistId = parsed.data.assignedNutritionistId || "";
  const trainerId = parsed.data.assignedTrainerId || "";

  if (needsNutrition && !nutritionistId) {
    return {
      fieldErrors: {
        assignedNutritionistId: "Selecciona una nutricionista.",
      },
      message: "Selecciona una nutricionista para activar nutricion.",
      status: "error",
    };
  }

  if (needsTraining && !trainerId) {
    return {
      fieldErrors: {
        assignedTrainerId: "Selecciona una entrenadora.",
      },
      message: "Selecciona una entrenadora para activar entrenamiento.",
      status: "error",
    };
  }

  if (
    needsNutrition &&
    !(await validateAssignableProfessional({
      adminSupabase: actor.adminSupabase,
      professionalId: nutritionistId,
      service: "nutrition",
    }))
  ) {
    return {
      fieldErrors: {
        assignedNutritionistId: "La profesional no tiene especialidad de nutricion.",
      },
      message: "La nutricionista seleccionada no es valida.",
      status: "error",
    };
  }

  if (
    needsTraining &&
    !(await validateAssignableProfessional({
      adminSupabase: actor.adminSupabase,
      professionalId: trainerId,
      service: "training",
    }))
  ) {
    return {
      fieldErrors: {
        assignedTrainerId: "La profesional no tiene especialidad de entrenamiento.",
      },
      message: "La entrenadora seleccionada no es valida.",
      status: "error",
    };
  }

  const assignedNutritionistId = needsNutrition
    ? nutritionistId
    : actor.canManageNutrition
      ? null
      : existingAssignment?.assigned_nutritionist_id ?? null;
  const assignedTrainerId = needsTraining
    ? trainerId
    : actor.canManageTraining
      ? null
      : existingAssignment?.assigned_trainer_id ?? null;

  const { error } = await actor.adminSupabase.from("client_profiles").upsert(
    {
      assigned_nutritionist_id: assignedNutritionistId,
      assigned_trainer_id: assignedTrainerId,
      profile_id: parsed.data.clientId,
    },
    {
      onConflict: "profile_id",
    },
  );

  if (error) {
    return {
      message: "No se pudo guardar la activacion del cliente.",
      status: "error",
    };
  }

  revalidatePath(CLIENTS_PATH);
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(PENDING_PATH);
  revalidatePath("/app", "layout");

  return {
    message: "Cliente actualizado correctamente.",
    status: "success",
  };
}

function canSeeClient(
  client: ClientAccountListItem,
  canManageNutrition: boolean,
  canManageTraining: boolean,
) {
  if (canManageNutrition && canManageTraining) {
    return true;
  }

  if (!client.isClientActivated) {
    return true;
  }

  return (
    (canManageNutrition && client.hasNutritionService) ||
    (canManageTraining && client.hasTrainingService)
  );
}

function emptyClientActivationData(error: string): ClientActivationData {
  return {
    canManageNutrition: false,
    canManageTraining: false,
    clients: [],
    counts: {
      active: 0,
      all: 0,
      both: 0,
      none: 0,
      nutrition: 0,
      pending: 0,
      training: 0,
    },
    currentUserId: "",
    error,
    nutritionists: [],
    trainers: [],
  };
}

function buildCounts(clients: ClientAccountListItem[]) {
  return {
    active: clients.filter((client) => client.isClientActivated).length,
    all: clients.length,
    both: clients.filter((client) => client.serviceType === "both").length,
    none: clients.filter((client) => !client.isClientActivated).length,
    nutrition: clients.filter((client) => client.serviceType === "nutrition")
      .length,
    pending: clients.filter((client) => !client.isClientActivated).length,
    training: clients.filter((client) => client.serviceType === "training")
      .length,
  } satisfies Record<ClientAccountsFilter, number>;
}

export async function listClientActivationData(
  rawFilter?: string | null,
): Promise<ClientActivationData> {
  const filter = normalizeFilter(rawFilter);
  const actor = await getCurrentActivationActor();

  if (actor.error || !actor.adminSupabase) {
    return emptyClientActivationData(actor.error ?? "No se pudo validar tu sesion.");
  }

  if (!actor.canManageNutrition && !actor.canManageTraining) {
    return emptyClientActivationData(
      "Tu perfil administrativo no tiene permisos de nutricion ni entrenamiento.",
    );
  }

  const [
    { data: clientProfiles, error: clientsError },
    { data: clientAssignments },
    { data: professionalRows },
    { data: authUsers },
  ] = await Promise.all([
    actor.adminSupabase
      .from("profiles")
      .select("id, full_name, created_at, role")
      .eq("role", "client")
      .order("created_at", { ascending: false }),
    actor.adminSupabase
      .from("client_profiles")
      .select("profile_id, assigned_nutritionist_id, assigned_trainer_id"),
    actor.adminSupabase
      .from("professional_profiles")
      .select("profile_id, specialty"),
    actor.adminSupabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  if (clientsError) {
    return emptyClientActivationData("No se pudo cargar la lista de clientes.");
  }

  const professionals = (professionalRows ?? []).filter(
    (item): item is Pick<
      Tables<"professional_profiles">,
      "profile_id" | "specialty"
    > & { specialty: ProfessionalSpecialty } => Boolean(item.specialty),
  );
  const professionalIds = professionals.map((item) => item.profile_id);
  const { data: professionalProfiles } = professionalIds.length
    ? await actor.adminSupabase
        .from("profiles")
        .select("id, full_name, role")
        .in("id", professionalIds)
    : { data: [] };
  const profileById = new Map(
    (professionalProfiles ?? []).map((profile) => [profile.id, profile]),
  );
  const emailById = new Map(
    (authUsers?.users ?? []).map((user) => [user.id, user.email ?? ""]),
  );
  const professionalNameById = new Map(
    professionals.map((item) => {
      const profile = profileById.get(item.profile_id);
      return [item.profile_id, profile?.full_name ?? "Profesional sin nombre"];
    }),
  );
  const assignmentsByClientId = new Map(
    (clientAssignments ?? []).map((assignment) => [
      assignment.profile_id,
      assignment,
    ]),
  );
  const assignableProfessionals = professionals
    .map((item) => {
      const profile = profileById.get(item.profile_id);

      if (!profile || !PRIVILEGED_ROLES.has(profile.role)) {
        return null;
      }

      return {
        email: emailById.get(item.profile_id) ?? "",
        fullName: profile.full_name ?? "Profesional sin nombre",
        id: item.profile_id,
        specialty: item.specialty,
      } satisfies AssignableProfessional;
    })
    .filter(Boolean) as AssignableProfessional[];

  const allClients = (clientProfiles ?? []).map((profile) => {
    const assignment = assignmentsByClientId.get(profile.id);
    const assignedNutritionistId =
      assignment?.assigned_nutritionist_id ?? null;
    const assignedTrainerId = assignment?.assigned_trainer_id ?? null;
    const hasNutritionService = assignedNutritionistId !== null;
    const hasTrainingService = assignedTrainerId !== null;

    return {
      assignedNutritionistId,
      assignedNutritionistName: assignedNutritionistId
        ? professionalNameById.get(assignedNutritionistId) ?? null
        : null,
      assignedTrainerId,
      assignedTrainerName: assignedTrainerId
        ? professionalNameById.get(assignedTrainerId) ?? null
        : null,
      clientProfileExists: Boolean(assignment),
      createdAt: profile.created_at,
      email: emailById.get(profile.id) ?? "",
      fullName: profile.full_name ?? "Cliente sin nombre",
      hasNutritionService,
      hasTrainingService,
      id: profile.id,
      isClientActivated: hasNutritionService || hasTrainingService,
      serviceType: getServiceType({
        hasNutritionService,
        hasTrainingService,
      }),
    } satisfies ClientAccountListItem;
  });
  const visibleClients = allClients.filter((client) =>
    canSeeClient(client, actor.canManageNutrition, actor.canManageTraining),
  );
  const counts = buildCounts(visibleClients);

  return {
    canManageNutrition: actor.canManageNutrition,
    canManageTraining: actor.canManageTraining,
    clients: visibleClients.filter((client) => matchesFilter(client, filter)),
    counts,
    currentUserId: actor.currentUserId,
    nutritionists: assignableProfessionals.filter((professional) =>
      isProfessionalAllowedForService(professional.specialty, "nutrition"),
    ),
    trainers: assignableProfessionals.filter((professional) =>
      isProfessionalAllowedForService(professional.specialty, "training"),
    ),
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/lib/validations/auth";
import type { Enums } from "@/types/database";

const DASHBOARD_PATH = "/app/dashboard";
const DEFAULT_PROFILE_ROLE = "client" satisfies ProfileRole;

type AuthFieldErrors = Partial<Record<keyof RegisterValues, string>>;
type ProfileRole = Enums<"profile_role">;

export type AuthActionResult =
  | {
      status: "success";
      message: string;
      redirectTo: string;
    }
  | {
      status: "email_confirmation_required";
      message: string;
    }
  | {
      status: "error";
      message: string;
      fieldErrors?: AuthFieldErrors;
    };

function getFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ]),
  ) as AuthFieldErrors;
}

function getLoginErrorMessage(message: string, code?: string) {
  const normalized = `${code ?? ""} ${message}`.toLowerCase();

  if (
    normalized.includes("invalid_credentials") ||
    normalized.includes("invalid login credentials")
  ) {
    return "El email o la contrasena no son correctos.";
  }

  if (
    normalized.includes("email_not_confirmed") ||
    normalized.includes("email not confirmed")
  ) {
    return "Tu email aun no esta confirmado. Revisa tu correo antes de entrar.";
  }

  if (normalized.includes("missing supabase")) {
    return "Faltan variables de entorno de Supabase.";
  }

  return "No se pudo iniciar sesion. Intentalo de nuevo.";
}

function getRegisterErrorMessage(message: string, code?: string) {
  const normalized = `${code ?? ""} ${message}`.toLowerCase();

  if (
    normalized.includes("user_already_exists") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists")
  ) {
    return "Ya existe una cuenta con este email. Inicia sesion para continuar.";
  }

  if (
    normalized.includes("weak_password") ||
    normalized.includes("password")
  ) {
    return "La contrasena no cumple los requisitos de seguridad.";
  }

  if (normalized.includes("signup") && normalized.includes("disabled")) {
    return "El registro esta deshabilitado en Supabase.";
  }

  if (normalized.includes("missing supabase")) {
    return "Faltan variables de entorno de Supabase.";
  }

  return "No se pudo crear la cuenta. Intentalo de nuevo.";
}

async function getEmailRedirectTo() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return `${origin}/auth/confirm`;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) {
    return undefined;
  }

  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}/auth/confirm`;
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  fullName?: string | null,
  role: ProfileRole = DEFAULT_PROFILE_ROLE,
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      full_name: fullName?.trim() || null,
      id: userId,
      role,
    },
    {
      ignoreDuplicates: true,
      onConflict: "id",
    },
  );

  return error;
}

function getMetadataRole(metadata: Record<string, unknown>): ProfileRole {
  return metadata.role === "professional" || metadata.role === "client"
    ? metadata.role
    : DEFAULT_PROFILE_ROLE;
}

export async function loginProfessional(
  values: LoginValues,
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return {
        message: getLoginErrorMessage(error.message, error.code),
        status: "error",
      };
    }

    if (!data.user) {
      return {
        message: "No se pudo confirmar la sesion. Intentalo de nuevo.",
        status: "error",
      };
    }

    const profileError = await ensureProfile(
      supabase,
      data.user.id,
      typeof data.user.user_metadata.full_name === "string"
        ? data.user.user_metadata.full_name
        : null,
      getMetadataRole(data.user.user_metadata),
    );

    if (profileError) {
      return {
        message:
          "Sesion iniciada, pero no se pudo preparar tu perfil. Intentalo de nuevo.",
        status: "error",
      };
    }

    revalidatePath("/", "layout");

    return {
      message: "Sesion iniciada.",
      redirectTo: DASHBOARD_PATH,
      status: "success",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? getLoginErrorMessage(error.message)
        : "No se pudo iniciar sesion. Intentalo de nuevo.";

    return {
      message,
      status: "error",
    };
  }
}

export async function registerProfessional(
  values: RegisterValues,
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const expectedCode = process.env.REGISTER_ACCESS_CODE?.trim();

  if (!expectedCode) {
    return {
      message:
        "Configura REGISTER_ACCESS_CODE antes de permitir nuevos registros.",
      status: "error",
    };
  }

  if (parsed.data.accessCode !== expectedCode) {
    return {
      fieldErrors: {
        accessCode: "Codigo de acceso invalido.",
      },
      message: "Codigo de acceso invalido.",
      status: "error",
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      options: {
        data: {
          full_name: parsed.data.fullName,
          role: parsed.data.role,
        },
        emailRedirectTo: await getEmailRedirectTo(),
      },
      password: parsed.data.password,
    });

    if (error) {
      return {
        message: getRegisterErrorMessage(error.message, error.code),
        status: "error",
      };
    }

    if (data.user?.identities && data.user.identities.length === 0) {
      return {
        message:
          "Ya existe una cuenta con este email. Inicia sesion para continuar.",
        status: "error",
      };
    }

    if (data.session && data.user) {
      const profileError = await ensureProfile(
        supabase,
        data.user.id,
        parsed.data.fullName,
        parsed.data.role,
      );

      if (profileError) {
        return {
          message:
            "La cuenta se creo, pero no se pudo preparar tu perfil. Intenta iniciar sesion.",
          status: "error",
        };
      }

      revalidatePath("/", "layout");

      return {
        message: "Cuenta creada.",
        redirectTo: DASHBOARD_PATH,
        status: "success",
      };
    }

    return {
      message:
        "Cuenta creada. Revisa tu correo para confirmar el email antes de iniciar sesion.",
      status: "email_confirmation_required",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? getRegisterErrorMessage(error.message)
        : "No se pudo crear la cuenta. Intentalo de nuevo.";

    return {
      message,
      status: "error",
    };
  }
}

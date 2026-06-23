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

const APP_PATH = "/app";
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
    return "El email o la contraseña no son correctos.";
  }

  if (
    normalized.includes("email_not_confirmed") ||
    normalized.includes("email not confirmed")
  ) {
    return "Tu email aún no está confirmado. Revisa tu correo antes de entrar.";
  }

  if (normalized.includes("missing supabase")) {
    return "El servicio de acceso no está disponible en este momento.";
  }

  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
}

function getRegisterErrorMessage(message: string, code?: string) {
  const normalized = `${code ?? ""} ${message}`.toLowerCase();

  if (
    normalized.includes("user_already_exists") ||
    normalized.includes("already registered") ||
    normalized.includes("already exists")
  ) {
    return "Ya existe una cuenta con este email. Inicia sesión para continuar.";
  }

  if (
    normalized.includes("weak_password") ||
    normalized.includes("password")
  ) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }

  if (normalized.includes("signup") && normalized.includes("disabled")) {
    return "El registro no está disponible en este momento.";
  }

  if (normalized.includes("missing supabase")) {
    return "El servicio de acceso no está disponible en este momento.";
  }

  return "No se pudo crear la cuenta. Inténtalo de nuevo.";
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
        message: "No se pudo confirmar la sesión. Inténtalo de nuevo.",
        status: "error",
      };
    }

    const profileError = await ensureProfile(
      supabase,
      data.user.id,
      typeof data.user.user_metadata.full_name === "string"
        ? data.user.user_metadata.full_name
        : null,
    );

    if (profileError) {
      return {
        message:
          "Sesión iniciada, pero no se pudo preparar tu perfil. Inténtalo de nuevo.",
        status: "error",
      };
    }

    const [{ data: profile }, { data: professionalProfile }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle(),
        supabase
          .from("professional_profiles")
          .select("is_active")
          .eq("profile_id", data.user.id)
          .maybeSingle(),
      ]);

    if (
      profile?.role === "professional" &&
      professionalProfile?.is_active !== true
    ) {
      await supabase.auth.signOut();

      return {
        message:
          "Tu cuenta profesional esta inactiva. Contacta al administrador universal.",
        status: "error",
      };
    }

    revalidatePath("/", "layout");

    return {
      message: "Sesión iniciada.",
      redirectTo: APP_PATH,
      status: "success",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? getLoginErrorMessage(error.message)
        : "No se pudo iniciar sesión. Inténtalo de nuevo.";

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
      message: "El registro de nuevas cuentas no está disponible en este momento.",
      status: "error",
    };
  }

  if (parsed.data.accessCode !== expectedCode) {
    return {
      fieldErrors: {
        accessCode: "Código de acceso inválido.",
      },
      message: "Código de acceso inválido.",
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
          "Ya existe una cuenta con este email. Inicia sesión para continuar.",
        status: "error",
      };
    }

    if (data.session && data.user) {
      const profileError = await ensureProfile(
        supabase,
        data.user.id,
        parsed.data.fullName,
      );

      if (profileError) {
        return {
          message:
            "La cuenta se creó, pero no se pudo preparar tu perfil. Intenta iniciar sesión.",
          status: "error",
        };
      }

      revalidatePath("/", "layout");

      return {
        message: "Cuenta creada.",
        redirectTo: APP_PATH,
        status: "success",
      };
    }

    return {
      message:
        "Cuenta creada. Revisa tu correo para confirmar el email antes de iniciar sesión.",
      status: "email_confirmation_required",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? getRegisterErrorMessage(error.message)
        : "No se pudo crear la cuenta. Inténtalo de nuevo.";

    return {
      message,
      status: "error",
    };
  }
}

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  updateBasicAccountSchema,
  type UpdateBasicAccountValues,
} from "@/lib/validations/account";
import {
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/lib/validations/personal-details";

type AccountFieldErrors = Partial<Record<keyof UpdateBasicAccountValues, string>>;

export type UpdateBasicAccountResult =
  | {
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: AccountFieldErrors;
      message: string;
      status: "error";
    };

type PersonalDetailsFieldErrors = Partial<
  Record<keyof PersonalDetailsValues, string>
>;

export type PersonalDetailsActionResult =
  | {
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: PersonalDetailsFieldErrors;
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
  ) as AccountFieldErrors;
}

function getPersonalDetailsFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ]),
  ) as PersonalDetailsFieldErrors;
}

function nullableText(value: string) {
  const normalized = value.trim();

  return normalized || null;
}

function nullableNumber(value: string) {
  const normalized = value.trim();

  return normalized ? Number(normalized.replace(",", ".")) : null;
}

function revalidateAccountPaths() {
  revalidatePath("/app/pending");
  revalidatePath("/app/configuracion");
  revalidatePath("/app", "layout");
}

export async function updateBasicAccount(
  values: UpdateBasicAccountValues,
): Promise<UpdateBasicAccountResult> {
  const parsed = updateBasicAccountSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: "Debes iniciar sesion para actualizar tu cuenta.",
      status: "error",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
    })
    .eq("id", user.id);

  if (error) {
    return {
      message: "No se pudo actualizar tu nombre. Intentalo de nuevo.",
      status: "error",
    };
  }

  revalidateAccountPaths();

  return {
    message: "Cuenta actualizada correctamente.",
    status: "success",
  };
}

export async function updatePersonalDetails(
  values: PersonalDetailsValues,
): Promise<PersonalDetailsActionResult> {
  const parsed = personalDetailsSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getPersonalDetailsFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: "Debes iniciar sesion para actualizar tu informacion.",
      status: "error",
    };
  }

  const details = {
    birth_date: nullableText(parsed.data.birthDate),
    gender: nullableText(parsed.data.gender),
    gender_description:
      parsed.data.gender === "self_described"
        ? nullableText(parsed.data.genderDescription)
        : null,
    height_cm: nullableNumber(parsed.data.heightCm),
    medical_conditions: nullableText(parsed.data.medicalConditions),
    phone: nullableText(parsed.data.phone),
    weight_kg: nullableNumber(parsed.data.weightKg),
  };
  const hasDetails = Object.values(details).some((value) => value !== null);

  const { error } = hasDetails
    ? await supabase.from("profile_personal_details").upsert(
        {
          ...details,
          profile_id: user.id,
        },
        { onConflict: "profile_id" },
      )
    : await supabase
        .from("profile_personal_details")
        .delete()
        .eq("profile_id", user.id);

  if (error) {
    return {
      message:
        "No se pudo guardar tu informacion personal. Revisa los datos e intentalo de nuevo.",
      status: "error",
    };
  }

  revalidateAccountPaths();

  return {
    message: hasDetails
      ? "Informacion personal actualizada."
      : "Informacion personal eliminada.",
    status: "success",
  };
}

export async function deletePersonalDetails(): Promise<PersonalDetailsActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: "Debes iniciar sesion para eliminar tu informacion.",
      status: "error",
    };
  }

  const { error } = await supabase
    .from("profile_personal_details")
    .delete()
    .eq("profile_id", user.id);

  if (error) {
    return {
      message: "No se pudo eliminar tu informacion personal.",
      status: "error",
    };
  }

  revalidateAccountPaths();

  return {
    message: "Informacion personal eliminada.",
    status: "success",
  };
}

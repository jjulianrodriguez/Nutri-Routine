"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  updateBasicAccountSchema,
  type UpdateBasicAccountValues,
} from "@/lib/validations/account";

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

  revalidatePath("/app/pending");
  revalidatePath("/app/configuracion");
  revalidatePath("/app", "layout");

  return {
    message: "Cuenta actualizada correctamente.",
    status: "success",
  };
}

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  resourceDeleteSchema,
  resourceValuesSchema,
  updateResourceValuesSchema,
  type ResourceValues,
  type UpdateResourceValues,
} from "@/lib/validations/resources";

const RESOURCES_PATH = "/app/recursos";
const DASHBOARD_PATH = "/app/dashboard";

type ResourceFieldErrors = Partial<Record<keyof ResourceValues, string>>;

export type ResourceActionResult =
  | {
      id?: string;
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: ResourceFieldErrors;
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
  ) as ResourceFieldErrors;
}

function revalidateResourcePaths() {
  revalidatePath(RESOURCES_PATH);
  revalidatePath(DASHBOARD_PATH);
}

async function getResourceAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Debes iniciar sesion para administrar recursos.",
      supabase,
      user: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return {
      error: "No tienes permisos de administrador para gestionar recursos.",
      supabase,
      user: null,
    };
  }

  return {
    error: null,
    supabase,
    user,
  };
}

export async function createResource(
  values: ResourceValues,
): Promise<ResourceActionResult> {
  const parsed = resourceValuesSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const context = await getResourceAdminContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resources")
    .insert({
      area: parsed.data.area,
      description: parsed.data.description || null,
      file_url: parsed.data.url,
      title: parsed.data.title,
      uploaded_by: context.user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      message: "No se pudo crear el recurso. Intentalo de nuevo.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Recurso creado correctamente.",
    status: "success",
  };
}

export async function updateResource(
  values: UpdateResourceValues,
): Promise<ResourceActionResult> {
  const parsed = updateResourceValuesSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const context = await getResourceAdminContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resources")
    .update({
      area: parsed.data.area,
      description: parsed.data.description || null,
      file_url: parsed.data.url,
      title: parsed.data.title,
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo actualizar el recurso. Intentalo de nuevo.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Recurso actualizado correctamente.",
    status: "success",
  };
}

export async function deleteResource(
  id: string,
): Promise<ResourceActionResult> {
  const parsed = resourceDeleteSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "El recurso seleccionado no es valido.",
      status: "error",
    };
  }

  const context = await getResourceAdminContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resources")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo eliminar el recurso.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Recurso eliminado definitivamente.",
    status: "success",
  };
}

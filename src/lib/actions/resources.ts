"use server";

import { revalidatePath } from "next/cache";

import { canManageResourceArea } from "@/lib/auth/access-rules";
import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
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

async function getResourceManagerContext() {
  const supabase = await createClient();
  const access = await getCurrentUserAccess();

  if (!access) {
    return {
      access: null,
      error: "Debes iniciar sesión para gestionar recursos.",
      supabase,
    };
  }

  if (!access.canManageResources) {
    return {
      access: null,
      error: "No tienes permisos para gestionar recursos.",
      supabase,
    };
  }

  return {
    access,
    error: null,
    supabase,
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

  const context = await getResourceManagerContext();

  if (context.error || !context.access) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, parsed.data.area)) {
    return {
      message: "No tienes permisos para crear recursos en esta área.",
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
      uploaded_by: context.access.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      message: "No se pudo crear el recurso. Inténtalo de nuevo.",
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

  const context = await getResourceManagerContext();

  if (context.error || !context.access) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, parsed.data.area)) {
    return {
      message: "No tienes permisos para mover recursos a esta área.",
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
      message: "No se pudo actualizar el recurso. Inténtalo de nuevo.",
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
      message: "El recurso seleccionado no es válido.",
      status: "error",
    };
  }

  const context = await getResourceManagerContext();

  if (context.error || !context.access) {
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

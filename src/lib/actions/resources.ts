"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { canManageResourceArea } from "@/lib/auth/access-rules";
import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import { RESOURCE_PDF_BUCKET, RESOURCE_PDF_SIGNED_URL_SECONDS } from "@/lib/resources/constants";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getResourcePdfValidationError,
  pdfResourceUpdateValuesSchema,
  pdfResourceUploadValuesSchema,
  resourceDeleteSchema,
  resourceFolderValuesSchema,
  resourceSignedUrlSchema,
  resourceValuesSchema,
  updateResourceFolderValuesSchema,
  updateResourceValuesSchema,
  type ResourceFolderValues,
  type ResourceValues,
  type UpdateResourceFolderValues,
  type UpdateResourceValues,
} from "@/lib/validations/resources";
import type { Enums, Tables } from "@/types/database";

const RESOURCES_PATH = "/app/recursos";
const DASHBOARD_PATH = "/app/dashboard";

type ResourceStatus = Enums<"resource_status">;
type ResourceRow = Tables<"resources">;
type ResourceFolderRow = Tables<"resource_folders">;
type ResourceFieldErrors = Record<string, string | undefined>;

export type ResourceActionResult =
  | {
      id?: string;
      message: string;
      signedUrl?: string;
      status: "success";
    }
  | {
      fieldErrors?: ResourceFieldErrors;
      message: string;
      status: "error";
    };

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getOptionalFile(formData: FormData) {
  const value = formData.get("file");

  if (value instanceof File && value.size > 0) {
    return value;
  }

  return null;
}

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

function logQueryError(label: string, error: unknown) {
  const e = error as Record<string, unknown> | null;
  const message = typeof e?.message === "string" ? e.message : "Error desconocido";

  console.error(`${label}: ${message}`, {
    code: e?.code,
    details: e?.details,
    hint: e?.hint,
    message: e?.message,
    name: e?.name,
  });
}

function revalidateResourcePaths() {
  revalidatePath(RESOURCES_PATH);
  revalidatePath(DASHBOARD_PATH);
}

async function getResourceManagerContext() {
  const [access, supabase] = await Promise.all([
    getCurrentUserAccess(),
    createClient(),
  ]);

  if (!access) {
    return {
      access: null,
      error: "Debes iniciar sesion para gestionar recursos.",
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

async function validateFolderForResource({
  area,
  folderId,
  supabase,
}: {
  area: Enums<"service_area">;
  folderId: string | undefined;
  supabase: Awaited<ReturnType<typeof createClient>>;
}) {
  if (!folderId) {
    return {
      folder: null,
      ok: true,
    };
  }

  const { data, error } = await supabase
    .from("resource_folders")
    .select("id, area, active")
    .eq("id", folderId)
    .maybeSingle<Pick<ResourceFolderRow, "active" | "area" | "id">>();

  if (error || !data) {
    return {
      error: "La carpeta seleccionada no existe o no esta disponible.",
      folder: null,
      ok: false,
    };
  }

  if (!data.active) {
    return {
      error: "La carpeta seleccionada esta desactivada.",
      folder: null,
      ok: false,
    };
  }

  if (data.area !== area) {
    return {
      error: "La carpeta seleccionada pertenece a otra area.",
      folder: null,
      ok: false,
    };
  }

  return {
    folder: data,
    ok: true,
  };
}

async function uploadResourcePdf({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) {
  if (!hasSupabaseAdminConfig()) {
    return {
      error:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY en el servidor.",
      storagePath: null,
    };
  }

  const validationError = getResourcePdfValidationError(file);

  if (validationError) {
    return {
      error: validationError,
      storagePath: null,
    };
  }

  const storagePath = `resources/${userId}/${randomUUID()}.pdf`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(RESOURCE_PDF_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    logQueryError("Error al subir PDF a Storage de recursos", error);
    return {
      error: "No se pudo subir el PDF a Supabase Storage.",
      storagePath: null,
    };
  }

  return {
    error: null,
    storagePath,
  };
}

async function removeResourceStorageObject({
  bucket,
  storagePath,
}: {
  bucket: string | null;
  storagePath: string | null;
}) {
  if (!bucket || !storagePath || bucket !== RESOURCE_PDF_BUCKET) {
    return;
  }

  if (!hasSupabaseAdminConfig()) {
    return;
  }

  const admin = createAdminClient();
  await admin.storage.from(bucket).remove([storagePath]);
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
      message: "No tienes permisos para crear recursos en esta area.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resources")
    .insert({
      area: parsed.data.area,
      description: parsed.data.description || null,
      file_url: parsed.data.url,
      kind: "external_link",
      status: "active",
      title: parsed.data.title,
      uploaded_by: context.access.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    logQueryError("Error creando recurso externo", error);
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

  const context = await getResourceManagerContext();

  if (context.error || !context.access) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, parsed.data.area)) {
    return {
      message: "No tienes permisos para mover recursos a esta area.",
      status: "error",
    };
  }

  const { data: currentResource, error: currentError } = await context.supabase
    .from("resources")
    .select("id, kind")
    .eq("id", parsed.data.id)
    .maybeSingle<Pick<ResourceRow, "id" | "kind">>();

  if (currentError || !currentResource) {
    return {
      message: "El recurso seleccionado no existe o no esta disponible.",
      status: "error",
    };
  }

  if (currentResource.kind !== "external_link") {
    return {
      message: "Usa la edicion de PDF para actualizar este recurso.",
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
    logQueryError("Error actualizando recurso externo", error);
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

export async function createResourceFolder(
  values: ResourceFolderValues,
): Promise<ResourceActionResult> {
  const parsed = resourceFolderValuesSchema.safeParse(values);

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
      message: "No tienes permisos para crear carpetas en esta area.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resource_folders")
    .insert({
      active: true,
      area: parsed.data.area,
      created_by: context.access.userId,
      description: parsed.data.description || null,
      name: parsed.data.name,
    })
    .select("id")
    .single();

  if (error || !data) {
    logQueryError("Error creando carpeta de recursos", error);
    return {
      message: "No se pudo crear la carpeta.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Carpeta creada correctamente.",
    status: "success",
  };
}

export async function updateResourceFolder(
  values: UpdateResourceFolderValues,
): Promise<ResourceActionResult> {
  const parsed = updateResourceFolderValuesSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "La carpeta seleccionada no es valida.",
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

  const { data: folder, error: folderError } = await context.supabase
    .from("resource_folders")
    .select("id, area")
    .eq("id", parsed.data.id)
    .maybeSingle<Pick<ResourceFolderRow, "area" | "id">>();

  if (folderError || !folder) {
    return {
      message: "La carpeta seleccionada no existe o no esta disponible.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, folder.area)) {
    return {
      message: "No tienes permisos para editar esta carpeta.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resource_folders")
    .update({
      description: parsed.data.description || null,
      name: parsed.data.name,
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error actualizando carpeta de recursos", error);
    return {
      message: "No se pudo actualizar la carpeta.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Carpeta actualizada correctamente.",
    status: "success",
  };
}

export async function toggleResourceFolderActive(
  id: string,
): Promise<ResourceActionResult> {
  const parsed = resourceDeleteSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "La carpeta seleccionada no es valida.",
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

  const { data: folder, error: folderError } = await context.supabase
    .from("resource_folders")
    .select("id, area, active")
    .eq("id", parsed.data.id)
    .maybeSingle<Pick<ResourceFolderRow, "active" | "area" | "id">>();

  if (folderError || !folder) {
    return {
      message: "La carpeta seleccionada no existe o no esta disponible.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, folder.area)) {
    return {
      message: "No tienes permisos para cambiar esta carpeta.",
      status: "error",
    };
  }

  const newActive = !folder.active;
  const { data, error } = await context.supabase
    .from("resource_folders")
    .update({ active: newActive })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error cambiando estado de carpeta", error);
    return {
      message: "No se pudo cambiar el estado de la carpeta.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: newActive
      ? "Carpeta activada correctamente."
      : "Carpeta desactivada correctamente.",
    status: "success",
  };
}

export async function deleteResourceFolder(
  id: string,
): Promise<ResourceActionResult> {
  const parsed = resourceDeleteSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "La carpeta seleccionada no es valida.",
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

  const { count } = await context.supabase
    .from("resources")
    .select("id", { count: "exact", head: true })
    .eq("folder_id", parsed.data.id);

  if ((count ?? 0) > 0) {
    return {
      message: "Solo puedes eliminar carpetas sin documentos.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resource_folders")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error eliminando carpeta de recursos", error);
    return {
      message: "No se pudo eliminar la carpeta.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Carpeta eliminada correctamente.",
    status: "success",
  };
}

export async function uploadPdfResource(
  formData: FormData,
): Promise<ResourceActionResult> {
  const parsed = pdfResourceUploadValuesSchema.safeParse({
    area: getString(formData, "area"),
    description: getString(formData, "description"),
    folderId: getString(formData, "folderId"),
    title: getString(formData, "title"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const file = getOptionalFile(formData);
  const fileError = getResourcePdfValidationError(file);

  if (fileError || !file) {
    return {
      fieldErrors: { file: fileError ?? "Selecciona un archivo PDF." },
      message: fileError ?? "Selecciona un archivo PDF.",
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
      message: "No tienes permisos para subir PDFs en esta area.",
      status: "error",
    };
  }

  const folderContext = await validateFolderForResource({
    area: parsed.data.area,
    folderId: parsed.data.folderId,
    supabase: context.supabase,
  });

  if (!folderContext.ok) {
    return {
      fieldErrors: { folderId: folderContext.error },
      message: folderContext.error ?? "Carpeta invalida.",
      status: "error",
    };
  }

  const upload = await uploadResourcePdf({
    file,
    userId: context.access.userId,
  });

  if (upload.error || !upload.storagePath) {
    return {
      fieldErrors: { file: upload.error ?? "No se pudo subir el PDF." },
      message: upload.error ?? "No se pudo subir el PDF.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resources")
    .insert({
      area: parsed.data.area,
      description: parsed.data.description || null,
      file_name: file.name,
      file_size: file.size,
      folder_id: parsed.data.folderId ?? null,
      kind: "pdf",
      mime_type: "application/pdf",
      status: "active",
      storage_bucket: RESOURCE_PDF_BUCKET,
      storage_path: upload.storagePath,
      title: parsed.data.title,
      uploaded_by: context.access.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    logQueryError("Error insertando metadata de PDF de recursos", error);
    await removeResourceStorageObject({
      bucket: RESOURCE_PDF_BUCKET,
      storagePath: upload.storagePath,
    });

    return {
      message: "No se pudo guardar la metadata del PDF.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "PDF subido correctamente.",
    status: "success",
  };
}

export async function updatePdfResource(
  formData: FormData,
): Promise<ResourceActionResult> {
  const parsed = pdfResourceUpdateValuesSchema.safeParse({
    area: getString(formData, "area"),
    description: getString(formData, "description"),
    folderId: getString(formData, "folderId"),
    id: getString(formData, "id"),
    title: getString(formData, "title"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const replacementFile = getOptionalFile(formData);
  const replacementFileError = getResourcePdfValidationError(replacementFile);

  if (replacementFileError && replacementFile) {
    return {
      fieldErrors: { file: replacementFileError },
      message: replacementFileError,
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

  const { data: currentResource, error: currentError } = await context.supabase
    .from("resources")
    .select(
      "id, kind, area, folder_id, storage_bucket, storage_path, file_name, file_size, mime_type, legacy_nutrition_document_id",
    )
    .eq("id", parsed.data.id)
    .maybeSingle<
      Pick<
        ResourceRow,
        | "area"
        | "file_name"
        | "file_size"
        | "folder_id"
        | "id"
        | "kind"
        | "legacy_nutrition_document_id"
        | "mime_type"
        | "storage_bucket"
        | "storage_path"
      >
    >();

  if (currentError || !currentResource) {
    return {
      message: "El recurso seleccionado no existe o no esta disponible.",
      status: "error",
    };
  }

  if (currentResource.kind !== "pdf") {
    return {
      message: "Usa la edicion de enlace para actualizar este recurso.",
      status: "error",
    };
  }

  if (
    !canManageResourceArea(context.access, currentResource.area) ||
    !canManageResourceArea(context.access, parsed.data.area)
  ) {
    return {
      message: "No tienes permisos para mover este PDF a esa area.",
      status: "error",
    };
  }

  const folderContext = await validateFolderForResource({
    area: parsed.data.area,
    folderId: parsed.data.folderId,
    supabase: context.supabase,
  });

  if (!folderContext.ok) {
    return {
      fieldErrors: { folderId: folderContext.error },
      message: folderContext.error ?? "Carpeta invalida.",
      status: "error",
    };
  }

  let nextStorageBucket = currentResource.storage_bucket;
  let nextStoragePath = currentResource.storage_path;
  let nextFileName = currentResource.file_name;
  let nextFileSize = currentResource.file_size;

  if (replacementFile) {
    const upload = await uploadResourcePdf({
      file: replacementFile,
      userId: context.access.userId,
    });

    if (upload.error || !upload.storagePath) {
      return {
        fieldErrors: { file: upload.error ?? "No se pudo subir el PDF." },
        message: upload.error ?? "No se pudo subir el PDF.",
        status: "error",
      };
    }

    nextStorageBucket = RESOURCE_PDF_BUCKET;
    nextStoragePath = upload.storagePath;
    nextFileName = replacementFile.name;
    nextFileSize = replacementFile.size;
  }

  const { data, error } = await context.supabase
    .from("resources")
    .update({
      area: parsed.data.area,
      description: parsed.data.description || null,
      file_name: nextFileName,
      file_size: nextFileSize,
      folder_id: parsed.data.folderId ?? null,
      mime_type: "application/pdf",
      storage_bucket: nextStorageBucket,
      storage_path: nextStoragePath,
      title: parsed.data.title,
    })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error actualizando PDF de recursos", error);
    if (replacementFile) {
      await removeResourceStorageObject({
        bucket: nextStorageBucket,
        storagePath: nextStoragePath,
      });
    }

    return {
      message: "No se pudo actualizar el PDF.",
      status: "error",
    };
  }

  if (replacementFile && !currentResource.legacy_nutrition_document_id) {
    await removeResourceStorageObject({
      bucket: currentResource.storage_bucket,
      storagePath: currentResource.storage_path,
    });
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "PDF actualizado correctamente.",
    status: "success",
  };
}

export async function createResourceSignedUrl(
  id: string,
  options: { download?: boolean } = {},
): Promise<ResourceActionResult> {
  const parsed = resourceSignedUrlSchema.safeParse({
    download: options.download,
    id,
  });

  if (!parsed.success) {
    return {
      message: "El recurso seleccionado no es valido.",
      status: "error",
    };
  }

  if (!hasSupabaseAdminConfig()) {
    return {
      message:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY en el servidor.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const { data: resource, error } = await supabase
    .from("resources")
    .select("id, kind, storage_bucket, storage_path")
    .eq("id", parsed.data.id)
    .maybeSingle<
      Pick<ResourceRow, "id" | "kind" | "storage_bucket" | "storage_path">
    >();

  if (error || !resource || resource.kind !== "pdf") {
    return {
      message: "No tienes acceso a este PDF.",
      status: "error",
    };
  }

  if (!resource.storage_bucket || !resource.storage_path) {
    return {
      message: "El PDF no tiene archivo asociado.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const signedUrlOptions = parsed.data.download ? { download: true } : undefined;
  const { data, error: signedUrlError } = await admin.storage
    .from(resource.storage_bucket)
    .createSignedUrl(
      resource.storage_path,
      RESOURCE_PDF_SIGNED_URL_SECONDS,
      signedUrlOptions,
    );

  if (signedUrlError || !data?.signedUrl) {
    logQueryError("Error creando signed URL de PDF de recursos", signedUrlError);
    return {
      message: "No se pudo crear el enlace seguro del PDF.",
      status: "error",
    };
  }

  return {
    id: resource.id,
    message: "Enlace seguro creado correctamente.",
    signedUrl: data.signedUrl,
    status: "success",
  };
}

async function setResourceStatus(
  id: string,
  status: ResourceStatus,
): Promise<ResourceActionResult> {
  const parsed = resourceDeleteSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "El recurso seleccionado no es valido.",
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

  const { data: resource, error: resourceError } = await context.supabase
    .from("resources")
    .select("id, area")
    .eq("id", parsed.data.id)
    .maybeSingle<Pick<ResourceRow, "area" | "id">>();

  if (resourceError || !resource) {
    return {
      message: "El recurso seleccionado no existe o no esta disponible.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, resource.area)) {
    return {
      message: "No tienes permisos para cambiar este recurso.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("resources")
    .update({ status })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error cambiando estado de recurso", error);
    return {
      message: "No se pudo cambiar el estado del recurso.",
      status: "error",
    };
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message:
      status === "active"
        ? "Recurso activado correctamente."
        : "Recurso desactivado correctamente.",
    status: "success",
  };
}

export async function activateResource(id: string) {
  return setResourceStatus(id, "active");
}

export async function deactivateResource(id: string) {
  return setResourceStatus(id, "inactive");
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

  const context = await getResourceManagerContext();

  if (context.error || !context.access) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const { data: resource, error: resourceError } = await context.supabase
    .from("resources")
    .select("id, area, kind, storage_bucket, storage_path, legacy_nutrition_document_id")
    .eq("id", parsed.data.id)
    .maybeSingle<
      Pick<
        ResourceRow,
        | "area"
        | "id"
        | "kind"
        | "legacy_nutrition_document_id"
        | "storage_bucket"
        | "storage_path"
      >
    >();

  if (resourceError || !resource) {
    return {
      message: "El recurso seleccionado no existe o no esta disponible.",
      status: "error",
    };
  }

  if (!canManageResourceArea(context.access, resource.area)) {
    return {
      message: "No tienes permisos para eliminar este recurso.",
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
    logQueryError("Error eliminando recurso", error);
    return {
      message: "No se pudo eliminar el recurso.",
      status: "error",
    };
  }

  if (resource.kind === "pdf" && !resource.legacy_nutrition_document_id) {
    await removeResourceStorageObject({
      bucket: resource.storage_bucket,
      storagePath: resource.storage_path,
    });
  }

  revalidateResourcePaths();

  return {
    id: data.id,
    message: "Recurso eliminado correctamente.",
    status: "success",
  };
}

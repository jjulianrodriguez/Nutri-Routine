"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import {
  NUTRITION_PDF_BUCKET,
  NUTRITION_PDF_SIGNED_URL_SECONDS,
} from "@/lib/nutrition-documents/constants";
import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  educationalUploadValuesSchema,
  getPdfValidationError,
  mealPlanUploadValuesSchema,
  nutritionDocumentIdSchema,
  nutritionDocumentUpdateValuesSchema,
  nutritionFolderIdSchema,
  nutritionFolderValuesSchema,
} from "@/lib/validations/nutrition-documents";
import type { Enums, Tables } from "@/types/database";

const NUTRITION_PATH = "/app/nutricion";
const DASHBOARD_PATH = "/app/dashboard";

type NutritionDocumentActionResult =
  | {
      id?: string;
      message: string;
      signedUrl?: string;
      status: "success";
    }
  | {
      fieldErrors?: Record<string, string | undefined>;
      message: string;
      status: "error";
    };

type NutritionDocumentRow = Tables<"nutrition_documents">;

function revalidateNutritionPaths() {
  revalidatePath(NUTRITION_PATH);
  revalidatePath(DASHBOARD_PATH);
}

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
  );
}

async function getManagerContext() {
  const [access, supabase] = await Promise.all([
    getCurrentUserAccess(),
    createClient(),
  ]);

  if (!access) {
    return {
      access: null,
      error: "Debes iniciar sesion para gestionar documentos.",
      supabase,
    };
  }

  if (!access.canManageNutrition) {
    return {
      access: null,
      error: "No tienes permisos para gestionar documentos de nutricion.",
      supabase,
    };
  }

  return {
    access,
    error: null,
    supabase,
  };
}

async function assertCanManageClient(clientId: string) {
  const context = await getManagerContext();

  if (context.error || !context.access) {
    return {
      ...context,
      error: context.error ?? "No se pudo validar tu cuenta.",
      ok: false,
    };
  }

  if (context.access.isAdmin) {
    return {
      ...context,
      ok: true,
    };
  }

  const { data, error } = await context.supabase
    .from("client_profiles")
    .select("profile_id")
    .eq("profile_id", clientId)
    .eq("assigned_nutritionist_id", context.access.userId)
    .maybeSingle();

  if (error || !data) {
    return {
      ...context,
      error: "Solo puedes asignar PDFs a clientas de nutricion vinculadas a tu cuenta.",
      ok: false,
    };
  }

  return {
    ...context,
    ok: true,
  };
}

async function validateFolder(folderId: string) {
  const context = await getManagerContext();

  if (context.error || !context.access) {
    return {
      ...context,
      error: context.error ?? "No se pudo validar tu cuenta.",
      ok: false,
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_document_folders")
    .select("id, active")
    .eq("id", folderId)
    .maybeSingle();

  if (error || !data) {
    return {
      ...context,
      error: "La carpeta seleccionada no existe o no esta disponible.",
      ok: false,
    };
  }

  if (!data.active) {
    return {
      ...context,
      error: "La carpeta seleccionada esta desactivada.",
      ok: false,
    };
  }

  return {
    ...context,
    ok: true,
  };
}

async function uploadPdf({
  documentType,
  file,
  ownerId,
}: {
  documentType: Enums<"nutrition_document_type">;
  file: File;
  ownerId: string;
}) {
  if (!hasSupabaseAdminConfig()) {
    return {
      error:
        "Falta configurar SUPABASE_SERVICE_ROLE_KEY o SUPABASE_SECRET_KEY en el servidor.",
      storagePath: null,
    };
  }

  const validationError = getPdfValidationError(file);

  if (validationError) {
    return {
      error: validationError,
      storagePath: null,
    };
  }

  const folder = documentType === "meal_plan" ? "meal-plans" : "library";
  const storagePath = `${folder}/${ownerId}/${randomUUID()}.pdf`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(NUTRITION_PDF_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
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

async function removeStorageObject(storagePath: string | null) {
  if (!storagePath || !hasSupabaseAdminConfig()) {
    return;
  }

  const admin = createAdminClient();
  await admin.storage.from(NUTRITION_PDF_BUCKET).remove([storagePath]);
}

export async function createNutritionFolder(
  values: unknown,
): Promise<NutritionDocumentActionResult> {
  const parsed = nutritionFolderValuesSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const context = await getManagerContext();

  if (context.error || !context.access) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_document_folders")
    .insert({
      created_by: context.access.userId,
      name: parsed.data.name,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      message: "No se pudo crear la carpeta educativa.",
      status: "error",
    };
  }

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Carpeta creada correctamente.",
    status: "success",
  };
}

export async function updateNutritionFolder(
  values: unknown,
): Promise<NutritionDocumentActionResult> {
  const parsed = nutritionFolderValuesSchema.safeParse(values);

  if (!parsed.success || !parsed.data.id) {
    return {
      fieldErrors: parsed.success ? undefined : getFieldErrors(parsed.error),
      message: "La carpeta seleccionada no es valida.",
      status: "error",
    };
  }

  const context = await getManagerContext();

  if (context.error) {
    return {
      message: context.error,
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_document_folders")
    .update({ name: parsed.data.name })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo actualizar la carpeta.",
      status: "error",
    };
  }

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Carpeta actualizada correctamente.",
    status: "success",
  };
}

export async function deleteNutritionFolder(
  id: string,
): Promise<NutritionDocumentActionResult> {
  const parsed = nutritionFolderIdSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "La carpeta seleccionada no es valida.",
      status: "error",
    };
  }

  const context = await getManagerContext();

  if (context.error) {
    return {
      message: context.error,
      status: "error",
    };
  }

  const { count } = await context.supabase
    .from("nutrition_documents")
    .select("id", { count: "exact", head: true })
    .eq("folder_id", parsed.data.id);

  if ((count ?? 0) > 0) {
    return {
      message: "Solo puedes eliminar carpetas sin documentos.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_document_folders")
    .delete()
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo eliminar la carpeta.",
      status: "error",
    };
  }

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Carpeta eliminada correctamente.",
    status: "success",
  };
}

export async function uploadMealPlanDocument(
  formData: FormData,
): Promise<NutritionDocumentActionResult> {
  const parsed = mealPlanUploadValuesSchema.safeParse({
    clientId: getString(formData, "clientId"),
    description: getString(formData, "description"),
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
  const fileError = getPdfValidationError(file);

  if (fileError || !file) {
    return {
      fieldErrors: { file: fileError ?? "Selecciona un archivo PDF." },
      message: fileError ?? "Selecciona un archivo PDF.",
      status: "error",
    };
  }

  const context = await assertCanManageClient(parsed.data.clientId);

  if (!context.ok || !context.access) {
    return {
      message: context.error ?? "No se pudo validar la clienta seleccionada.",
      status: "error",
    };
  }

  const upload = await uploadPdf({
    documentType: "meal_plan",
    file,
    ownerId: parsed.data.clientId,
  });

  if (upload.error || !upload.storagePath) {
    return {
      fieldErrors: { file: upload.error ?? "No se pudo subir el PDF." },
      message: upload.error ?? "No se pudo subir el PDF.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_documents")
    .insert({
      client_id: parsed.data.clientId,
      created_by: context.access.userId,
      description: parsed.data.description || null,
      document_type: "meal_plan",
      file_name: file.name,
      file_size: file.size,
      mime_type: "application/pdf",
      status: "active",
      storage_path: upload.storagePath,
      title: parsed.data.title,
    })
    .select("id")
    .single();

  if (error || !data) {
    await removeStorageObject(upload.storagePath);

    return {
      message: "No se pudo guardar la metadata del plan.",
      status: "error",
    };
  }

  await context.supabase
    .from("nutrition_documents")
    .update({ status: "inactive" })
    .eq("document_type", "meal_plan")
    .eq("client_id", parsed.data.clientId)
    .eq("status", "active")
    .neq("id", data.id);

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Plan de alimentacion subido y asignado correctamente.",
    status: "success",
  };
}

export async function uploadEducationalDocument(
  formData: FormData,
): Promise<NutritionDocumentActionResult> {
  const parsed = educationalUploadValuesSchema.safeParse({
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
  const fileError = getPdfValidationError(file);

  if (fileError || !file) {
    return {
      fieldErrors: { file: fileError ?? "Selecciona un archivo PDF." },
      message: fileError ?? "Selecciona un archivo PDF.",
      status: "error",
    };
  }

  const context = await validateFolder(parsed.data.folderId);

  if (!context.ok || !context.access) {
    return {
      message: context.error ?? "No se pudo validar la carpeta seleccionada.",
      status: "error",
    };
  }

  const upload = await uploadPdf({
    documentType: "educational_library",
    file,
    ownerId: parsed.data.folderId,
  });

  if (upload.error || !upload.storagePath) {
    return {
      fieldErrors: { file: upload.error ?? "No se pudo subir el PDF." },
      message: upload.error ?? "No se pudo subir el PDF.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_documents")
    .insert({
      created_by: context.access.userId,
      description: parsed.data.description || null,
      document_type: "educational_library",
      file_name: file.name,
      file_size: file.size,
      folder_id: parsed.data.folderId,
      mime_type: "application/pdf",
      status: "active",
      storage_path: upload.storagePath,
      title: parsed.data.title,
    })
    .select("id")
    .single();

  if (error || !data) {
    await removeStorageObject(upload.storagePath);

    return {
      message: "No se pudo guardar la metadata del recurso educativo.",
      status: "error",
    };
  }

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Recurso educativo subido correctamente.",
    status: "success",
  };
}

export async function updateNutritionDocument(
  formData: FormData,
): Promise<NutritionDocumentActionResult> {
  const parsed = nutritionDocumentUpdateValuesSchema.safeParse({
    description: getString(formData, "description"),
    folderId: getString(formData, "folderId") || undefined,
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

  const context = await getManagerContext();

  if (context.error || !context.access) {
    return {
      message: context.error ?? "No se pudo validar tu cuenta.",
      status: "error",
    };
  }

  const { data: currentDocument, error: currentError } = await context.supabase
    .from("nutrition_documents")
    .select(
      "id, document_type, folder_id, client_id, storage_path, file_name, file_size, mime_type",
    )
    .eq("id", parsed.data.id)
    .maybeSingle<NutritionDocumentRow>();

  if (currentError || !currentDocument) {
    return {
      message: "El documento seleccionado no existe o no esta disponible.",
      status: "error",
    };
  }

  if (currentDocument.document_type === "educational_library") {
    if (!parsed.data.folderId) {
      return {
        fieldErrors: { folderId: "Selecciona una carpeta educativa." },
        message: "Selecciona una carpeta educativa.",
        status: "error",
      };
    }

    const folderContext = await validateFolder(parsed.data.folderId);

    if (!folderContext.ok) {
      return {
        fieldErrors: { folderId: folderContext.error ?? "Carpeta invalida." },
        message: folderContext.error ?? "Carpeta invalida.",
        status: "error",
      };
    }
  }

  const replacementFile = getOptionalFile(formData);
  let replacementStoragePath: string | null = null;
  let nextFileName = currentDocument.file_name;
  let nextFileSize = currentDocument.file_size;

  if (replacementFile) {
    const upload = await uploadPdf({
      documentType: currentDocument.document_type,
      file: replacementFile,
      ownerId:
        currentDocument.document_type === "meal_plan"
          ? currentDocument.client_id ?? currentDocument.id
          : parsed.data.folderId ?? currentDocument.folder_id ?? currentDocument.id,
    });

    if (upload.error || !upload.storagePath) {
      return {
        fieldErrors: { file: upload.error ?? "No se pudo subir el PDF." },
        message: upload.error ?? "No se pudo subir el PDF.",
        status: "error",
      };
    }

    replacementStoragePath = upload.storagePath;
    nextFileName = replacementFile.name;
    nextFileSize = replacementFile.size;
  }

  const updates = {
    description: parsed.data.description || null,
    file_name: nextFileName,
    file_size: nextFileSize,
    folder_id:
      currentDocument.document_type === "educational_library"
        ? parsed.data.folderId
        : null,
    mime_type: "application/pdf",
    storage_path: replacementStoragePath ?? currentDocument.storage_path,
    title: parsed.data.title,
  };

  const { data, error } = await context.supabase
    .from("nutrition_documents")
    .update(updates)
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    await removeStorageObject(replacementStoragePath);

    return {
      message: "No se pudo actualizar el documento.",
      status: "error",
    };
  }

  if (replacementStoragePath) {
    await removeStorageObject(currentDocument.storage_path);
  }

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Documento actualizado correctamente.",
    status: "success",
  };
}

export async function deactivateNutritionDocument(
  id: string,
): Promise<NutritionDocumentActionResult> {
  const parsed = nutritionDocumentIdSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "El documento seleccionado no es valido.",
      status: "error",
    };
  }

  const context = await getManagerContext();

  if (context.error) {
    return {
      message: context.error,
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("nutrition_documents")
    .update({ status: "inactive" })
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo desactivar el documento.",
      status: "error",
    };
  }

  revalidateNutritionPaths();

  return {
    id: data.id,
    message: "Documento desactivado correctamente.",
    status: "success",
  };
}

export async function createNutritionDocumentSignedUrl(
  id: string,
): Promise<NutritionDocumentActionResult> {
  const parsed = nutritionDocumentIdSchema.safeParse({ id });

  if (!parsed.success) {
    return {
      message: "El documento seleccionado no es valido.",
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
  const { data: document, error } = await supabase
    .from("nutrition_documents")
    .select("id, storage_path, status")
    .eq("id", parsed.data.id)
    .maybeSingle<Pick<NutritionDocumentRow, "id" | "status" | "storage_path">>();

  if (error || !document) {
    return {
      message: "No tienes acceso a este documento.",
      status: "error",
    };
  }

  const admin = createAdminClient();
  const { data, error: signedUrlError } = await admin.storage
    .from(NUTRITION_PDF_BUCKET)
    .createSignedUrl(
      document.storage_path,
      NUTRITION_PDF_SIGNED_URL_SECONDS,
    );

  if (signedUrlError || !data?.signedUrl) {
    return {
      message: "No se pudo crear el enlace seguro del PDF.",
      status: "error",
    };
  }

  return {
    id: document.id,
    message: "Enlace seguro creado correctamente.",
    signedUrl: data.signedUrl,
    status: "success",
  };
}

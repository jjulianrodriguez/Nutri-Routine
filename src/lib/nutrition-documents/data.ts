import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { createClient } from "@/lib/supabase/server";
import type {
  NutritionDocumentClientRecord,
  NutritionDocumentFolderRecord,
  NutritionDocumentRecord,
  NutritionDocumentsPageData,
} from "@/lib/nutrition-documents/types";
import type { Enums, Tables } from "@/types/database";

type DocumentRow = Tables<"nutrition_documents">;
type FolderRow = Tables<"nutrition_document_folders">;
type ProfileRow = Pick<Tables<"profiles">, "full_name" | "id">;

type ClientProfileRow = {
  assigned_nutritionist_id: string | null;
  profile_id: string;
};

async function resolveRows<Row>(
  query: PromiseLike<{ data: Row[] | null; error: unknown }>,
) {
  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

async function getProfilesById(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const profiles = await resolveRows<ProfileRow>(
    supabase.from("profiles").select("id, full_name").in("id", uniqueIds),
  );

  return new Map(
    profiles.map((profile) => [
      profile.id,
      profile.full_name?.trim() || "Cuenta sin nombre",
    ]),
  );
}

function isGeneralAdmin(access: CurrentUserAccess) {
  return access.role === "admin";
}

function canManageDocuments(access: CurrentUserAccess) {
  return access.canManageNutrition;
}

function mapDocument({
  creatorsById,
  clientsById,
  foldersById,
  row,
}: {
  clientsById: Map<string, string>;
  creatorsById: Map<string, string>;
  foldersById: Map<string, string>;
  row: DocumentRow;
}): NutritionDocumentRecord {
  return {
    clientId: row.client_id,
    clientName: row.client_id ? clientsById.get(row.client_id) ?? null : null,
    createdAt: row.created_at,
    createdBy: row.created_by,
    createdByName: creatorsById.get(row.created_by) ?? null,
    description: row.description,
    documentType: row.document_type,
    fileName: row.file_name,
    fileSize: row.file_size,
    folderId: row.folder_id,
    folderName: row.folder_id ? foldersById.get(row.folder_id) ?? null : null,
    id: row.id,
    status: row.status,
    title: row.title,
    updatedAt: row.updated_at,
  };
}

export async function getManageableNutritionClients(
  access: CurrentUserAccess,
): Promise<NutritionDocumentClientRecord[]> {
  if (!canManageDocuments(access)) {
    return [];
  }

  const supabase = await createClient();
  let query = supabase
    .from("client_profiles")
    .select("profile_id, assigned_nutritionist_id");

  if (isGeneralAdmin(access)) {
    // Admin sees all clients
  } else {
    query = query
      .not("assigned_nutritionist_id", "is", null)
      .eq("assigned_nutritionist_id", access.userId);
  }

  const clientProfiles = await resolveRows<ClientProfileRow>(query);
  const clientNamesById = await getProfilesById(
    clientProfiles.map((client) => client.profile_id),
  );

  const activeMealPlans = await getNutritionDocuments(access, {
    documentType: "meal_plan",
    status: "active",
  });
  const activeMealPlanByClientId = new Map(
    activeMealPlans
      .filter((document) => document.clientId)
      .map((document) => [document.clientId as string, document]),
  );

  return clientProfiles
    .map((client) => ({
      assignedNutritionistId: client.assigned_nutritionist_id,
      currentMealPlan: activeMealPlanByClientId.get(client.profile_id) ?? null,
      id: client.profile_id,
      name: clientNamesById.get(client.profile_id) ?? "Clienta sin nombre",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getNutritionDocumentFolders(
  access: CurrentUserAccess,
): Promise<NutritionDocumentFolderRecord[]> {
  const supabase = await createClient();
  const rows = await resolveRows<FolderRow>(
    supabase
      .from("nutrition_document_folders")
      .select("id, name, active, created_by, created_at, updated_at")
      .order("name", { ascending: true }),
  );

  const documents = canManageDocuments(access)
    ? await resolveRows<Pick<DocumentRow, "folder_id">>(
        supabase
          .from("nutrition_documents")
          .select("folder_id")
          .eq("document_type", "educational_library"),
      )
    : [];
  const countsByFolder = new Map<string, number>();

  documents.forEach((document) => {
    if (document.folder_id) {
      countsByFolder.set(
        document.folder_id,
        (countsByFolder.get(document.folder_id) ?? 0) + 1,
      );
    }
  });

  return rows.map((row) => ({
    active: row.active,
    createdAt: row.created_at,
    documentCount: countsByFolder.get(row.id) ?? 0,
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
  }));
}

export async function getNutritionDocuments(
  access: CurrentUserAccess,
  filters: {
    documentType?: Enums<"nutrition_document_type">;
    status?: Enums<"nutrition_document_status">;
  } = {},
): Promise<NutritionDocumentRecord[]> {
  const supabase = await createClient();
  let query = supabase
    .from("nutrition_documents")
    .select(
      "id, title, description, document_type, folder_id, client_id, storage_path, file_name, file_size, mime_type, created_by, status, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (filters.documentType) {
    query = query.eq("document_type", filters.documentType);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const rows = await resolveRows<DocumentRow>(query);
  const [folders, profileNamesById] = await Promise.all([
    getNutritionDocumentFolders(access),
    getProfilesById(
      rows.flatMap((row) => [row.client_id ?? "", row.created_by]),
    ),
  ]);
  const foldersById = new Map(
    folders.map((folder) => [folder.id, folder.name]),
  );

  return rows.map((row) =>
    mapDocument({
      clientsById: profileNamesById,
      creatorsById: profileNamesById,
      foldersById,
      row,
    }),
  );
}

export async function getNutritionDocumentsPageData(
  access: CurrentUserAccess,
): Promise<NutritionDocumentsPageData> {
  const [folders, documents] = await Promise.all([
    getNutritionDocumentFolders(access),
    getNutritionDocuments(access),
  ]);
  const clients = canManageDocuments(access)
    ? await getManageableNutritionClients(access)
    : [];

  return {
    clients,
    documents,
    folders,
    libraryDocuments: documents.filter(
      (document) => document.documentType === "educational_library",
    ),
    mealPlanDocuments: documents.filter(
      (document) => document.documentType === "meal_plan",
    ),
  };
}

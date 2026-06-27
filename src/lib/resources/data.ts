import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type ResourceRow = Tables<"resources">;
type ResourceFolderRow = Tables<"resource_folders">;
type ProfileRow = Pick<Tables<"profiles">, "full_name" | "id">;

export type MultimediaResource = Pick<
  ResourceRow,
  | "area"
  | "created_at"
  | "description"
  | "file_name"
  | "file_size"
  | "file_url"
  | "folder_id"
  | "id"
  | "kind"
  | "mime_type"
  | "status"
  | "storage_bucket"
  | "storage_path"
  | "title"
  | "updated_at"
  | "uploaded_by"
> & {
  creatorName: string | null;
  folderName: string | null;
};

export type ResourceFolder = Pick<
  ResourceFolderRow,
  | "active"
  | "area"
  | "created_at"
  | "created_by"
  | "description"
  | "id"
  | "name"
  | "updated_at"
> & {
  creatorName: string | null;
  documentCount: number;
};

export type ResourceLibraryData = {
  folders: ResourceFolder[];
  resources: MultimediaResource[];
};

async function getProfilesById(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", uniqueIds);

  return new Map(
    ((data ?? []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile.full_name ?? "Administrador",
    ]),
  );
}

export async function getVisibleResourceLibrary({
  includeCreator,
}: {
  includeCreator: boolean;
}): Promise<ResourceLibraryData> {
  const supabase = await createClient();
  const [resourcesResult, foldersResult] = await Promise.all([
    supabase
      .from("resources")
      .select(
        "id, title, description, file_url, area, uploaded_by, created_at, updated_at, kind, folder_id, storage_bucket, storage_path, file_name, file_size, mime_type, status",
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("resource_folders")
      .select(
        "id, name, description, area, active, created_by, created_at, updated_at",
      )
      .order("name", { ascending: true }),
  ]);

  const resourceRows = (resourcesResult.data ?? []) as ResourceRow[];
  const folderRows = (foldersResult.data ?? []) as ResourceFolderRow[];

  if (resourcesResult.error && foldersResult.error) {
    return {
      folders: [],
      resources: [],
    };
  }

  const countsByFolder = new Map<string, number>();
  resourceRows.forEach((resource) => {
    if (resource.folder_id) {
      countsByFolder.set(
        resource.folder_id,
        (countsByFolder.get(resource.folder_id) ?? 0) + 1,
      );
    }
  });

  const creatorNames = includeCreator
    ? await getProfilesById([
        ...resourceRows.map((resource) => resource.uploaded_by),
        ...folderRows.map((folder) => folder.created_by),
      ])
    : new Map<string, string>();
  const folderNames = new Map(
    folderRows.map((folder) => [folder.id, folder.name]),
  );

  const folders = folderRows
    .map((folder) => ({
      active: folder.active,
      area: folder.area,
      created_at: folder.created_at,
      created_by: folder.created_by,
      creatorName: includeCreator
        ? creatorNames.get(folder.created_by) ?? "Administrador"
        : null,
      description: folder.description,
      documentCount: countsByFolder.get(folder.id) ?? 0,
      id: folder.id,
      name: folder.name,
      updated_at: folder.updated_at,
    }))
    .filter((folder) => includeCreator || folder.documentCount > 0);

  const resources = resourceRows.map((resource) => ({
    ...resource,
    creatorName: includeCreator
      ? creatorNames.get(resource.uploaded_by) ?? "Administrador"
      : null,
    folderName: resource.folder_id
      ? folderNames.get(resource.folder_id) ?? null
      : null,
  }));

  return {
    folders,
    resources,
  };
}

export async function getVisibleResources({
  includeCreator,
}: {
  includeCreator: boolean;
}): Promise<MultimediaResource[]> {
  const library = await getVisibleResourceLibrary({ includeCreator });

  return library.resources;
}

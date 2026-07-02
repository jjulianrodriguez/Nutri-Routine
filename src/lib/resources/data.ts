import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

type ResourceRow = Tables<"resources">;
type ResourceFolderRow = Tables<"resource_folders">;
type ProfileRow = Pick<Tables<"profiles">, "full_name" | "id">;
type ResourceArea = Enums<"service_area">;

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
  areaCounts: Record<ResourceArea, number>;
  folders: ResourceFolder[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page: number;
    pageSize: number;
    totalCount: number;
  };
  resources: MultimediaResource[];
  totalResourceCount: number;
};

type ResourceLibraryFilters = {
  area?: ResourceArea | null;
  folderId?: string | null;
};

const RESOURCE_LIBRARY_PAGE_SIZE = 48;
const RESOURCE_LIBRARY_MAX_PAGE_SIZE = 96;

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

function normalizePage(value?: number) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function normalizePageSize(value?: number) {
  if (!value || !Number.isFinite(value) || value < 1) {
    return RESOURCE_LIBRARY_PAGE_SIZE;
  }

  return Math.min(Math.floor(value), RESOURCE_LIBRARY_MAX_PAGE_SIZE);
}

async function resolveCount(
  query: PromiseLike<{ count: number | null; error: unknown }>,
) {
  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count ?? 0;
}

async function countResourcesByArea({
  includeCreator,
}: {
  includeCreator: boolean;
}) {
  const supabase = await createClient();
  const areas: ResourceArea[] = ["general", "nutrition", "training"];
  const counts = await Promise.all(
    areas.map((area) => {
      let query = supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("area", area);

      if (!includeCreator) {
        query = query.eq("status", "active");
      }

      return resolveCount(query);
    }),
  );

  return {
    general: counts[0] ?? 0,
    nutrition: counts[1] ?? 0,
    training: counts[2] ?? 0,
  } satisfies Record<ResourceArea, number>;
}

async function countFolderDocuments({
  area,
  folderRows,
  includeCreator,
}: {
  area?: ResourceArea | null;
  folderRows: ResourceFolderRow[];
  includeCreator: boolean;
}) {
  if (folderRows.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createClient();
  const counts = await Promise.all(
    folderRows.map((folder) => {
      let query = supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("folder_id", folder.id);

      if (area) {
        query = query.eq("area", area);
      }

      if (!includeCreator) {
        query = query.eq("status", "active");
      }

      return resolveCount(query);
    }),
  );

  return new Map(folderRows.map((folder, index) => [folder.id, counts[index] ?? 0]));
}

export async function getVisibleResourceLibrary({
  filters = {},
  includeCreator,
  page,
  pageSize,
}: {
  filters?: ResourceLibraryFilters;
  includeCreator: boolean;
  page?: number;
  pageSize?: number;
}): Promise<ResourceLibraryData> {
  const supabase = await createClient();
  const currentPage = normalizePage(page);
  const normalizedPageSize = normalizePageSize(pageSize);
  const rangeStart = (currentPage - 1) * normalizedPageSize;
  const rangeEnd = rangeStart + normalizedPageSize - 1;
  let foldersQuery = supabase
    .from("resource_folders")
    .select(
      "id, name, description, area, active, created_by, created_at, updated_at",
    )
    .order("name", { ascending: true });

  if (filters.area) {
    foldersQuery = foldersQuery.eq("area", filters.area);
  }

  if (!includeCreator) {
    foldersQuery = foldersQuery.eq("active", true);
  }

  const foldersResult = await foldersQuery;
  const folderRows = (foldersResult.data ?? []) as ResourceFolderRow[];
  const validFolderId =
    filters.folderId && folderRows.some((folder) => folder.id === filters.folderId)
      ? filters.folderId
      : null;
  let resourcesQuery = supabase
    .from("resources")
    .select(
      "id, title, description, file_url, area, uploaded_by, created_at, updated_at, kind, folder_id, storage_bucket, storage_path, file_name, file_size, mime_type, status",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false });

  if (filters.area) {
    resourcesQuery = resourcesQuery.eq("area", filters.area);
  }

  if (validFolderId) {
    resourcesQuery = resourcesQuery.eq("folder_id", validFolderId);
  } else {
    resourcesQuery = resourcesQuery.is("folder_id", null);
  }

  if (!includeCreator) {
    resourcesQuery = resourcesQuery.eq("status", "active");
  }

  const resourcesResult = await resourcesQuery.range(rangeStart, rangeEnd);
  const resourceRows = (resourcesResult.data ?? []) as ResourceRow[];
  const totalResourceCount = resourcesResult.count ?? resourceRows.length;

  if (resourcesResult.error && foldersResult.error) {
    return {
      areaCounts: {
        general: 0,
        nutrition: 0,
        training: 0,
      },
      folders: [],
      pagination: {
        hasNextPage: false,
        hasPreviousPage: currentPage > 1,
        page: currentPage,
        pageSize: normalizedPageSize,
        totalCount: 0,
      },
      resources: [],
      totalResourceCount: 0,
    };
  }

  const [areaCounts, countsByFolder, creatorNames] = await Promise.all([
    countResourcesByArea({ includeCreator }),
    countFolderDocuments({
      area: filters.area,
      folderRows,
      includeCreator,
    }),
    includeCreator
      ? getProfilesById([
          ...resourceRows.map((resource) => resource.uploaded_by),
          ...folderRows.map((folder) => folder.created_by),
        ])
      : Promise.resolve(new Map<string, string>()),
  ]);
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
    areaCounts,
    folders,
    pagination: {
      hasNextPage: rangeEnd + 1 < totalResourceCount,
      hasPreviousPage: currentPage > 1,
      page: currentPage,
      pageSize: normalizedPageSize,
      totalCount: totalResourceCount,
    },
    resources,
    totalResourceCount,
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

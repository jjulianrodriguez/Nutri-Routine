import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type ResourceRow = Tables<"resources">;

export type MultimediaResource = Pick<
  ResourceRow,
  | "area"
  | "created_at"
  | "description"
  | "file_url"
  | "id"
  | "title"
  | "updated_at"
  | "uploaded_by"
> & {
  creatorName: string | null;
};

export async function getVisibleResources({
  includeCreator,
}: {
  includeCreator: boolean;
}): Promise<MultimediaResource[]> {
  const supabase = await createClient();
  const { data: resources, error } = await supabase
    .from("resources")
    .select(
      "id, title, description, file_url, area, uploaded_by, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error || !resources) {
    return [];
  }

  if (!includeCreator || resources.length === 0) {
    return resources.map((resource) => ({
      ...resource,
      creatorName: null,
    }));
  }

  const creatorIds = Array.from(
    new Set(resources.map((resource) => resource.uploaded_by)),
  );
  const { data: creators } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", creatorIds);
  const creatorNames = new Map(
    (creators ?? []).map((creator) => [
      creator.id,
      creator.full_name ?? "Administrador",
    ]),
  );

  return resources.map((resource) => ({
    ...resource,
    creatorName:
      creatorNames.get(resource.uploaded_by) ?? "Administrador",
  }));
}

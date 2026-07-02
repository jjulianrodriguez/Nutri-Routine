import {
  AppHeader,
  AppScreen,
  StatTile,
} from "@/components/app/AppScreen";
import Link from "next/link";

import { ResourceManager } from "@/components/app/resource-manager";
import { Button } from "@/components/ui/button";
import { getManageableResourceAreas } from "@/lib/auth/access-rules";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getVisibleResourceLibrary } from "@/lib/resources/data";
import type { Enums } from "@/types/database";

export const dynamic = "force-dynamic";

type ResourceArea = Enums<"service_area">;
type ResourceFilter = ResourceArea | "all";
type ResourceContentFilter = "all" | "folders" | "links" | "pdf";
type ResourceStatusFilter = "active" | "all" | "inactive";

function normalizeFilter(value?: string): ResourceFilter {
  if (
    value === "training" ||
    value === "nutrition" ||
    value === "general"
  ) {
    return value;
  }

  return "all";
}

function normalizeContentFilter(value?: string): ResourceContentFilter {
  if (value === "folders" || value === "links" || value === "pdf") {
    return value;
  }

  return "all";
}

function normalizeStatusFilter(value?: string): ResourceStatusFilter {
  if (value === "active" || value === "inactive") {
    return value;
  }

  return "all";
}

function normalizePage(value?: string) {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildResourcesPageHref({
  area,
  folder,
  page,
  q,
  status,
  type,
}: {
  area?: string;
  folder?: string | null;
  page: number;
  q?: string;
  status?: string;
  type?: string;
}) {
  const params = new URLSearchParams();

  if (area && area !== "all") {
    params.set("area", area);
  }

  if (folder) {
    params.set("folder", folder);
  }

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (type && type !== "all") {
    params.set("type", type);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/app/recursos?${query}` : "/app/recursos";
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    area?: string;
    folder?: string;
    page?: string;
    q?: string;
    status?: string;
    type?: string;
  }>;
}) {
  const access = await requireRouteAccess("/app/recursos");
  const canManage = access.canManageResources;
  const manageableResourceAreas = getManageableResourceAreas(access);
  const { area, folder, page, q, status, type } = await searchParams;
  const requestedFilter = normalizeFilter(area);
  const requestedContentFilter = normalizeContentFilter(type);
  const requestedStatusFilter = canManage
    ? normalizeStatusFilter(status)
    : "all";
  const requestedSearch = q?.trim().slice(0, 120) ?? "";
  const requestedPage = normalizePage(page);
  const availableFilters: ResourceFilter[] = canManage
    ? ["all", ...manageableResourceAreas]
    : ([
        "all",
        access.canViewTraining ? "training" : null,
        access.canViewNutrition ? "nutrition" : null,
        access.canViewTraining || access.canViewNutrition ? "general" : null,
      ].filter(Boolean) as ResourceFilter[]);
  const activeFilter = availableFilters.includes(requestedFilter)
    ? requestedFilter
    : "all";
  const library = await getVisibleResourceLibrary({
    filters: {
      area: activeFilter === "all" ? null : activeFilter,
      folderId: folder ?? null,
    },
    includeCreator: canManage,
    page: requestedPage,
  });
  const resources = library.resources;
  const folders = library.folders;
  const filteredResources =
    activeFilter === "all"
      ? resources
      : resources.filter((resource) => resource.area === activeFilter);
  const filteredFolders =
    activeFilter === "all"
      ? folders
      : folders.filter((resourceFolder) => resourceFolder.area === activeFilter);
  const selectedFolderId =
    folder && filteredFolders.some((resourceFolder) => resourceFolder.id === folder)
      ? folder
      : null;
  const trainingCount = resources.filter(
    (resource) => resource.area === "training",
  ).length;
  const nutritionCount = resources.filter(
    (resource) => resource.area === "nutrition",
  ).length;
  const bothCount = resources.filter(
    (resource) => resource.area === "general",
  ).length;
  const clientDescription = access.canViewTraining && !access.canViewNutrition
    ? "Encuentra materiales compartidos para acompanar tu plan de entrenamiento."
    : access.canViewNutrition && !access.canViewTraining
      ? "Encuentra materiales compartidos para acompanar tu plan de nutricion."
      : "Encuentra materiales compartidos para tus planes activos.";
  const assignedTrainerLabel =
    access.assignedTrainerName ?? "Tu profesional de entrenamiento";
  const assignedNutritionistLabel =
    access.assignedNutritionistName ?? "Tu profesional de nutricion";
  const sameAssignedProfessional =
    access.assignedTrainerId &&
    access.assignedNutritionistId &&
    access.assignedTrainerId === access.assignedNutritionistId;
  const emptyHint = access.canViewTraining && !access.canViewNutrition
    ? `${assignedTrainerLabel} puede compartir recursos contigo.`
    : access.canViewNutrition && !access.canViewTraining
      ? `${assignedNutritionistLabel} puede compartir recursos contigo.`
      : sameAssignedProfessional && access.assignedTrainerName
        ? `${access.assignedTrainerName} puede compartir recursos contigo.`
        : "Tus profesionales asignados pueden compartir recursos contigo.";

  return (
    <AppScreen>
      <AppHeader
        eyebrow={canManage ? "Administracion" : "Biblioteca"}
        title="Recursos"
        description={
          canManage
            ? "Biblioteca de materiales para organizar carpetas, PDFs y enlaces por nutricion, entrenamiento o contenido compartido."
            : clientDescription
        }
      />

      <section
        className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen de recursos"
      >
        <StatTile
          label="Total visible"
          value={String(
            library.areaCounts.general +
              library.areaCounts.nutrition +
              library.areaCounts.training,
          )}
          detail="Documentos y enlaces segun tus servicios activos"
        />
        {canManage ? (
          <StatTile
            label="Carpetas"
            value={String(folders.length)}
            detail="Organizacion de PDFs y enlaces"
          />
        ) : null}
        {canManage || access.canViewTraining ? (
          <StatTile
            label="Entrenamiento"
            value={String(library.areaCounts.training || trainingCount)}
            detail="Material para tu plan de entrenamiento"
          />
        ) : null}
        {canManage || access.canViewNutrition ? (
          <StatTile
            label="Nutricion"
            value={String(library.areaCounts.nutrition || nutritionCount)}
            detail="Material para tu plan de nutricion"
          />
        ) : null}
        <StatTile
          label="Compartido"
          value={String(library.areaCounts.general || bothCount)}
          detail="Material para tus planes activos"
        />
      </section>

      <ResourceManager
        activeFilter={activeFilter}
        availableFilters={availableFilters}
        canManage={canManage}
        emptyHint={emptyHint}
        emptyMessage="Todavia no hay recursos disponibles"
        folders={filteredFolders}
        initialContentFilter={requestedContentFilter}
        initialSearchQuery={requestedSearch}
        initialStatusFilter={requestedStatusFilter}
        manageableAreas={manageableResourceAreas}
        resources={filteredResources}
        selectedFolderId={selectedFolderId}
      />

      {library.pagination.hasPreviousPage || library.pagination.hasNextPage ? (
        <nav
          className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-border bg-surface px-4 py-3 shadow-soft"
          aria-label="Paginacion de recursos"
        >
          <p className="text-sm font-bold text-muted">
            Pagina {library.pagination.page} · {library.pagination.totalCount} recursos
          </p>
          <div className="flex flex-wrap gap-2">
            {library.pagination.hasPreviousPage ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={buildResourcesPageHref({
                    area: activeFilter,
                    folder: selectedFolderId,
                    page: library.pagination.page - 1,
                    q: requestedSearch,
                    status: requestedStatusFilter,
                    type: requestedContentFilter,
                  })}
                >
                  Anterior
                </Link>
              </Button>
            ) : null}
            {library.pagination.hasNextPage ? (
              <Button asChild variant="outline" size="sm">
                <Link
                  href={buildResourcesPageHref({
                    area: activeFilter,
                    folder: selectedFolderId,
                    page: library.pagination.page + 1,
                    q: requestedSearch,
                    status: requestedStatusFilter,
                    type: requestedContentFilter,
                  })}
                >
                  Siguiente
                </Link>
              </Button>
            ) : null}
          </div>
        </nav>
      ) : null}
    </AppScreen>
  );
}

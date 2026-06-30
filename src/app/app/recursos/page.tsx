import {
  AppHeader,
  AppScreen,
  StatTile,
} from "@/components/app/AppScreen";
import { ResourceManager } from "@/components/app/resource-manager";
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

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    area?: string;
    folder?: string;
    q?: string;
    status?: string;
    type?: string;
  }>;
}) {
  const access = await requireRouteAccess("/app/recursos");
  const canManage = access.canManageResources;
  const manageableResourceAreas = getManageableResourceAreas(access);
  const { area, folder, q, status, type } = await searchParams;
  const library = await getVisibleResourceLibrary({
    includeCreator: canManage,
  });
  const resources = library.resources;
  const folders = library.folders;
  const requestedFilter = normalizeFilter(area);
  const requestedContentFilter = normalizeContentFilter(type);
  const requestedStatusFilter = canManage
    ? normalizeStatusFilter(status)
    : "all";
  const requestedSearch = q?.trim().slice(0, 120) ?? "";
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
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen de recursos"
      >
        <StatTile
          label="Total visible"
          value={String(resources.length)}
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
            value={String(trainingCount)}
            detail="Material para tu plan de entrenamiento"
          />
        ) : null}
        {canManage || access.canViewNutrition ? (
          <StatTile
            label="Nutricion"
            value={String(nutritionCount)}
            detail="Material para tu plan de nutricion"
          />
        ) : null}
        <StatTile
          label="Compartido"
          value={String(bothCount)}
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
    </AppScreen>
  );
}

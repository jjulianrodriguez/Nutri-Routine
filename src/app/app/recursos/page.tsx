import {
  AppHeader,
  AppScreen,
  StatTile,
} from "@/components/app/AppScreen";
import { ResourceManager } from "@/components/app/resource-manager";
import { getManageableResourceAreas } from "@/lib/auth/access-rules";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getVisibleResources } from "@/lib/resources/data";
import type { Enums } from "@/types/database";

export const dynamic = "force-dynamic";

type ResourceArea = Enums<"service_area">;
type ResourceFilter = ResourceArea | "all";

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

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string }>;
}) {
  const access = await requireRouteAccess("/app/recursos");
  const canManage = access.canManageResources;
  const manageableResourceAreas = getManageableResourceAreas(access);
  const resources = await getVisibleResources({
    includeCreator: canManage,
  });
  const { area } = await searchParams;
  const requestedFilter = normalizeFilter(area);
  const availableFilters: ResourceFilter[] = canManage
    ? ["all", ...manageableResourceAreas]
    : [
        "all",
        access.canViewTraining ? "training" : null,
        access.canViewNutrition ? "nutrition" : null,
        access.canViewTraining || access.canViewNutrition ? "general" : null,
      ].filter(Boolean) as ResourceFilter[];
  const activeFilter = availableFilters.includes(requestedFilter)
    ? requestedFilter
    : "all";
  const filteredResources =
    activeFilter === "all"
      ? resources
      : resources.filter((resource) => resource.area === activeFilter);
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
    ? "Encuentra materiales compartidos para acompañar tu plan de entrenamiento."
    : access.canViewNutrition && !access.canViewTraining
      ? "Encuentra materiales compartidos para acompañar tu plan de nutrición."
      : "Encuentra materiales compartidos para tus planes activos.";
  const assignedTrainerLabel =
    access.assignedTrainerName ?? "Tu profesional de entrenamiento";
  const assignedNutritionistLabel =
    access.assignedNutritionistName ?? "Tu profesional de nutrición";
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
        title="Recursos multimedia"
        description={
          canManage
            ? "Crea y administra enlaces externos para entrenamiento, nutrición o ambas áreas."
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
          detail="Disponibles segun tus servicios activos"
        />
        {canManage || access.canViewTraining ? (
          <StatTile
            label="Entrenamiento"
            value={String(trainingCount)}
            detail="Material para tu plan de entrenamiento"
          />
        ) : null}
        {canManage || access.canViewNutrition ? (
          <StatTile
            label="Nutrición"
            value={String(nutritionCount)}
            detail="Material para tu plan de nutrición"
          />
        ) : null}
        <StatTile
          label={canManage ? "Ambos" : "General"}
          value={String(bothCount)}
          detail="Material para tus planes activos"
        />
      </section>

      <ResourceManager
        activeFilter={activeFilter}
        availableFilters={availableFilters}
        canManage={canManage}
        emptyHint={emptyHint}
        emptyMessage="Aun no tienes recursos disponibles"
        manageableAreas={manageableResourceAreas}
        resources={filteredResources}
      />
    </AppScreen>
  );
}

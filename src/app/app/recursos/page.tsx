import {
  AppHeader,
  AppScreen,
  StatTile,
} from "@/components/app/AppScreen";
import { ResourceManager } from "@/components/app/resource-manager";
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
  const canManage = access.role === "admin";
  const resources = await getVisibleResources({
    includeCreator: canManage,
  });
  const { area } = await searchParams;
  const activeFilter = normalizeFilter(area);
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

  return (
    <AppScreen>
      <AppHeader
        eyebrow={canManage ? "Administracion" : "Biblioteca"}
        title="Recursos multimedia"
        description={
          canManage
            ? "Crea y administra enlaces externos para entrenamiento, nutricion o ambas areas."
            : "Explora materiales externos habilitados para tus servicios activos."
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
        <StatTile
          label="Entrenamiento"
          value={String(trainingCount)}
          detail="Acceso exclusivo de entrenamiento"
        />
        <StatTile
          label="Nutricion"
          value={String(nutritionCount)}
          detail="Acceso exclusivo de nutricion"
        />
        <StatTile
          label="Ambos"
          value={String(bothCount)}
          detail="Material compartido entre areas"
        />
      </section>

      <ResourceManager
        activeFilter={activeFilter}
        canManage={canManage}
        resources={filteredResources}
      />
    </AppScreen>
  );
}

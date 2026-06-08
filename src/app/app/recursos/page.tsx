import { BookOpen, Dumbbell, Leaf } from "lucide-react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getDashboardData } from "@/lib/app/dashboard-data";

export default async function ResourcesPage() {
  const access = await requireRouteAccess("/app/recursos");
  const data = await getDashboardData(access);

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Biblioteca"
        title="Recursos"
        description={
          access.isClient
            ? "Material visible para tus servicios activos."
            : "Biblioteca y materiales compartidos con clientes segun especialidad."
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Recursos visibles"
          value={String(data.resourcesCount)}
          detail="Filtrados por Supabase/RLS"
        />
        {access.canViewNutrition ? (
          <StatTile
            label="Nutricion"
            value="Activa"
            detail={access.isClient ? "Servicio asignado" : "Gestion permitida"}
          />
        ) : null}
        {access.canViewTraining ? (
          <StatTile
            label="Entrenamiento"
            value="Activa"
            detail={access.isClient ? "Servicio asignado" : "Gestion permitida"}
          />
        ) : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title="Recursos recientes"
          description="Se muestran registros reales de la tabla resources cuando estan disponibles."
        >
          {data.recentResources.length > 0 ? (
            <div className="space-y-3">
              {data.recentResources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-[20px] border border-border bg-background p-4"
                >
                  <BookOpen className="size-5 text-warm-brown" />
                  <h2 className="mt-4 font-extrabold text-charcoal">
                    {resource.title}
                  </h2>
                  {resource.detail ? (
                    <p className="mt-2 text-sm text-muted">{resource.detail}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState>No hay recursos visibles para esta cuenta.</EmptyState>
          )}
        </AppPanel>

        <AppPanel
          title={access.isClient ? "Mis areas" : "Envio de recursos"}
          description={
            access.isClient
              ? "Solo aparecen las categorias asociadas a tus servicios."
              : "Solo se ofrecen areas compatibles con tu specialty."
          }
          tone="accent"
        >
          <div className="grid gap-3">
            {access.canViewNutrition ? (
              <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                <Leaf className="size-5 text-warm-brown" />
                <h3 className="mt-4 font-extrabold text-charcoal">
                  Recursos de nutricion
                </h3>
              </div>
            ) : null}
            {access.canViewTraining ? (
              <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                <Dumbbell className="size-5 text-warm-brown" />
                <h3 className="mt-4 font-extrabold text-charcoal">
                  Recursos de entrenamiento
                </h3>
              </div>
            ) : null}
          </div>
        </AppPanel>
      </div>
    </AppScreen>
  );
}

import { Leaf, NotebookTabs, Users } from "lucide-react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getDashboardData } from "@/lib/app/dashboard-data";

export default async function NutritionPage() {
  const access = await requireRouteAccess("/app/nutricion");
  const data = await getDashboardData(access);

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi nutricion" : "Area profesional"}
        title={access.isClient ? "Nutricion" : "Gestion de nutricion"}
        description={
          access.isClient
            ? "Plan alimenticio actual, historial de planes y recursos de nutricion asignados a tu cuenta."
            : "Clientes de nutricion, dietas, planes alimenticios y recursos enviados."
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {access.isClient ? (
          <StatTile
            label="Planes visibles"
            value={String(data.dietPlansCount)}
            detail="Segun tu asignacion de nutricion"
          />
        ) : (
          <StatTile
            label="Clientes de nutricion"
            value={String(data.assignedClientsCount)}
            detail="Asignados a tu perfil"
          />
        )}
        <StatTile
          label="Planes alimenticios"
          value={String(data.dietPlansCount)}
          detail="Disponibles para tu cuenta"
        />
        <StatTile
          label="Recursos"
          value={String(data.resourcesCount)}
          detail="Biblioteca visible"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title={access.isClient ? "Plan alimenticio actual" : "Planes alimenticios"}
          description={
            access.isClient
              ? "Aqui encontraras tu plan vigente cuando este disponible para tu cuenta."
              : "Crea, revisa y actualiza los planes alimenticios de tus clientes."
          }
        >
          {data.currentDietPlan ? (
            <article className="rounded-[20px] border border-border bg-background p-4">
              <Leaf className="size-5 text-warm-brown" />
              <h2 className="mt-4 font-extrabold text-charcoal">
                {data.currentDietPlan.title}
              </h2>
              {data.currentDietPlan.detail ? (
                <p className="mt-2 text-sm text-muted">
                  {data.currentDietPlan.detail}
                </p>
              ) : null}
            </article>
          ) : (
            <EmptyState>No hay planes alimenticios visibles por ahora.</EmptyState>
          )}
        </AppPanel>

        <AppPanel
          title={access.isClient ? "Historial y recursos" : "Clientes y recursos"}
          description={
            access.isClient
              ? "Acceso a planes anteriores y materiales de nutricion."
              : "Herramientas de seguimiento para clientes de nutricion y envio de recursos."
          }
          tone="accent"
        >
          <div className="grid gap-3">
            <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
              <NotebookTabs className="size-5 text-warm-brown" />
              <h3 className="mt-4 font-extrabold text-charcoal">
                {access.isClient ? "Historial de planes" : "Crear y editar dietas"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {access.isClient
                  ? "Solo tus planes alimenticios quedan disponibles en esta vista."
                  : "Disponible para profesionales autorizados en nutricion."}
              </p>
            </div>
            {!access.isClient ? (
              <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                <Users className="size-5 text-warm-brown" />
                <h3 className="mt-4 font-extrabold text-charcoal">
                  Clientes de nutricion
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Solo se muestran los clientes asignados a tu area de nutricion.
                </p>
              </div>
            ) : null}
          </div>
        </AppPanel>
      </div>
    </AppScreen>
  );
}

import { Dumbbell, NotebookTabs, Users } from "lucide-react";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getDashboardData } from "@/lib/app/dashboard-data";

export default async function TrainingPage() {
  const access = await requireRouteAccess("/app/entrenamiento");
  const data = await getDashboardData(access);

  return (
    <AppScreen>
      <AppHeader
        eyebrow={access.isClient ? "Mi entrenamiento" : "Modulo administrativo"}
        title={access.isClient ? "Entrenamiento" : "Gestion de entrenamiento"}
        description={
          access.isClient
            ? "Rutina actual, historial de rutinas y recursos de entrenamiento asignados a tu cuenta."
            : "Clientes de entrenamiento, rutinas, planes de entrenamiento y recursos enviados."
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {access.isClient ? (
          <StatTile
            label="Rutinas visibles"
            value={String(data.workoutPlansCount)}
            detail="Segun tu asignacion de entrenamiento"
          />
        ) : (
          <StatTile
            label="Clientes de entrenamiento"
            value={String(data.assignedClientsCount)}
            detail="Asignados a tu perfil"
          />
        )}
        <StatTile
          label="Planes de entrenamiento"
          value={String(data.workoutPlansCount)}
          detail="Disponibles por permisos"
        />
        <StatTile
          label="Recursos"
          value={String(data.resourcesCount)}
          detail="Biblioteca visible"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <AppPanel
          title={access.isClient ? "Rutina actual" : "Planes de entrenamiento"}
          description={
            access.isClient
              ? "Tu rutina vigente aparece si la tabla workout_plans la expone para tu cuenta."
              : "Vista de rutinas para crear, revisar o editar desde las acciones reales del modulo."
          }
        >
          {data.currentWorkoutPlan ? (
            <article className="rounded-[20px] border border-border bg-background p-4">
              <Dumbbell className="size-5 text-warm-brown" />
              <h2 className="mt-4 font-extrabold text-charcoal">
                {data.currentWorkoutPlan.title}
              </h2>
              {data.currentWorkoutPlan.detail ? (
                <p className="mt-2 text-sm text-muted">
                  {data.currentWorkoutPlan.detail}
                </p>
              ) : null}
            </article>
          ) : (
            <EmptyState>No hay rutinas visibles por ahora.</EmptyState>
          )}
        </AppPanel>

        <AppPanel
          title={access.isClient ? "Historial y recursos" : "Clientes y recursos"}
          description={
            access.isClient
              ? "Acceso a rutinas anteriores y materiales de entrenamiento."
              : "Herramientas de seguimiento para clientes de entrenamiento y envio de recursos."
          }
          tone="accent"
        >
          <div className="grid gap-3">
            <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
              <NotebookTabs className="size-5 text-warm-brown" />
              <h3 className="mt-4 font-extrabold text-charcoal">
                {access.isClient ? "Historial de rutinas" : "Crear y editar rutinas"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {access.isClient
                  ? "Solo tus planes de entrenamiento quedan disponibles en esta vista."
                  : "Visible solo para perfiles con specialty training o both."}
              </p>
            </div>
            {!access.isClient ? (
              <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
                <Users className="size-5 text-warm-brown" />
                <h3 className="mt-4 font-extrabold text-charcoal">
                  Clientes de entrenamiento
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Filtrados por assigned_trainer_id.
                </p>
              </div>
            ) : null}
          </div>
        </AppPanel>
      </div>
    </AppScreen>
  );
}

import {
  ArrowRight,
  CalendarClock,
  Dumbbell,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { RoutineCardActions } from "@/components/app/routine-card-actions";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineManagementOverview } from "@/lib/routines/data";
import type { RoutineDifficulty } from "@/types/routine";

const difficultyLabels: Record<RoutineDifficulty, string> = {
  advanced: "Avanzada",
  beginner: "Principiante",
  intermediate: "Intermedia",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function RoutinesPage() {
  const access = await requireRouteAccess("/app/entrenamiento/rutinas");

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const overview = await getRoutineManagementOverview();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Entrenamiento"
        title="Rutinas"
        description="Crea plantillas usando exclusivamente los ejercicios disponibles en la biblioteca."
      />

      <TrainingSectionNav active="routines" />

      <div className="flex justify-end">
        <Button asChild size="lg">
          <Link href="/app/entrenamiento/rutinas/nueva">
            <Plus className="size-4" />
            Crear rutina
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Rutinas"
          value={String(overview.routines.length)}
          detail="Plantillas disponibles"
        />
        <StatTile
          label="Rutinas activas"
          value={String(overview.activeCount)}
          detail="Listas para utilizar"
        />
        <StatTile
          label="Ejercicios activos"
          value={String(overview.exerciseCount)}
          detail="Disponibles para seleccionar"
        />
      </section>

      <AppPanel
        title="Todas las rutinas"
        description="Abre una rutina para ver su detalle o editar la configuracion de sus ejercicios."
      >
        {overview.routines.length === 0 ? (
          <EmptyState>
            Aun no hay rutinas. Primero crea ejercicios en la biblioteca y
            despues construye la primera rutina.
          </EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {overview.routines.map((routine) => (
              <article
                key={routine.id}
                className="rounded-[24px] border border-border bg-background p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={`/app/entrenamiento/rutinas/${routine.id}`}
                    className="group min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-charcoal">
                        {difficultyLabels[routine.difficulty]}
                      </span>
                      {routine.identifier ? (
                        <span className="max-w-full truncate rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                          ID: {routine.identifier}
                        </span>
                      ) : null}
                      <span
                        className={
                          routine.isActive
                            ? "rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-charcoal"
                            : "rounded-full bg-stone-soft px-3 py-1 text-xs font-extrabold text-stone-hover"
                        }
                      >
                        {routine.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold text-charcoal">
                      {routine.name}
                    </h2>
                    <p className="mt-2 text-sm font-bold text-warm-brown">
                      {routine.category} / {routine.targetAudience}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-warm-brown group-hover:text-charcoal">
                      Ver detalle
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <RoutineCardActions
                    isActive={routine.isActive}
                    routineId={routine.id}
                    routineName={routine.name}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-muted">
                  <span className="inline-flex items-center gap-2">
                    <Dumbbell className="size-4" />
                    {routine.exerciseCount} ejercicios
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4" />
                    {routine.creatorName}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="size-4" />
                    {formatDate(routine.updatedAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </AppPanel>
    </AppScreen>
  );
}

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  History,
  Layers3,
  ListChecks,
  NotebookTabs,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { RoutineExerciseList } from "@/components/app/routine-exercise-list";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutTemplateSnapshotView } from "@/components/app/workout-template-snapshot-view";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
  getClientTrainingOverview,
  getRoutineManagementOverview,
} from "@/lib/routines/data";
import { listWorkoutTemplates } from "@/lib/workout-templates/data";
import { cn } from "@/lib/utils";
import type {
  RoutineAssignmentState,
  RoutineAssignmentSummary,
} from "@/types/routine";

const assignmentStateLabels: Record<RoutineAssignmentState, string> = {
  active: "Vigente",
  archived: "Anterior",
  expired: "Caducada",
  upcoming: "Proxima",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function remainingLabel(assignment: RoutineAssignmentSummary) {
  if (assignment.state === "expired") {
    return "El periodo termino. Sigue asignada hasta que tu entrenador la renueve o archive.";
  }

  if (assignment.state === "upcoming") {
    return `Inicia el ${formatDate(assignment.startDate)}.`;
  }

  if (assignment.daysRemaining === 0) {
    return "Vence hoy.";
  }

  if (assignment.daysRemaining !== null) {
    return `${assignment.daysRemaining} ${
      assignment.daysRemaining === 1 ? "dia restante" : "dias restantes"
    }.`;
  }

  return "Vigencia sin fecha de cierre.";
}

function getCurrentCycleDay(
  startDate: string | null,
  cycleDays: number,
) {
  if (!startDate || cycleDays < 1) {
    return 1;
  }

  const [year, month, day] = startDate.split("-").map(Number);
  const startUtc = Date.UTC(year, month - 1, day);
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const elapsedDays = Math.max(
    0,
    Math.floor((todayUtc - startUtc) / 86_400_000),
  );

  return (elapsedDays % cycleDays) + 1;
}

async function ClientTrainingPage({
  access,
}: {
  access: Awaited<ReturnType<typeof requireRouteAccess>>;
}) {
  const overview = await getClientTrainingOverview(access.userId);
  const current = overview.currentAssignment;
  const currentCycleDay = overview.currentTemplate
    ? getCurrentCycleDay(
        current?.startDate ?? null,
        overview.currentTemplate.template.cycleDays,
      )
    : null;

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Mi entrenamiento"
        title="Entrenamiento"
        description="Plantilla actual, ciclo diario e historial de entrenamiento asignado a tu cuenta."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Estado actual"
          value={current ? assignmentStateLabels[current.state] : "Sin plantilla"}
          detail={
            current
              ? remainingLabel(current)
              : "Tu entrenador aún no ha asignado una plantilla"
          }
        />
        <StatTile
          label="Duracion"
          value={
            current?.durationWeeks
              ? `${current.durationWeeks} sem`
              : "Sin definir"
          }
          detail={
            current
              ? `${formatDate(current.startDate)} - ${formatDate(current.endDate)}`
              : "Se mostrara al recibir una asignacion"
          }
        />
        <StatTile
          label="Plantillas anteriores"
          value={String(overview.history.length)}
          detail="Historial conservado"
        />
      </section>

      <AppPanel
        title="Plantilla actual"
        description="Consulta la vigencia, el día actual del ciclo y los entrenamientos indicados."
      >
        {current ? (
          <div className="space-y-5">
            <article
              className={cn(
                "rounded-[24px] border p-5",
                current.state === "expired"
                  ? "border-danger/25 bg-danger/5"
                  : "border-primary/30 bg-primary-soft/55",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {current.state === "expired" ? (
                      <AlertTriangle
                        className="size-5 text-danger"
                        aria-hidden="true"
                      />
                    ) : (
                      <CheckCircle2
                        className="size-5 text-warm-brown"
                        aria-hidden="true"
                      />
                    )}
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-charcoal">
                      {assignmentStateLabels[current.state]}
                    </span>
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold text-charcoal">
                    {current.title}
                  </h2>
                  {current.description ? (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                      {current.description}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-[18px] border border-border bg-surface px-4 py-3 text-sm font-extrabold text-charcoal">
                  {remainingLabel(current)}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-charcoal/10 pt-4 text-sm font-bold text-warm-brown">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Inicio: {formatDate(current.startDate)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4" aria-hidden="true" />
                  Fin: {formatDate(current.endDate)}
                </span>
              </div>
            </article>

            {overview.currentTemplate ? (
              <>
                <div className="rounded-[20px] border border-primary/25 bg-primary-soft/45 p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                    Ciclo actual
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-charcoal">
                    Día {currentCycleDay} de{" "}
                    {overview.currentTemplate.template.cycleDays}
                  </p>
                </div>
                <WorkoutTemplateSnapshotView
                  currentDayNumber={currentCycleDay}
                  snapshot={overview.currentTemplate}
                />
              </>
            ) : (
              <RoutineExerciseList
                emptyMessage="Esta asignación heredada no tiene ejercicios disponibles."
                exercises={overview.currentRoutine?.exercises ?? []}
              />
            )}
          </div>
        ) : (
          <EmptyState>
            No hay una plantilla asignada actualmente. Cuando tu entrenador
            cree una asignación aparecerá aquí.
          </EmptyState>
        )}
      </AppPanel>

      <AppPanel
        title="Historial de plantillas"
        description="Las asignaciones anteriores permanecen visibles con sus fechas y estado."
        tone="accent"
      >
        {overview.history.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {overview.history.map((assignment) => {
              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <History
                      className="size-5 text-warm-brown"
                      aria-hidden="true"
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                        Copia historica
                      </span>
                      <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-charcoal">
                        {assignmentStateLabels[assignment.state]}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold text-charcoal">
                    {assignment.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {formatDate(assignment.startDate)} -{" "}
                    {formatDate(assignment.endDate)}
                  </p>
                  {assignment.detailAvailable ? (
                    <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-warm-brown transition group-hover:text-charcoal">
                      Ver detalle
                      <ArrowRight
                        className="size-4 transition group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  ) : (
                    <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
                      Informacion historica no disponible
                    </p>
                  )}
                </>
              );

              return assignment.detailAvailable ? (
                <Link
                  key={assignment.id}
                  href={`/app/entrenamiento/historial/${assignment.id}`}
                  className="group rounded-[20px] border border-charcoal/10 bg-surface p-4 outline-none transition hover:border-primary/50 hover:shadow-soft focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/35"
                  aria-label={`Ver detalle de ${assignment.title}`}
                >
                  {content}
                </Link>
              ) : (
                <article
                  key={assignment.id}
                  className="rounded-[20px] border border-charcoal/10 bg-background/70 p-4"
                >
                  {content}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
            <NotebookTabs className="size-5 text-warm-brown" />
            <p className="mt-4 text-sm font-semibold leading-6 text-muted">
              Todavía no hay plantillas anteriores.
            </p>
          </div>
        )}
      </AppPanel>
    </AppScreen>
  );
}

export default async function TrainingPage() {
  const access = await requireRouteAccess("/app/entrenamiento");

  if (access.isClient) {
    return <ClientTrainingPage access={access} />;
  }

  const overview = await getRoutineManagementOverview();

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Entrenamiento"
        title="Gestion de entrenamiento"
        description="Administra primero la biblioteca de ejercicios y luego construye rutinas con esos ejercicios."
      />

      <TrainingSectionNav active="overview" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Ejercicios activos"
          value={String(overview.exerciseCount)}
          detail="Disponibles para construir rutinas"
        />
        <StatTile
          label="Rutinas"
          value={String(overview.routines.length)}
          detail="Plantillas creadas"
        />
        <StatTile
          label="Rutinas activas"
          value={String(overview.activeCount)}
          detail="Listas para utilizar"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Link
          href="/app/entrenamiento/ejercicios"
          className="group rounded-[28px] border border-border bg-surface p-6 shadow-soft transition hover:border-primary/40 hover:bg-primary-soft/30"
        >
          <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-charcoal">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-charcoal">
            Ejercicios
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Crea, edita y desactiva ejercicios. Aqui se guardan instrucciones,
            dificultad, grupo muscular, categoria, tipo y recurso externo.
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-warm-brown group-hover:text-charcoal">
            Gestionar ejercicios
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/app/entrenamiento/rutinas"
          className="group rounded-[28px] border border-charcoal/10 bg-accent-soft p-6 shadow-soft transition hover:border-primary/40 hover:bg-primary-soft/40"
        >
          <div className="grid size-12 place-items-center rounded-full bg-surface text-charcoal">
            <ListChecks className="size-5" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-charcoal">Rutinas</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Construye rutinas seleccionando ejercicios previamente creados y
            configura series, repeticiones, descanso, notas y orden.
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-warm-brown group-hover:text-charcoal">
            Gestionar rutinas
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/app/entrenamiento/asignaciones"
          className="group rounded-[28px] border border-border bg-surface p-6 shadow-soft transition hover:border-primary/40 hover:bg-primary-soft/30"
        >
          <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-charcoal">
            <ClipboardCheck className="size-5" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-charcoal">
            Asignaciones
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Consulta los clientes disponibles, asigna rutinas activas y
            archiva asignaciones sin perder el historial.
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-warm-brown group-hover:text-charcoal">
            Gestionar asignaciones
            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </AppScreen>
  );
}

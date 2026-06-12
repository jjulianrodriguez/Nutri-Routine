import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  History,
  ListChecks,
  NotebookTabs,
  Repeat2,
  TimerReset,
} from "lucide-react";
import Link from "next/link";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
  getClientTrainingOverview,
  getRoutineManagementOverview,
} from "@/lib/routines/data";
import { formatRestTime } from "@/lib/routines/format";
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
    return "El periodo termino. Debes solicitar una actualizacion.";
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

async function ClientTrainingPage({
  access,
}: {
  access: Awaited<ReturnType<typeof requireRouteAccess>>;
}) {
  const overview = await getClientTrainingOverview(access.userId);
  const current = overview.currentAssignment;

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Mi entrenamiento"
        title="Entrenamiento"
        description="Rutina actual, historial de rutinas y recursos de entrenamiento asignados a tu cuenta."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Estado actual"
          value={current ? assignmentStateLabels[current.state] : "Sin rutina"}
          detail={
            current
              ? remainingLabel(current)
              : "Tu entrenador aun no ha asignado una rutina"
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
          label="Rutinas anteriores"
          value={String(overview.history.length)}
          detail="Historial conservado"
        />
      </section>

      <AppPanel
        title="Rutina actual"
        description="Consulta la vigencia y sigue los ejercicios en el orden indicado por tu entrenador."
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

            {overview.currentRoutine?.exercises.length ? (
              <div className="space-y-4">
                {overview.currentRoutine.exercises.map((item, index) => (
                  <article
                    key={item.id}
                    className="rounded-[22px] border border-border bg-background p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-charcoal">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-charcoal">
                          {item.exercise.name}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-warm-brown">
                          {item.exercise.muscleGroup} -{" "}
                          {item.exercise.exerciseType}
                        </p>
                        {item.exercise.description ? (
                          <p className="mt-3 text-sm leading-6 text-muted">
                            {item.exercise.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <RoutineValue
                        icon={Dumbbell}
                        label="Series"
                        value={item.series?.toString() ?? "Opcional"}
                      />
                      <RoutineValue
                        icon={Repeat2}
                        label="Repeticiones"
                        value={item.repetitions ?? "Opcional"}
                      />
                      <RoutineValue
                        icon={TimerReset}
                        label="Descanso"
                        value={formatRestTime(item.restSeconds)}
                      />
                    </div>

                    {item.notes ? (
                      <p className="mt-4 rounded-[16px] bg-surface p-4 text-sm leading-6 text-charcoal">
                        <strong>Notas:</strong> {item.notes}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState>
                Esta asignacion no tiene un detalle de ejercicios disponible.
              </EmptyState>
            )}
          </div>
        ) : (
          <EmptyState>
            No hay una rutina asignada actualmente. Cuando tu entrenador cree
            una asignacion aparecera aqui.
          </EmptyState>
        )}
      </AppPanel>

      <AppPanel
        title="Historial de rutinas"
        description="Las asignaciones anteriores permanecen visibles con sus fechas y estado."
        tone="accent"
      >
        {overview.history.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {overview.history.map((assignment) => (
              <article
                key={assignment.id}
                className="rounded-[20px] border border-charcoal/10 bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <History className="size-5 text-warm-brown" aria-hidden="true" />
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-charcoal">
                    {assignmentStateLabels[assignment.state]}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-charcoal">
                  {assignment.title}
                </h3>
                <p className="mt-2 text-sm text-muted">
                  {formatDate(assignment.startDate)} -{" "}
                  {formatDate(assignment.endDate)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-charcoal/10 bg-surface p-4">
            <NotebookTabs className="size-5 text-warm-brown" />
            <p className="mt-4 text-sm font-semibold leading-6 text-muted">
              Todavia no hay rutinas anteriores.
            </p>
          </div>
        )}
      </AppPanel>
    </AppScreen>
  );
}

function RoutineValue({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Dumbbell;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface p-3">
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-charcoal">{value}</p>
    </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
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
      </div>
    </AppScreen>
  );
}

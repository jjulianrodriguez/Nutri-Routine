import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Dumbbell,
  Pencil,
  Repeat2,
  TimerReset,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  AppHeader,
  AppPanel,
  AppScreen,
  EmptyState,
} from "@/components/app/AppScreen";
import { DeleteRoutineButton } from "@/components/app/delete-routine-button";
import { RoutineAssignmentForm } from "@/components/app/routine-assignment-form";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
  getRoutineDetail,
  listAssignableTrainingClients,
} from "@/lib/routines/data";
import { formatRestTime } from "@/lib/routines/format";
import type { RoutineDifficulty } from "@/types/routine";

const difficultyLabels: Record<RoutineDifficulty, string> = {
  advanced: "Avanzada",
  beginner: "Principiante",
  intermediate: "Intermedia",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function RoutineDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const access = await requireRouteAccess("/app/entrenamiento/rutinas");

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const { id } = await params;
  const [routine, clients] = await Promise.all([
    getRoutineDetail(id),
    listAssignableTrainingClients(access),
  ]);

  if (!routine) {
    notFound();
  }

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Detalle de rutina"
        title={routine.name}
        description={routine.description}
      />
      <TrainingSectionNav active="routines" />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
        <Button asChild variant="outline" size="lg">
          <Link href="/app/entrenamiento">
            <ArrowLeft className="size-4" />
            Volver a rutinas
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <DeleteRoutineButton routineId={routine.id} />
          <Button asChild size="lg">
            <Link href={`/app/entrenamiento/rutinas/${routine.id}/editar`}>
              <Pencil className="size-4" />
              Editar rutina
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Dificultad</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {difficultyLabels[routine.difficulty]}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Categoria</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {routine.category}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Publico objetivo</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {routine.targetAudience}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Estado</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {routine.isActive ? "Activa" : "Inactiva"}
          </p>
        </div>
      </section>

      <AppPanel
        title="Asignar a un cliente"
        description="La nueva asignacion archiva la rutina activa anterior de ese cliente y conserva su historial."
        tone="primary"
      >
        <RoutineAssignmentForm
          clients={clients}
          defaultStartDate={new Date().toISOString().slice(0, 10)}
          routineId={routine.id}
        />
      </AppPanel>

      <AppPanel
        title="Ejercicios"
        description={`${routine.exercises.length} ejercicios configurados en orden de ejecucion.`}
      >
        {routine.exercises.length === 0 ? (
          <EmptyState>Esta rutina todavia no tiene ejercicios.</EmptyState>
        ) : (
          <div className="space-y-4">
            {routine.exercises.map((item, index) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-border bg-background p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-charcoal">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-semibold text-charcoal">
                      {item.exercise.name}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-warm-brown">
                      {item.exercise.category} · {item.exercise.muscleGroup} ·{" "}
                      {item.exercise.exerciseType}
                    </p>
                    {item.exercise.description ? (
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {item.exercise.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ConfigValue
                    icon={Dumbbell}
                    label="Series"
                    value={item.series?.toString() ?? "Opcional"}
                  />
                  <ConfigValue
                    icon={Repeat2}
                    label="Repeticiones"
                    value={item.repetitions ?? "Opcional"}
                  />
                  <ConfigValue
                    icon={TimerReset}
                    label="Descanso"
                    value={
                      item.restSeconds === null
                        ? "Opcional"
                        : formatRestTime(item.restSeconds)
                    }
                  />
                  <ConfigValue
                    icon={Clock3}
                    label="Duracion"
                    value={
                      item.durationMinutes === null
                        ? "Opcional"
                        : `${item.durationMinutes} min`
                    }
                  />
                </div>

                {item.notes ? (
                  <div className="mt-4 rounded-[18px] border border-primary/20 bg-primary-soft p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                      Notas
                    </p>
                    <p className="mt-2 text-sm leading-6 text-charcoal">
                      {item.notes}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </AppPanel>

      <AppPanel
        title="Registro"
        description="Informacion de autoria y mantenimiento de la plantilla."
        tone="accent"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetaValue
            icon={UserRound}
            label="Creador"
            value={routine.creatorName}
          />
          <MetaValue
            icon={CalendarDays}
            label="Creada"
            value={formatDate(routine.createdAt)}
          />
          <MetaValue
            icon={CalendarDays}
            label="Actualizada"
            value={formatDate(routine.updatedAt)}
          />
        </div>
      </AppPanel>
    </AppScreen>
  );
}

function ConfigValue({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Dumbbell;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-border bg-surface p-4">
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-charcoal">{value}</p>
    </div>
  );
}

function MetaValue({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-charcoal/10 bg-surface p-4">
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-charcoal">{value}</p>
    </div>
  );
}

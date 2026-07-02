import {
  ArrowLeft,
  CalendarDays,
  Layers3,
  Pencil,
  TriangleAlert,
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
import { GroupedRoutineExercises } from "@/components/app/grouped-routine-exercises";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { WorkoutExerciseCard } from "@/components/app/workout-exercise-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineDetail } from "@/lib/routines/data";
import type { RoutineDifficulty } from "@/types/routine";

const difficultyLabels: Record<RoutineDifficulty, string> = {
  advanced: "Avanzado",
  beginner: "Principiante",
  intermediate: "Intermedio",
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
  const routine = await getRoutineDetail(id);

  if (!routine) {
    notFound();
  }

  const inactiveExerciseCount = routine.exercises.filter(
    (item) => !item.exercise.isActive,
  ).length;

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Detalle de entrenamiento"
        title={routine.name}
        description={routine.description}
      />
      <TrainingSectionNav active="routines" />

      {inactiveExerciseCount > 0 ? (
        <Alert className="rounded-[18px] border-primary/40 bg-primary-soft/45 px-4 py-3 text-charcoal">
          <TriangleAlert
            className="size-5 text-warm-brown"
            aria-hidden="true"
          />
          <AlertDescription className="font-semibold leading-6 text-charcoal">
            {inactiveExerciseCount === 1
              ? "Este entrenamiento contiene 1 ejercicio desactivado."
              : `Este entrenamiento contiene ${inactiveExerciseCount} ejercicios desactivados.`}{" "}
            Se conserva en este entrenamiento, pero no está disponible para
            agregarlo a entrenamientos nuevos.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
        <Button asChild variant="outline" size="lg">
          <Link href="/app/entrenamiento/rutinas">
            <ArrowLeft className="size-4" />
            Volver a entrenamientos
          </Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" size="lg">
            <Link
              href={`/app/entrenamiento/plantillas/nueva?training=${routine.id}`}
            >
              <Layers3 className="size-4" />
              Usar en plantilla
            </Link>
          </Button>
          <DeleteRoutineButton routineId={routine.id} />
          <Button asChild size="lg">
            <Link href={`/app/entrenamiento/rutinas/${routine.id}/editar`}>
              <Pencil className="size-4" />
              Editar entrenamiento
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="h-fit self-start rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Dificultad</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {difficultyLabels[routine.difficulty]}
          </p>
        </div>
        <div className="h-fit self-start rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Categoría</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {routine.category}
          </p>
        </div>
        <div className="h-fit self-start rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Publico objetivo</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {routine.targetAudience}
          </p>
        </div>
        <div className="h-fit self-start rounded-[24px] border border-border bg-surface p-5 shadow-soft">
          <p className="text-sm font-bold text-muted">Estado</p>
          <p className="mt-3 text-xl font-extrabold text-charcoal">
            {routine.isActive ? "Activo" : "Inactivo"}
          </p>
        </div>
      </section>

      <AppPanel
        title="Ejercicios"
        description={`${routine.exercises.length} ejercicios configurados en orden de ejecucion.`}
      >
        {routine.exercises.length === 0 ? (
          <EmptyState>
            Este entrenamiento todavía no tiene ejercicios.
          </EmptyState>
        ) : (
          <GroupedRoutineExercises
            exercises={routine.exercises}
            itemsClassName="space-y-4"
            renderExercise={(item, index) => (
              <WorkoutExerciseCard
                key={item.id}
                context="professional"
                exercise={item}
                order={index + 1}
              />
            )}
          />
        )}
      </AppPanel>

      <AppPanel
        title="Registro"
        description="Información de autoría y mantenimiento del entrenamiento."
        tone="accent"
      >
        <div className="grid items-start gap-3 sm:grid-cols-3">
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
    <div className="h-fit self-start rounded-[18px] border border-charcoal/10 bg-surface p-4">
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="mt-1 font-extrabold text-charcoal">{value}</p>
    </div>
  );
}

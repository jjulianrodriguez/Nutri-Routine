import {
  Clock3,
  Dumbbell,
  Repeat2,
  TimerReset,
} from "lucide-react";

import { EmptyState } from "@/components/app/AppScreen";
import { formatRestTime } from "@/lib/routines/format";
import type { RoutineExerciseDetail } from "@/types/routine";

export function RoutineExerciseList({
  emptyMessage = "Esta rutina no tiene ejercicios disponibles.",
  exercises,
}: {
  emptyMessage?: string;
  exercises: RoutineExerciseDetail[];
}) {
  if (exercises.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  return (
    <div className="space-y-4">
      {exercises.map((item, index) => (
        <article
          key={item.id}
          className="rounded-[22px] border border-border bg-background p-5"
        >
          <div className="flex items-start gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-extrabold text-charcoal">
              <span className="sr-only">Orden </span>
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-charcoal">
                {item.exercise.name}
              </h3>
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

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <RoutineValue
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
            <div className="mt-4 rounded-[16px] bg-surface p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
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

import { CalendarDays, CheckCircle2 } from "lucide-react";

import { RoutineExerciseList } from "@/components/app/routine-exercise-list";
import { cn } from "@/lib/utils";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

export function WorkoutTemplateSnapshotView({
  currentDayNumber,
  snapshot,
}: {
  currentDayNumber?: number | null;
  snapshot: WorkoutTemplateSnapshot;
}) {
  return (
    <div className="space-y-5">
      {snapshot.days.map((day) => {
        const isCurrent = currentDayNumber === day.dayNumber;

        return (
          <article
            key={`${day.dayNumber}-${day.routine.id}`}
            className={cn(
              "rounded-[24px] border p-5",
              isCurrent
                ? "border-primary bg-primary-soft/40 shadow-soft"
                : "border-border bg-background",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-charcoal">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Día {day.dayNumber}
                  </span>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-extrabold text-charcoal">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      Día actual
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-charcoal">
                  {day.routine.name}
                </h3>
                <p className="mt-2 text-sm font-bold text-warm-brown">
                  {day.routine.category} · {day.routine.targetAudience}
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                  {day.routine.description}
                </p>
              </div>
              <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                {day.routine.exercises.length} ejercicios
              </span>
            </div>

            <div className="mt-5 border-t border-border pt-5">
              <RoutineExerciseList
                emptyMessage="Este entrenamiento no tiene ejercicios disponibles."
                exercises={day.routine.exercises}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

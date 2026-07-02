"use client";

import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Dumbbell,
  ExternalLink,
  Play,
  Repeat2,
  TimerReset,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getExternalResourcePresentation,
  normalizeExerciseMultimediaUrls,
} from "@/lib/exercises/multimedia";
import { formatRestTime } from "@/lib/routines/format";
import { cn } from "@/lib/utils";
import type { RoutineExerciseDetail } from "@/types/routine";

type WorkoutExerciseCardContext = "client" | "professional";

type WorkoutExerciseCardProps = {
  completed?: boolean;
  context?: WorkoutExerciseCardContext;
  disabled?: boolean;
  exercise: RoutineExerciseDetail;
  isCurrent?: boolean;
  onToggle?: (exerciseId: string, completed: boolean) => void;
  order: number;
  pending?: boolean;
};

export function WorkoutExerciseCard({
  completed = false,
  context = "client",
  disabled,
  exercise,
  isCurrent = false,
  onToggle,
  order,
  pending,
}: WorkoutExerciseCardProps) {
  const multimediaUrls = normalizeExerciseMultimediaUrls(
    exercise.exercise.multimediaUrls,
    exercise.exercise.multimediaUrl,
  );
  const hasDetails = Boolean(
    exercise.exercise.description ||
      exercise.notes ||
      exercise.durationMinutes !== null ||
      multimediaUrls.length > 0,
  );
  const showProgressAction = Boolean(onToggle && isCurrent);
  const showProfessionalMeta = context === "professional";

  return (
    <article
      className={cn(
        "rounded-[22px] border p-4 transition sm:p-5",
        completed
          ? "border-primary/45 bg-primary-soft/40"
          : "border-border bg-background",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold",
              completed
                ? "bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground",
            )}
          >
            {order}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xl font-semibold leading-tight text-foreground">
                {exercise.exercise.name}
              </h4>
              {completed ? (
                <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-primary-foreground">
                  Realizado
                </span>
              ) : null}
              {showProfessionalMeta && !exercise.exercise.isActive ? (
                <span className="rounded-full bg-danger/10 px-2.5 py-1 text-xs font-extrabold text-danger">
                  Desactivado
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-bold text-muted-foreground">
              {exercise.exercise.muscleGroup} / {exercise.exercise.category}
              {showProfessionalMeta ? ` / ${exercise.exercise.exerciseType}` : ""}
            </p>
          </div>
        </div>

        {showProgressAction ? (
          <Button
            type="button"
            variant={completed ? "outline" : "default"}
            size="sm"
            disabled={disabled}
            aria-pressed={completed}
            onClick={() => onToggle?.(exercise.id, !completed)}
          >
            {pending ? (
              <Clock3 aria-hidden="true" />
            ) : completed ? (
              <CheckCircle2 aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
            {pending
              ? "Guardando..."
              : completed
                ? "Desmarcar"
                : "Marcar realizado"}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <ExerciseValue
          icon={Dumbbell}
          label="Series"
          value={exercise.series?.toString() ?? "Opcional"}
        />
        <ExerciseValue
          icon={Repeat2}
          label="Repeticiones"
          value={exercise.repetitions ?? "Opcional"}
        />
        <ExerciseValue
          icon={TimerReset}
          label="Descanso"
          value={formatRestTime(exercise.restSeconds)}
        />
        <ExerciseValue
          icon={Clock3}
          label="Duracion"
          value={
            exercise.durationMinutes === null
              ? "Opcional"
              : `${exercise.durationMinutes} min`
          }
        />
      </div>

      {hasDetails ? (
        <details className="group mt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-control border border-border bg-surface px-4 text-sm font-extrabold text-muted-foreground outline-none transition hover:border-primary/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden">
            Instrucciones y recursos
            <ChevronDown
              className="size-4 transition group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="mt-3 space-y-3 rounded-[18px] border border-border bg-surface p-4">
            {exercise.exercise.description ? (
              <p className="text-sm leading-6 text-muted">
                {exercise.exercise.description}
              </p>
            ) : null}
            {exercise.notes ? (
              <div className="rounded-[14px] bg-background p-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-muted">
                  Notas
                </p>
                <p className="mt-1 text-sm leading-6 text-foreground">
                  {exercise.notes}
                </p>
              </div>
            ) : null}
            {multimediaUrls.length > 0 ? (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-muted">
                  Materiales del ejercicio
                </p>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                  Recursos propios de este ejercicio para revisar tecnica o
                  referencia.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {multimediaUrls.map((url) => {
                    const resource = getExternalResourcePresentation(url);

                    return (
                      <Button key={url} asChild variant="outline" size="sm">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={resource.domain}
                        >
                          <ExternalLink aria-hidden="true" />
                          {resource.label}
                        </a>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function ExerciseValue({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface px-3 py-3">
      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
      <p className="mt-2 text-[11px] font-extrabold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-extrabold text-foreground">
        {value}
      </p>
    </div>
  );
}

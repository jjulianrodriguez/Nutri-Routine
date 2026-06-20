import {
  ChevronDown,
  Clock3,
  Dumbbell,
  ExternalLink,
  Repeat2,
  TimerReset,
} from "lucide-react";

import { EmptyState } from "@/components/app/AppScreen";
import { GroupedRoutineExercises } from "@/components/app/grouped-routine-exercises";
import { Button } from "@/components/ui/button";
import {
  getExternalResourcePresentation,
  normalizeExerciseMultimediaUrls,
} from "@/lib/exercises/multimedia";
import { formatRestTime } from "@/lib/routines/format";
import type { RoutineExerciseDetail } from "@/types/routine";

const difficultyLabels: Record<string, string> = {
  advanced: "Avanzado",
  beginner: "Principiante",
  intermediate: "Intermedio",
};

export function RoutineExerciseList({
  emptyMessage = "Este entrenamiento no tiene ejercicios disponibles.",
  exercises,
  variant = "default",
}: {
  emptyMessage?: string;
  exercises: RoutineExerciseDetail[];
  variant?: "compact" | "default";
}) {
  if (exercises.length === 0) {
    return <EmptyState>{emptyMessage}</EmptyState>;
  }

  if (variant === "compact") {
    return (
      <GroupedRoutineExercises
        exercises={exercises}
        itemsClassName="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        renderExercise={(item, index) => (
          <CompactRoutineExercise
            key={item.id}
            item={item}
            order={index + 1}
          />
        )}
      />
    );
  }

  return (
    <GroupedRoutineExercises
      exercises={exercises}
      itemsClassName="space-y-4"
      renderExercise={(item, index) => {
        const multimediaUrls = normalizeExerciseMultimediaUrls(
          item.exercise.multimediaUrls,
          item.exercise.multimediaUrl,
        );

        return (
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

            {multimediaUrls.length > 0 ? (
              <div className="mt-4 rounded-[16px] border border-primary/25 bg-primary-soft/35 p-4">
                <div className="flex items-center gap-2">
                  <ExternalLink
                    className="size-4 text-warm-brown"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
                    Materiales del ejercicio
                  </p>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                  Recursos propios de este ejercicio para revisar tecnica o
                  referencia.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {multimediaUrls.map((url) => {
                    const resource =
                      getExternalResourcePresentation(url);

                    return (
                      <Button
                        key={url}
                        asChild
                        variant="outline"
                        size="sm"
                      >
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
        );
      }}
    />
  );
}

function CompactRoutineExercise({
  item,
  order,
}: {
  item: RoutineExerciseDetail;
  order: number;
}) {
  const multimediaUrls = normalizeExerciseMultimediaUrls(
    item.exercise.multimediaUrls,
    item.exercise.multimediaUrl,
  );
  const hasExtraDetails = Boolean(
    item.exercise.description ||
      item.notes ||
      item.durationMinutes !== null ||
      multimediaUrls.length > 0,
  );

  return (
    <article className="flex min-h-52 min-w-0 flex-col rounded-[18px] border border-border border-l-4 border-l-primary bg-surface p-4 shadow-[0_8px_22px_rgba(63,49,40,0.06)] sm:p-5">
      <div className="flex min-w-0 items-start gap-3 border-b border-border pb-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-charcoal">
          <span className="sr-only">Orden </span>
          {order}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-warm-brown">
            Ejercicio
          </p>
          <h4
            className="mt-1 line-clamp-2 text-lg font-black leading-6 tracking-[-0.01em] text-charcoal"
            title={item.exercise.name}
          >
            {item.exercise.name}
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-extrabold text-warm-brown">
              {item.exercise.muscleGroup}
            </span>
            {item.exercise.difficulty ? (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-extrabold text-charcoal">
                {difficultyLabels[item.exercise.difficulty] ??
                  item.exercise.difficulty}
              </span>
            ) : null}
            {multimediaUrls.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-charcoal">
                <ExternalLink className="size-3.5" aria-hidden="true" />
                {multimediaUrls.length}{" "}
                {multimediaUrls.length === 1 ? "recurso" : "recursos"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <CompactValue
          label="Series"
          value={item.series?.toString() ?? "—"}
        />
        <CompactValue
          label="Reps."
          value={item.repetitions ?? "—"}
        />
        <CompactValue
          label="Descanso"
          value={formatRestTime(item.restSeconds)}
        />
      </div>

      {hasExtraDetails ? (
        <details className="group mt-auto pt-4">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-control border border-border bg-background px-3.5 text-sm font-extrabold text-warm-brown outline-none transition hover:border-primary/40 hover:text-charcoal focus-visible:ring-3 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden">
            Ver detalles
            <ChevronDown
              className="size-4 transition group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="mt-3 space-y-3 border-t border-border pt-3">
            {item.exercise.description ? (
              <p className="text-sm leading-6 text-muted">
                {item.exercise.description}
              </p>
            ) : null}
            {item.durationMinutes !== null ? (
              <p className="text-sm font-semibold text-charcoal">
                Duración estimada: {item.durationMinutes} min
              </p>
            ) : null}
            {item.notes ? (
              <div className="rounded-[14px] bg-background p-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-muted">
                  Notas
                </p>
                <p className="mt-1 text-sm leading-5 text-charcoal">
                  {item.notes}
                </p>
              </div>
            ) : null}
            {multimediaUrls.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.1em] text-muted">
                  Materiales del ejercicio
                </p>
                <div className="flex flex-wrap gap-2">
                  {multimediaUrls.map((url) => {
                    const resource =
                      getExternalResourcePresentation(url);

                    return (
                      <Button
                        key={url}
                        asChild
                        variant="outline"
                        size="sm"
                      >
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

function CompactValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-[13px] border border-border/70 bg-background px-2 py-3 text-center">
      <p className="truncate text-[11px] font-extrabold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black leading-5 text-charcoal">
        {value}
      </p>
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

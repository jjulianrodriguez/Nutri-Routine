"use client";

import {
  Check,
  ChevronRight,
  Dumbbell,
  Layers3,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ClientAvatar } from "@/components/app/client-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ExerciseOption } from "@/types/exercise";
import type {
  AssignableRoutine,
  AssignableTrainingClient,
  RoutineDifficulty,
} from "@/types/routine";
import type { AssignableWorkoutTemplate } from "@/types/workout-template";

const difficultyLabels: Record<RoutineDifficulty, string> = {
  advanced: "Avanzada",
  beginner: "Principiante",
  intermediate: "Intermedia",
};

export function AssignmentEntitySelector({
  children,
  emptyMessage,
  error,
  id,
  isLoading = false,
  label,
  loadMoreLabel,
  onQueryChange,
  onLoadMore,
  query,
  resultCount,
  searchPlaceholder,
  totalCount,
  visibleCount,
}: {
  children: ReactNode;
  emptyMessage: string;
  error?: string;
  id: string;
  isLoading?: boolean;
  label: string;
  loadMoreLabel: string;
  onQueryChange: (value: string) => void;
  onLoadMore?: () => void;
  query: string;
  resultCount: number;
  searchPlaceholder: string;
  totalCount: number;
  visibleCount: number;
}) {
  const hasMore = visibleCount < resultCount;

  return (
    <section
      className={cn(
        "min-w-0 rounded-[24px] border bg-background/75 p-4",
        error ? "border-danger/35" : "border-charcoal/10",
      )}
    >
      <Label htmlFor={id} className="font-extrabold text-charcoal">
        {label}
      </Label>
      <p
        className="mt-1 text-xs font-semibold text-muted"
        aria-live="polite"
      >
        Mostrando {visibleCount} de {resultCount} resultados
        {resultCount !== totalCount ? ` (${totalCount} disponibles)` : ""}
      </p>

      <div className="relative mt-3">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-12 rounded-control border-border bg-surface pl-11 pr-4 text-charcoal shadow-soft"
          placeholder={searchPlaceholder}
          autoComplete="off"
        />
      </div>

      {error ? (
        <p className="mt-2 text-sm font-semibold text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div
        className="mt-4 max-h-[32rem] space-y-3 overflow-x-hidden overflow-y-auto overscroll-contain pr-1"
        aria-busy={isLoading}
      >
        {resultCount > 0 ? (
          <>
            {children}
            {hasMore && onLoadMore ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {isLoading ? "Cargando..." : loadMoreLabel}
              </Button>
            ) : null}
          </>
        ) : (
          <div className="rounded-[18px] border border-dashed border-border bg-surface p-4 text-sm font-semibold leading-6 text-muted">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}

export function ClientSearchCard({
  client,
  onSelect,
  selected,
}: {
  client: AssignableTrainingClient;
  onSelect: (clientId: string) => void;
  selected: boolean;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] border bg-surface transition",
        selected
          ? "border-primary bg-primary-soft/25 shadow-glow"
          : "border-border hover:border-primary/45 hover:shadow-soft",
      )}
    >
      <Link
        href={`/app/clientes/${client.id}`}
        className="group block p-4 outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
        aria-label={`Abrir perfil de ${client.name}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <ClientAvatar
            name={client.name}
            src={client.avatarUrl}
            className="ring-1 ring-charcoal/10"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-extrabold text-charcoal">
                  {client.name}
                </h3>
                <p className="mt-1 truncate text-xs font-semibold text-muted">
                  {client.contact ?? `Perfil ${client.id.slice(0, 8)}`}
                </p>
              </div>
              <ChevronRight
                className="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-charcoal"
                aria-hidden="true"
              />
            </div>

            <p className="mt-3 text-xs font-bold text-warm-brown">
              {client.currentAssignment
                ? `Plan actual: ${client.currentAssignment.title}`
                : "Sin plantilla activa"}
            </p>
          </div>
        </div>
      </Link>

      <div className="border-t border-border p-3">
        <Button
          type="button"
          size="sm"
          variant={selected ? "destructive" : "outline"}
          className={cn(
            "min-h-11 w-full",
            selected &&
              "border-danger/35 bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger",
          )}
          onClick={() => onSelect(client.id)}
          aria-pressed={selected}
        >
          {selected ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}
          {selected ? "Quitar cliente" : "Seleccionar cliente"}
        </Button>
      </div>
    </article>
  );
}

export function RoutineSearchCard({
  disabled = false,
  onSelect,
  routine,
  selected,
}: {
  disabled?: boolean;
  onSelect: (routineId: string) => void;
  routine: AssignableRoutine;
  selected: boolean;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] border bg-surface transition",
        selected
          ? "border-primary bg-primary-soft/25 shadow-glow"
          : "border-border hover:border-primary/45 hover:shadow-soft",
      )}
    >
      <Link
        href={`/app/entrenamiento/rutinas/${routine.id}`}
        className="group block p-4 outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
        aria-label={`Abrir detalle de ${routine.name}`}
      >
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-charcoal">
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-extrabold text-charcoal">
                  {routine.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-warm-brown">
                  {difficultyLabels[routine.difficulty]} / {routine.category}
                </p>
              </div>
              <ChevronRight
                className="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-charcoal"
                aria-hidden="true"
              />
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
              {routine.description}
            </p>

            {routine.identifier ? (
              <p className="mt-3 w-fit max-w-full truncate rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
                ID: {routine.identifier}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="border-t border-border p-3">
        <Button
          type="button"
          size="sm"
          variant={selected ? "destructive" : "outline"}
          className={cn(
            "min-h-11 w-full",
            selected &&
              "border-danger/35 bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger",
          )}
          onClick={() => onSelect(routine.id)}
          aria-pressed={selected}
          disabled={disabled}
        >
          {selected ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}
          {selected
            ? "Quitar entrenamiento"
            : disabled
              ? "Entrenamiento no disponible"
              : "Seleccionar entrenamiento"}
        </Button>
      </div>
    </article>
  );
}

export function WorkoutTemplateSearchCard({
  onSelect,
  selected,
  template,
}: {
  onSelect: (templateId: string) => void;
  selected: boolean;
  template: AssignableWorkoutTemplate;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] border bg-surface transition",
        selected
          ? "border-primary bg-primary-soft/25 shadow-glow"
          : "border-border hover:border-primary/45 hover:shadow-soft",
      )}
    >
      <Link
        href={`/app/entrenamiento/plantillas/${template.id}`}
        className="group block p-4 outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
        aria-label={`Abrir detalle de ${template.name}`}
      >
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-charcoal">
            <Layers3 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-extrabold text-charcoal">
                  {template.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-warm-brown">
                  Ciclo de {template.cycleDays}{" "}
                  {template.cycleDays === 1 ? "día" : "días"}
                </p>
              </div>
              <ChevronRight
                className="mt-1 size-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-charcoal"
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
              {template.description || "Sin descripción adicional."}
            </p>
          </div>
        </div>
      </Link>

      <div className="border-t border-border p-3">
        <Button
          type="button"
          size="sm"
          variant={selected ? "destructive" : "outline"}
          className={cn(
            "min-h-11 w-full",
            selected &&
              "border-danger/35 bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger",
          )}
          onClick={() => onSelect(template.id)}
          aria-pressed={selected}
        >
          {selected ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}
          {selected ? "Quitar plantilla" : "Seleccionar plantilla"}
        </Button>
      </div>
    </article>
  );
}

export function ExerciseSearchCard({
  exercise,
  onSelect,
  selected,
}: {
  exercise: ExerciseOption;
  onSelect: (exerciseId: string) => void;
  selected: boolean;
}) {
  const difficulty = exercise.difficulty
    ? difficultyLabels[exercise.difficulty]
    : "Sin dificultad";
  const canSelect = exercise.isActive || selected;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-[20px] border bg-surface transition",
        selected
          ? "border-primary bg-primary-soft/25 shadow-glow"
          : "border-border hover:border-primary/45 hover:shadow-soft",
        !exercise.isActive && "border-danger/25",
      )}
    >
      <Link
        href={`/app/entrenamiento/ejercicios/${exercise.id}`}
        className="group block p-4 outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
        aria-label={`Abrir detalle de ${exercise.name}`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-full",
              selected
                ? "bg-primary text-charcoal"
                : "bg-primary-soft text-charcoal",
            )}
          >
            <Dumbbell className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-extrabold text-charcoal">
                  {exercise.name}
                </h3>
                <p className="mt-1 text-xs font-bold text-warm-brown">
                  {exercise.muscleGroup} / {difficulty}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold",
                    exercise.isActive
                      ? "bg-primary-soft text-charcoal"
                      : "bg-danger/10 text-danger",
                  )}
                >
                  {exercise.isActive ? "Activo" : "Inactivo"}
                </span>
                <ChevronRight
                  className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-charcoal"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p className="mt-3 break-words text-xs font-semibold leading-5 text-muted">
              {exercise.category} / {exercise.exerciseType}
            </p>
          </div>
        </div>
      </Link>

      <div className="border-t border-border p-3">
        <Button
          type="button"
          size="sm"
          variant={selected ? "destructive" : "outline"}
          className={cn(
            "min-h-11 w-full",
            selected &&
              "border-danger/35 bg-danger/10 text-danger hover:bg-danger/20 hover:text-danger",
          )}
          onClick={() => onSelect(exercise.id)}
          aria-pressed={selected}
          disabled={!canSelect}
        >
          {selected ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}
          {selected
            ? "Quitar ejercicio"
            : exercise.isActive
              ? "Seleccionar ejercicio"
              : "Ejercicio no disponible"}
        </Button>
      </div>
    </article>
  );
}

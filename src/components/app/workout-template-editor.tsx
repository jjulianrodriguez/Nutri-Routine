"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Layers3,
  Loader2,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  AssignmentEntitySelector,
  RoutineSearchCard,
} from "@/components/app/assignment-entity-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgressiveResults } from "@/hooks/use-progressive-results";
import { saveWorkoutTemplate } from "@/lib/actions/workout-templates";
import {
  workoutTemplateFormSchema,
  type WorkoutTemplateFormValues,
} from "@/lib/validations/workout-templates";
import { cn } from "@/lib/utils";
import type { RoutineListItem } from "@/types/routine";
import type { WorkoutTemplateDetail } from "@/types/workout-template";

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function getDefaultValues(
  template?: WorkoutTemplateDetail,
  defaultRoutineId?: string,
): WorkoutTemplateFormValues {
  if (template) {
    return {
      cycleDays: String(template.cycleDays),
      days: template.days.map((day) => ({
        dayNumber: day.dayNumber,
        routineId: day.routine.id,
      })),
      description: template.description ?? "",
      isActive: template.isActive,
      name: template.name,
    };
  }

  return {
    cycleDays: "7",
    days: Array.from({ length: 7 }, (_, index) => ({
      dayNumber: index + 1,
      routineId: index === 0 ? defaultRoutineId ?? "" : "",
    })),
    description: "",
    isActive: true,
    name: "",
  };
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  ) : null;
}

export function WorkoutTemplateEditor({
  defaultRoutineId,
  routines,
  template,
}: {
  defaultRoutineId?: string;
  routines: RoutineListItem[];
  template?: WorkoutTemplateDetail;
}) {
  const router = useRouter();
  const [activeDay, setActiveDay] = useState(1);
  const [query, setQuery] = useState("");
  const [pendingUpdate, setPendingUpdate] =
    useState<WorkoutTemplateFormValues | null>(null);
  const [serverMessage, setServerMessage] = useState("");
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<WorkoutTemplateFormValues>({
    defaultValues: getDefaultValues(template, defaultRoutineId),
    resolver: zodResolver(workoutTemplateFormSchema),
  });
  const cycleDaysValue = useWatch({ control, name: "cycleDays" });
  const watchedDays = useWatch({ control, name: "days" }) ?? [];
  const cycleDays = Number(cycleDaysValue);
  const selectedForActiveDay = watchedDays.find(
    (day) => day.dayNumber === activeDay,
  )?.routineId;
  const selectedIds = useMemo(
    () => new Set(watchedDays.map((day) => day.routineId).filter(Boolean)),
    [watchedDays],
  );
  const availableRoutines = useMemo(
    () =>
      routines.filter(
        (routine) => routine.isActive || selectedIds.has(routine.id),
      ),
    [routines, selectedIds],
  );
  const filteredRoutines = useMemo(() => {
    const normalized = normalizeSearch(query.trim());

    if (!normalized) {
      return availableRoutines;
    }

    return availableRoutines.filter((routine) =>
      normalizeSearch(
        [
          routine.name,
          routine.description,
          routine.category,
          routine.difficulty,
          routine.targetAudience,
        ].join(" "),
      ).includes(normalized),
    );
  }, [availableRoutines, query]);
  const results = useProgressiveResults(filteredRoutines, 5);

  useEffect(() => {
    if (!Number.isInteger(cycleDays) || cycleDays < 1 || cycleDays > 31) {
      return;
    }

    setValue(
      "days",
      Array.from({ length: cycleDays }, (_, index) => {
        const dayNumber = index + 1;
        const existing = watchedDays.find(
          (day) => day.dayNumber === dayNumber,
        );

        return existing ?? { dayNumber, routineId: "" };
      }),
      { shouldDirty: true, shouldValidate: false },
    );

    if (activeDay > cycleDays) {
      setActiveDay(cycleDays);
    }
    // watchedDays is intentionally excluded to avoid rebuilding on selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay, cycleDays, setValue]);

  function updateQuery(value: string) {
    setQuery(value);
    results.reset();
  }

  function selectRoutine(routineId: string) {
    const source = routines.find((routine) => routine.id === routineId);

    if (!source || (!source.isActive && routineId !== selectedForActiveDay)) {
      return;
    }

    setValue(
      "days",
      watchedDays.map((day) =>
        day.dayNumber === activeDay
          ? {
              ...day,
              routineId:
                day.routineId === routineId ? "" : routineId,
            }
          : day,
      ),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function clearDay(dayNumber: number) {
    setValue(
      "days",
      watchedDays.map((day) =>
        day.dayNumber === dayNumber ? { ...day, routineId: "" } : day,
      ),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  async function save(values: WorkoutTemplateFormValues) {
    setServerMessage("");
    const result = await saveWorkoutTemplate(template?.id ?? null, values);

    if (result.status === "error") {
      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push(`/app/entrenamiento/plantillas/${result.id}`);
    router.refresh();
  }

  async function onSubmit(values: WorkoutTemplateFormValues) {
    if (template) {
      setPendingUpdate(values);
      return;
    }

    await save(values);
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              {template ? "Editar plantilla" : "Nueva plantilla"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              Datos generales
            </h2>
          </div>
          <Button asChild type="button" variant="outline">
            <Link href="/app/entrenamiento/plantillas">
              <ArrowLeft aria-hidden="true" />
              Volver
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(10rem,0.35fr)]">
          <div>
            <Label
              htmlFor="template-name"
              className="font-extrabold text-charcoal"
            >
              Nombre
            </Label>
            <Input
              id="template-name"
              className={inputClasses}
              placeholder="Ej. Semana de fuerza inicial"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label
              htmlFor="template-cycle-days"
              className="font-extrabold text-charcoal"
            >
              Días del ciclo
            </Label>
            <Input
              id="template-cycle-days"
              type="number"
              min="1"
              max="31"
              inputMode="numeric"
              className={inputClasses}
              aria-invalid={Boolean(errors.cycleDays)}
              {...register("cycleDays")}
            />
            <FieldError message={errors.cycleDays?.message} />
          </div>
        </div>

        <div className="mt-5">
          <Label
            htmlFor="template-description"
            className="font-extrabold text-charcoal"
          >
            Descripción
          </Label>
          <textarea
            id="template-description"
            rows={4}
            className={cn(
              inputClasses,
              "w-full resize-y py-3 text-sm outline-none",
            )}
            placeholder="Objetivo general o indicaciones del ciclo."
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </div>

        <label className="mt-5 flex min-h-11 w-fit items-center gap-3 rounded-control border border-border bg-background px-4 text-sm font-extrabold text-charcoal">
          <input
            type="checkbox"
            className="size-4 accent-[var(--primary)]"
            {...register("isActive")}
          />
          Plantilla activa
        </label>
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-charcoal">
            <CalendarDays className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-charcoal">
              Días de la plantilla
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Selecciona un día y asígnale un entrenamiento. Un mismo
              entrenamiento puede repetirse en varios días.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {watchedDays.map((day) => {
            const routine = routines.find(
              (item) => item.id === day.routineId,
            );
            const isSelected = activeDay === day.dayNumber;

            return (
              <article
                key={day.dayNumber}
                className={cn(
                  "rounded-[20px] border p-4 transition",
                  isSelected
                    ? "border-primary bg-primary-soft/45 shadow-soft"
                    : "border-border bg-background",
                )}
              >
                <input
                  type="hidden"
                  {...register(`days.${day.dayNumber - 1}.dayNumber`, {
                    valueAsNumber: true,
                  })}
                />
                <input
                  type="hidden"
                  {...register(`days.${day.dayNumber - 1}.routineId`)}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                      Día {day.dayNumber}
                    </p>
                    <h3 className="mt-2 break-words font-extrabold text-charcoal">
                      {routine?.name ?? "Sin entrenamiento"}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-muted">
                      {routine
                        ? `${routine.category} · ${routine.exerciseCount} ejercicios`
                        : "Selecciona una sesión diaria"}
                    </p>
                  </div>
                  {routine ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => clearDay(day.dayNumber)}
                      aria-label={`Quitar entrenamiento del día ${day.dayNumber}`}
                    >
                      <X aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  className="mt-4 min-h-11 w-full"
                  onClick={() => setActiveDay(day.dayNumber)}
                >
                  {routine ? "Cambiar entrenamiento" : "Seleccionar entrenamiento"}
                </Button>
              </article>
            );
          })}
        </div>

        <FieldError
          message={
            typeof errors.days?.message === "string"
              ? errors.days.message
              : errors.days?.root?.message
          }
        />

        <div className="mt-6">
          <AssignmentEntitySelector
            id="template-training-search"
            label={`Entrenamiento para el día ${activeDay}`}
            query={query}
            onQueryChange={updateQuery}
            resultCount={filteredRoutines.length}
            totalCount={availableRoutines.length}
            visibleCount={results.visibleItems.length}
            searchPlaceholder="Buscar por nombre, categoría o dificultad..."
            emptyMessage="No encontramos entrenamientos que coincidan con la búsqueda."
            isLoading={results.isLoading}
            loadMoreLabel="Cargar más entrenamientos"
            onLoadMore={results.loadMore}
          >
            {results.visibleItems.map((routine) => (
              <RoutineSearchCard
                key={routine.id}
                routine={routine}
                selected={routine.id === selectedForActiveDay}
                disabled={!routine.isActive && routine.id !== selectedForActiveDay}
                onSelect={selectRoutine}
              />
            ))}
          </AssignmentEntitySelector>
        </div>
      </section>

      {serverMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{serverMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild type="button" variant="outline" size="lg">
          <Link href="/app/entrenamiento/plantillas">Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : template ? (
            <CheckCircle2 aria-hidden="true" />
          ) : (
            <Save aria-hidden="true" />
          )}
          {isSubmitting
            ? "Guardando..."
            : template
              ? "Guardar cambios"
              : "Crear plantilla"}
        </Button>
      </div>

      <ConfirmationDialog
        open={Boolean(pendingUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUpdate(null);
          }
        }}
        title="Guardar cambios de la plantilla"
        description={`Se actualizará "${pendingUpdate?.name ?? template?.name ?? "esta plantilla"}" y la organización de todos sus días.`}
        confirmLabel="Guardar cambios"
        pendingLabel="Guardando..."
        onConfirm={async () => {
          if (pendingUpdate) {
            await save(pendingUpdate);
          }
        }}
      />
    </form>
  );
}

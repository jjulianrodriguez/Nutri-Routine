"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Dumbbell,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveRoutine } from "@/lib/actions/routines";
import {
  routineFormSchema,
  type RoutineExerciseFormValues,
  type RoutineFormValues,
} from "@/lib/validations/routines";
import { cn } from "@/lib/utils";
import type { ExerciseOption } from "@/types/exercise";
import type { RoutineDetail } from "@/types/routine";

const difficultyLabels = {
  advanced: "Avanzado",
  beginner: "Principiante",
  intermediate: "Intermedio",
} as const;

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";

function toFormExercise(
  exercise: ExerciseOption,
  details?: {
    durationMinutes: number | null;
    notes: string | null;
    repetitions: string | null;
    restSeconds: number | null;
    series: number | null;
  },
): RoutineExerciseFormValues {
  const useMinutes =
    details?.restSeconds !== null &&
    details?.restSeconds !== undefined &&
    details.restSeconds >= 60 &&
    details.restSeconds % 60 === 0;

  return {
    category: exercise.category,
    description: exercise.description ?? "",
    difficulty: exercise.difficulty ?? "",
    durationMinutes: details?.durationMinutes?.toString() ?? "",
    exerciseId: exercise.id,
    exerciseType: exercise.exerciseType,
    muscleGroup: exercise.muscleGroup,
    name: exercise.name,
    notes: details?.notes ?? "",
    repetitions: details?.repetitions ?? "",
    restUnit: useMinutes ? "minutes" : "seconds",
    restValue:
      details?.restSeconds === null || details?.restSeconds === undefined
        ? ""
        : String(
            useMinutes
              ? details.restSeconds / 60
              : details.restSeconds,
          ),
    series: details?.series?.toString() ?? "",
  };
}

function getDefaultValues(routine?: RoutineDetail): RoutineFormValues {
  return {
    category: routine?.category ?? "",
    description: routine?.description ?? "",
    difficulty: routine?.difficulty ?? "beginner",
    exercises:
      routine?.exercises.map((item) =>
        toFormExercise(item.exercise, {
          durationMinutes: item.durationMinutes,
          notes: item.notes,
          repetitions: item.repetitions,
          restSeconds: item.restSeconds,
          series: item.series,
        }),
      ) ?? [],
    isActive: routine?.isActive ?? true,
    name: routine?.name ?? "",
    targetAudience: routine?.targetAudience ?? "General",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  );
}

export function RoutineEditor({
  exerciseOptions,
  routine,
}: {
  exerciseOptions: ExerciseOption[];
  routine?: RoutineDetail;
}) {
  const router = useRouter();
  const [pendingUpdate, setPendingUpdate] =
    useState<RoutineFormValues | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RoutineFormValues>({
    defaultValues: getDefaultValues(routine),
    resolver: zodResolver(routineFormSchema),
  });
  const { append, fields, move, remove } = useFieldArray({
    control,
    name: "exercises",
  });
  const selectedItems = useWatch({ control, name: "exercises" }) ?? [];
  const selectedIds = new Set(
    selectedItems.map((item) => item.exerciseId),
  );
  const availableExercises = exerciseOptions.filter(
    (exercise) => exercise.isActive && !selectedIds.has(exercise.id),
  );
  const inactiveSelected = routine?.exercises.some(
    (item) => !item.exercise.isActive && selectedIds.has(item.exercise.id),
  );

  function addExercise() {
    const exercise = exerciseOptions.find(
      (item) => item.id === selectedExerciseId,
    );

    if (!exercise || selectedIds.has(exercise.id)) {
      return;
    }

    append(toFormExercise(exercise));
    setSelectedExerciseId("");
  }

  async function saveRoutineValues(values: RoutineFormValues) {
    setServerMessage("");

    const result = await saveRoutine(routine?.id ?? null, values);

    if (result.status === "error") {
      setServerMessage(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/app/entrenamiento/rutinas");
    router.refresh();
  }

  async function onSubmit(values: RoutineFormValues) {
    if (inactiveSelected) {
      const message =
        "Retira los ejercicios inactivos antes de guardar la rutina.";
      setServerMessage(message);
      toast.error(message);
      return;
    }

    if (routine) {
      setPendingUpdate(values);
      return;
    }

    await saveRoutineValues(values);
  }

  async function confirmUpdate() {
    if (pendingUpdate) {
      await saveRoutineValues(pendingUpdate);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              {routine ? "Editar rutina" : "Nueva rutina"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              Datos generales
            </h2>
          </div>
          <Button asChild type="button" variant="outline">
            <Link href="/app/entrenamiento/rutinas">
              <ArrowLeft aria-hidden="true" />
              Volver
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <Label htmlFor="routine-name" className="font-extrabold text-charcoal">
              Nombre
            </Label>
            <Input
              id="routine-name"
              className={inputClasses}
              placeholder="Ej. Fuerza de tren inferior"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label
              htmlFor="routine-category"
              className="font-extrabold text-charcoal"
            >
              Categoria
            </Label>
            <Input
              id="routine-category"
              className={inputClasses}
              placeholder="Ej. Fuerza"
              aria-invalid={Boolean(errors.category)}
              {...register("category")}
            />
            <FieldError message={errors.category?.message} />
          </div>

          <div>
            <Label
              htmlFor="routine-difficulty"
              className="font-extrabold text-charcoal"
            >
              Dificultad
            </Label>
            <select
              id="routine-difficulty"
              className={cn(inputClasses, "h-11 w-full appearance-none")}
              {...register("difficulty")}
            >
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label
              htmlFor="routine-audience"
              className="font-extrabold text-charcoal"
            >
              Publico objetivo
            </Label>
            <Input
              id="routine-audience"
              className={inputClasses}
              placeholder="Ej. Principiantes"
              aria-invalid={Boolean(errors.targetAudience)}
              {...register("targetAudience")}
            />
            <FieldError message={errors.targetAudience?.message} />
          </div>
        </div>

        <div className="mt-5">
          <Label
            htmlFor="routine-description"
            className="font-extrabold text-charcoal"
          >
            Descripcion
          </Label>
          <textarea
            id="routine-description"
            rows={4}
            className={cn(
              inputClasses,
              "w-full resize-y py-3 text-sm outline-none",
            )}
            placeholder="Objetivo, recomendaciones y contexto de la rutina."
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
          Rutina activa
        </label>
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
            Constructor
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-charcoal">
            Ejercicios de la rutina
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Agrega ejercicios de la biblioteca y define series, repeticiones,
            descanso y notas. El orden de esta lista sera el orden de la rutina.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <select
            value={selectedExerciseId}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            className="h-11 w-full rounded-control border border-border bg-background px-4 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
            aria-label="Seleccionar ejercicio"
          >
            <option value="">Selecciona un ejercicio</option>
            {availableExercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} - {exercise.muscleGroup}
              </option>
            ))}
          </select>
          <Button
            type="button"
            onClick={addExercise}
            disabled={!selectedExerciseId}
          >
            <Plus aria-hidden="true" />
            Agregar
          </Button>
        </div>

        {errors.exercises?.root?.message ? (
          <FieldError message={errors.exercises.root.message} />
        ) : null}

        <div className="mt-5 space-y-4">
          {fields.length > 0 ? (
            fields.map((field, index) => {
              const sourceExercise = exerciseOptions.find(
                (exercise) => exercise.id === field.exerciseId,
              );
              const isInactive = sourceExercise && !sourceExercise.isActive;

              return (
                <article
                  key={field.id}
                  className={cn(
                    "rounded-[22px] border bg-background p-4",
                    isInactive
                      ? "border-danger/25"
                      : "border-border",
                  )}
                >
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.exerciseId`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.name`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.description`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.category`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.difficulty`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.muscleGroup`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.exerciseType`)}
                  />
                  <input
                    type="hidden"
                    {...register(`exercises.${index}.durationMinutes`)}
                  />

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-charcoal">
                        <Dumbbell className="size-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
                          Ejercicio {index + 1}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-charcoal">
                          {field.name}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-warm-brown">
                          {field.muscleGroup} - {field.exerciseType}
                        </p>
                        {isInactive ? (
                          <p className="mt-2 text-sm font-semibold text-danger">
                            Este ejercicio esta inactivo. Retiralo o reactivalo.
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => move(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Subir ${field.name}`}
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => move(index, index + 1)}
                        disabled={index === fields.length - 1}
                        aria-label={`Bajar ${field.name}`}
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => remove(index)}
                        aria-label={`Retirar ${field.name}`}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label
                        htmlFor={`routine-series-${index}`}
                        className="font-extrabold text-charcoal"
                      >
                        Series
                      </Label>
                      <Input
                        id={`routine-series-${index}`}
                        inputMode="numeric"
                        className={inputClasses}
                        placeholder="Opcional"
                        {...register(`exercises.${index}.series`)}
                      />
                      <FieldError
                        message={errors.exercises?.[index]?.series?.message}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`routine-repetitions-${index}`}
                        className="font-extrabold text-charcoal"
                      >
                        Repeticiones
                      </Label>
                      <Input
                        id={`routine-repetitions-${index}`}
                        className={inputClasses}
                        placeholder="Ej. 8-12"
                        {...register(`exercises.${index}.repetitions`)}
                      />
                      <FieldError
                        message={errors.exercises?.[index]?.repetitions?.message}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`routine-rest-value-${index}`}
                        className="font-extrabold text-charcoal"
                      >
                        Descanso
                      </Label>
                      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <Input
                          id={`routine-rest-value-${index}`}
                          type="number"
                          min="0"
                          inputMode="numeric"
                          className="rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20"
                          placeholder="Cantidad"
                          {...register(`exercises.${index}.restValue`)}
                        />
                        <select
                          aria-label={`Unidad de descanso para ${field.name}`}
                          className="h-10 rounded-control border border-border bg-surface px-3 text-sm font-semibold text-charcoal shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
                          {...register(`exercises.${index}.restUnit`)}
                        >
                          <option value="seconds">Segundos</option>
                          <option value="minutes">Minutos</option>
                        </select>
                      </div>
                      <p className="mt-2 text-xs text-muted">
                        Se guarda internamente en segundos.
                      </p>
                      <FieldError
                        message={errors.exercises?.[index]?.restValue?.message}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label
                      htmlFor={`routine-notes-${index}`}
                      className="font-extrabold text-charcoal"
                    >
                      Notas especificas
                    </Label>
                    <textarea
                      id={`routine-notes-${index}`}
                      rows={2}
                      className={cn(
                        inputClasses,
                        "w-full resize-y py-3 text-sm outline-none",
                      )}
                      placeholder="Opcional"
                      {...register(`exercises.${index}.notes`)}
                    />
                    <FieldError
                      message={errors.exercises?.[index]?.notes?.message}
                    />
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-background p-8 text-center">
              <Dumbbell className="mx-auto size-6 text-warm-brown" />
              <p className="mt-3 font-extrabold text-charcoal">
                La rutina aun no tiene ejercicios.
              </p>
              <p className="mt-2 text-sm text-muted">
                Selecciona al menos uno de la biblioteca.
              </p>
            </div>
          )}
        </div>
      </section>

      {serverMessage ? (
        <Alert
          variant="destructive"
          className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
        >
          <AlertDescription className="font-semibold text-danger">
            {serverMessage}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild type="button" variant="outline" size="lg">
          <Link href="/app/entrenamiento/rutinas">Cancelar</Link>
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Guardando...
            </>
          ) : (
            <>
              <Save aria-hidden="true" />
              {routine ? "Guardar cambios" : "Crear rutina"}
            </>
          )}
        </Button>
      </div>

      <ConfirmationDialog
        open={Boolean(pendingUpdate)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingUpdate(null);
          }
        }}
        title="Guardar cambios de la rutina"
        description={`Se actualizará "${pendingUpdate?.name ?? routine?.name ?? "esta rutina"}" y la configuración de sus ejercicios.`}
        confirmLabel="Guardar cambios"
        pendingLabel="Guardando…"
        onConfirm={confirmUpdate}
      />
    </form>
  );
}

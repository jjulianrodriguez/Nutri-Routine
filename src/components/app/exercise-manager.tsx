"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteExercise,
  saveExercise,
  setExerciseActive,
} from "@/lib/actions/exercises";
import {
  exerciseFormSchema,
  type ExerciseFormValues,
} from "@/lib/validations/exercises";
import { cn } from "@/lib/utils";
import type { ExerciseListItem } from "@/types/exercise";

const difficultyLabels = {
  advanced: "Avanzado",
  beginner: "Principiante",
  intermediate: "Intermedio",
} as const;

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-charcoal shadow-soft placeholder:text-muted focus-visible:ring-primary/20";

const defaultValues: ExerciseFormValues = {
  category: "",
  description: "",
  difficulty: "beginner",
  exerciseType: "",
  id: "",
  multimediaUrl: "",
  muscleGroup: "",
  name: "",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm font-semibold text-danger" role="alert">
      {message}
    </p>
  );
}

export function ExerciseManager({
  exercises,
}: {
  exercises: ExerciseListItem[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    exerciseId: string;
    type: "delete" | "status";
  } | null>(null);
  const [isStatusPending, startStatusTransition] = useTransition();
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ExerciseFormValues>({
    defaultValues,
    resolver: zodResolver(exerciseFormSchema),
  });
  const editingId = useWatch({ control, name: "id" });
  const filteredExercises = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return exercises;
    }

    return exercises.filter((exercise) =>
      [
        exercise.name,
        exercise.category,
        exercise.muscleGroup,
        exercise.exerciseType,
      ].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [exercises, query]);

  function resetForm() {
    reset(defaultValues);
    clearErrors();
    setStatusMessage("");
  }

  function editExercise(exercise: ExerciseListItem) {
    reset({
      category: exercise.category,
      description: exercise.description ?? "",
      difficulty: exercise.difficulty ?? "beginner",
      exerciseType: exercise.exerciseType,
      id: exercise.id,
      multimediaUrl: exercise.multimediaUrl ?? "",
      muscleGroup: exercise.muscleGroup,
      name: exercise.name,
    });
    setStatusMessage("");
    document
      .getElementById("exercise-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function onSubmit(values: ExerciseFormValues) {
    setStatusMessage("");
    clearErrors();

    const result = await saveExercise(values);

    if (result.status === "error") {
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          if (message) {
            setError(field as keyof ExerciseFormValues, { message });
          }
        });
      }

      setStatusMessage(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    resetForm();
    router.refresh();
  }

  function toggleExercise(exercise: ExerciseListItem) {
    setPendingAction({ exerciseId: exercise.id, type: "status" });
    startStatusTransition(async () => {
      const result = await setExerciseActive(
        exercise.id,
        !exercise.isActive,
      );

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.refresh();
      }

      setPendingAction(null);
    });
  }

  function removeExercise(exercise: ExerciseListItem) {
    const confirmed = window.confirm(
      `Eliminaras "${exercise.name}" definitivamente. Si esta en una rutina, la eliminacion sera bloqueada. ¿Deseas continuar?`,
    );

    if (!confirmed) {
      return;
    }

    setPendingAction({ exerciseId: exercise.id, type: "delete" });
    startStatusTransition(async () => {
      const result = await deleteExercise(exercise.id);

      if (result.status === "error") {
        toast.error(result.message);
      } else {
        if (editingId === exercise.id) {
          resetForm();
        }

        toast.success(result.message);
        router.refresh();
      }

      setPendingAction(null);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <section
        id="exercise-form"
        className="scroll-mt-6 rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              {editingId ? "Edicion" : "Nuevo ejercicio"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              {editingId ? "Actualizar ejercicio" : "Crear ejercicio"}
            </h2>
          </div>
          {editingId ? (
            <Button type="button" variant="outline" onClick={resetForm}>
              <RotateCcw aria-hidden="true" />
              Cancelar
            </Button>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <input type="hidden" {...register("id")} />

          <div>
            <Label htmlFor="exercise-name" className="font-extrabold text-charcoal">
              Nombre
            </Label>
            <Input
              id="exercise-name"
              className={inputClasses}
              placeholder="Ej. Sentadilla goblet"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "exercise-name-error" : undefined}
              {...register("name")}
            />
            <FieldError id="exercise-name-error" message={errors.name?.message} />
          </div>

          <div>
            <Label
              htmlFor="exercise-description"
              className="font-extrabold text-charcoal"
            >
              Descripcion e instrucciones
            </Label>
            <textarea
              id="exercise-description"
              rows={5}
              className={cn(
                inputClasses,
                "w-full resize-y py-3 text-sm outline-none",
              )}
              placeholder="Explica la tecnica, postura y puntos de control."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "exercise-description-error" : undefined
              }
              {...register("description")}
            />
            <FieldError
              id="exercise-description-error"
              message={errors.description?.message}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="exercise-difficulty"
                className="font-extrabold text-charcoal"
              >
                Dificultad
              </Label>
              <select
                id="exercise-difficulty"
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
                htmlFor="exercise-muscle-group"
                className="font-extrabold text-charcoal"
              >
                Grupo muscular
              </Label>
              <Input
                id="exercise-muscle-group"
                className={inputClasses}
                placeholder="Ej. Piernas"
                aria-invalid={Boolean(errors.muscleGroup)}
                {...register("muscleGroup")}
              />
              <FieldError
                id="exercise-muscle-group-error"
                message={errors.muscleGroup?.message}
              />
            </div>

            <div>
              <Label
                htmlFor="exercise-category"
                className="font-extrabold text-charcoal"
              >
                Categoria
              </Label>
              <Input
                id="exercise-category"
                className={inputClasses}
                placeholder="Ej. Fuerza"
                aria-invalid={Boolean(errors.category)}
                {...register("category")}
              />
              <FieldError
                id="exercise-category-error"
                message={errors.category?.message}
              />
            </div>

            <div>
              <Label
                htmlFor="exercise-type"
                className="font-extrabold text-charcoal"
              >
                Tipo
              </Label>
              <Input
                id="exercise-type"
                className={inputClasses}
                placeholder="Ej. Compuesto"
                aria-invalid={Boolean(errors.exerciseType)}
                {...register("exerciseType")}
              />
              <FieldError
                id="exercise-type-error"
                message={errors.exerciseType?.message}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="exercise-multimedia"
              className="font-extrabold text-charcoal"
            >
              Recurso multimedia externo
            </Label>
            <Input
              id="exercise-multimedia"
              type="url"
              className={inputClasses}
              placeholder="https://..."
              aria-invalid={Boolean(errors.multimediaUrl)}
              aria-describedby={
                errors.multimediaUrl
                  ? "exercise-multimedia-error"
                  : "exercise-multimedia-help"
              }
              {...register("multimediaUrl")}
            />
            <p id="exercise-multimedia-help" className="mt-2 text-xs text-muted">
              Opcional. Solo se aceptan enlaces http o https; no se suben archivos.
            </p>
            <FieldError
              id="exercise-multimedia-error"
              message={errors.multimediaUrl?.message}
            />
          </div>

          {statusMessage ? (
            <Alert
              variant="destructive"
              className="rounded-[18px] border-danger/20 bg-danger/5 px-4 py-3"
            >
              <AlertDescription className="font-semibold text-danger">
                {statusMessage}
              </AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Guardando...
              </>
            ) : (
              <>
                {editingId ? <Pencil aria-hidden="true" /> : <Plus aria-hidden="true" />}
                {editingId ? "Guardar cambios" : "Crear ejercicio"}
              </>
            )}
          </Button>
        </form>
      </section>

      <section className="rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              Biblioteca
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-charcoal">
              {exercises.length} ejercicios
            </h2>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-control bg-background pl-10"
              placeholder="Buscar ejercicio"
              aria-label="Buscar ejercicios"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <article
                key={exercise.id}
                className={cn(
                  "rounded-[22px] border bg-background p-4 transition-colors",
                  exercise.isActive
                    ? "border-border"
                    : "border-dashed border-stone/35 opacity-75",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-charcoal">
                        {exercise.name}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide",
                          exercise.isActive
                            ? "bg-primary-soft text-charcoal"
                            : "bg-stone-soft text-stone-hover",
                        )}
                      >
                        {exercise.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                      {exercise.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => editExercise(exercise)}
                      aria-label={`Editar ${exercise.name}`}
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={exercise.isActive ? "destructive" : "outline"}
                      disabled={
                        isStatusPending &&
                        pendingAction?.exerciseId === exercise.id
                      }
                      onClick={() => toggleExercise(exercise)}
                      aria-label={
                        exercise.isActive
                          ? `Desactivar ${exercise.name}`
                          : `Activar ${exercise.name}`
                      }
                    >
                      {isStatusPending &&
                      pendingAction?.exerciseId === exercise.id &&
                      pendingAction.type === "status" ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : exercise.isActive ? (
                        <PowerOff aria-hidden="true" />
                      ) : (
                        <Power aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      disabled={
                        isStatusPending &&
                        pendingAction?.exerciseId === exercise.id
                      }
                      onClick={() => removeExercise(exercise)}
                      aria-label={`Eliminar definitivamente ${exercise.name}`}
                      title="Eliminar definitivamente"
                    >
                      {isStatusPending &&
                      pendingAction?.exerciseId === exercise.id &&
                      pendingAction.type === "delete" ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Trash2 aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-warm-brown">
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    {difficultyLabels[exercise.difficulty ?? "beginner"]}
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    {exercise.muscleGroup}
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    {exercise.category}
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1.5">
                    {exercise.exerciseType}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <span>Creado por {exercise.creatorName}</span>
                    <span>Creado: {formatDate(exercise.createdAt)}</span>
                    <span>Actualizado: {formatDate(exercise.updatedAt)}</span>
                  </div>
                  {exercise.multimediaUrl ? (
                    <a
                      href={exercise.multimediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 font-extrabold text-warm-brown hover:text-charcoal"
                    >
                      Ver recurso
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-background p-8 text-center">
              <p className="font-extrabold text-charcoal">
                No hay ejercicios que coincidan.
              </p>
              <p className="mt-2 text-sm text-muted">
                Ajusta la busqueda o crea el primer ejercicio.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

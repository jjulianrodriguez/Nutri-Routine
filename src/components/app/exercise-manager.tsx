"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarClock,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CardActionsMenu } from "@/components/app/card-actions-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteExercise,
  saveExercise,
  setExerciseActive,
} from "@/lib/actions/exercises";
import {
  exerciseCategoryOptions,
  exerciseMuscleGroupOptions,
  exerciseTypeOptions,
  getExerciseSelectOptions,
  resolveExerciseOption,
} from "@/lib/exercises/options";
import {
  exerciseFormSchema,
  type ExerciseFormValues,
} from "@/lib/validations/exercises";
import { cn } from "@/lib/utils";
import type {
  ExerciseFilterOptions,
  ExerciseListFilters,
  ExerciseListItem,
} from "@/types/exercise";

const difficultyLabels = {
  advanced: "Avanzado",
  beginner: "Principiante",
  intermediate: "Intermedio",
} as const;

const inputClasses =
  "mt-2 rounded-control border-border bg-surface px-4 text-foreground shadow-soft placeholder:text-muted focus-visible:ring-primary/20";
const formSectionClasses =
  "rounded-[22px] border border-border bg-background p-4 sm:p-5";
const legendClasses = "px-1 text-sm font-extrabold text-foreground";
const libraryPath = "/app/entrenamiento/ejercicios";

const defaultValues: ExerciseFormValues = {
  category: "",
  description: "",
  difficulty: "beginner",
  exerciseType: "",
  id: "",
  multimediaUrls: [""],
  muscleGroup: "",
  name: "",
};

type ExerciseConfirmation =
  | {
      exercise: ExerciseListItem;
      type: "delete" | "status";
    }
  | {
      type: "update";
      values: ExerciseFormValues;
    };

type ExerciseFilterDraft = {
  category: string;
  difficulty: string;
  exerciseType: string;
  muscleGroup: string;
  query: string;
  status: string;
};

const statusFilterLabels = {
  active: "Activos",
  all: "Todos",
  inactive: "Inactivos",
} as const;

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

function getDraftFilters(filters: ExerciseListFilters): ExerciseFilterDraft {
  return {
    category: filters.category || "all",
    difficulty: filters.difficulty || "all",
    exerciseType: filters.exerciseType || "all",
    muscleGroup: filters.muscleGroup || "all",
    query: filters.query ?? "",
    status: filters.status || "all",
  };
}

function buildExerciseLibraryUrl(
  filters: ExerciseFilterDraft,
  page: number,
) {
  const params = new URLSearchParams();
  const query = filters.query.trim();

  if (query) {
    params.set("q", query);
  }

  if (filters.muscleGroup !== "all") {
    params.set("muscle", filters.muscleGroup);
  }

  if (filters.difficulty !== "all") {
    params.set("difficulty", filters.difficulty);
  }

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.exerciseType !== "all") {
    params.set("type", filters.exerciseType);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const search = params.toString();

  return search ? `${libraryPath}?${search}` : libraryPath;
}

export function ExerciseManager({
  exercises,
  filterOptions,
  filters,
  pagination,
}: {
  exercises: ExerciseListItem[];
  filterOptions: ExerciseFilterOptions;
  filters: ExerciseListFilters;
  pagination: {
    hasMore: boolean;
    page: number;
    pageSize: number;
    totalCount: number;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draftFilters, setDraftFilters] = useState(() =>
    getDraftFilters(filters),
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [confirmation, setConfirmation] =
    useState<ExerciseConfirmation | null>(null);
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<ExerciseFormValues>({
    defaultValues,
    resolver: zodResolver(exerciseFormSchema),
  });
  const editingId = useWatch({ control, name: "id" });
  const multimediaUrls =
    useWatch({ control, name: "multimediaUrls" }) ?? [""];
  const muscleGroup = useWatch({ control, name: "muscleGroup" });
  const category = useWatch({ control, name: "category" });
  const exerciseType = useWatch({ control, name: "exerciseType" });

  function updateDraftFilter(
    field: keyof ExerciseFilterDraft,
    value: string,
  ) {
    setDraftFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applyLibraryFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() => {
      router.push(buildExerciseLibraryUrl(draftFilters, 1));
    });
  }

  function clearLibraryFilters() {
    const emptyFilters: ExerciseFilterDraft = {
      category: "all",
      difficulty: "all",
      exerciseType: "all",
      muscleGroup: "all",
      query: "",
      status: "all",
    };

    setDraftFilters(emptyFilters);
    startTransition(() => {
      router.push(libraryPath);
    });
  }

  function loadMoreExercises() {
    startTransition(() => {
      router.push(
        buildExerciseLibraryUrl(
          getDraftFilters(filters),
          pagination.page + 1,
        ),
      );
    });
  }

  function resetForm() {
    reset(defaultValues);
    clearErrors();
    setStatusMessage("");
  }

  function editExercise(exercise: ExerciseListItem) {
    reset({
      category: resolveExerciseOption(
        exercise.category,
        exerciseCategoryOptions,
      ),
      description: exercise.description ?? "",
      difficulty: exercise.difficulty ?? "beginner",
      exerciseType: resolveExerciseOption(
        exercise.exerciseType,
        exerciseTypeOptions,
      ),
      id: exercise.id,
      multimediaUrls:
        exercise.multimediaUrls.length > 0
          ? exercise.multimediaUrls
          : [""],
      muscleGroup: resolveExerciseOption(
        exercise.muscleGroup,
        exerciseMuscleGroupOptions,
      ),
      name: exercise.name,
    });
    setStatusMessage("");
    document
      .getElementById("exercise-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addMultimediaUrl() {
    if (multimediaUrls.length >= 3) {
      return;
    }

    setValue("multimediaUrls", [...multimediaUrls, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removeMultimediaUrl(index: number) {
    const nextUrls = multimediaUrls.filter(
      (_, urlIndex) => urlIndex !== index,
    );

    setValue(
      "multimediaUrls",
      nextUrls.length > 0 ? nextUrls : [""],
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  async function saveExerciseValues(values: ExerciseFormValues) {
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

  async function onSubmit(values: ExerciseFormValues) {
    if (values.id) {
      setConfirmation({ type: "update", values });
      return;
    }

    await saveExerciseValues(values);
  }

  async function toggleExercise(exercise: ExerciseListItem) {
    try {
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

    } catch {
      toast.error(
        "Ocurrió un error inesperado al cambiar el estado. Inténtalo de nuevo.",
      );
    }
  }

  function removeExercise(exercise: ExerciseListItem) {
    setConfirmation({ exercise, type: "delete" });
  }

  async function deleteExerciseValue(exercise: ExerciseListItem) {
    try {
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

    } catch {
      toast.error(
        "Ocurrió un error inesperado al eliminar el ejercicio. Inténtalo de nuevo.",
      );
    }
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    if (confirmation.type === "update") {
      await saveExerciseValues(confirmation.values);
      return;
    }

    if (confirmation.type === "status") {
      await toggleExercise(confirmation.exercise);
      return;
    }

    await deleteExerciseValue(confirmation.exercise);
  }

  const confirmationTitle =
    confirmation?.type === "update"
      ? "Guardar cambios del ejercicio"
      : confirmation?.type === "delete"
        ? "Eliminar ejercicio"
        : confirmation?.exercise.isActive
          ? "Desactivar ejercicio"
          : "Activar ejercicio";
  const confirmationDescription =
    confirmation?.type === "update"
      ? `Se actualizará "${confirmation.values.name}" con la información del formulario.`
      : confirmation?.type === "delete"
        ? `Se eliminará "${confirmation.exercise.name}" definitivamente. Si forma parte de un entrenamiento, la eliminación no se realizará.`
        : confirmation?.exercise.isActive
          ? `"${confirmation.exercise.name}" dejará de estar disponible para nuevos entrenamientos.`
          : confirmation
            ? `"${confirmation.exercise.name}" volverá a estar disponible para nuevos entrenamientos.`
            : "";
  const confirmationLabel =
    confirmation?.type === "update"
      ? "Guardar cambios"
      : confirmation?.type === "delete"
        ? "Eliminar ejercicio"
        : confirmation?.exercise.isActive
          ? "Desactivar"
          : "Activar";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-start">
      <section
        id="exercise-form"
        className="scroll-mt-6 rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-6 xl:self-start"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              {editingId ? "Edición" : "Nuevo ejercicio"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
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

          <fieldset className={formSectionClasses}>
            <legend className={legendClasses}>Información principal</legend>

            <div className="grid gap-5">
              <div>
            <Label htmlFor="exercise-name" className="font-extrabold text-foreground">
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
              className="font-extrabold text-foreground"
            >
              Descripción e instrucciones
            </Label>
            <textarea
              id="exercise-description"
              rows={5}
              className={cn(
                inputClasses,
                "min-h-32 w-full resize-none py-3 text-sm outline-none",
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

            </div>
          </fieldset>

          <fieldset className={formSectionClasses}>
            <legend className={legendClasses}>Clasificación</legend>

            <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="exercise-difficulty"
                className="font-extrabold text-foreground"
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
                className="font-extrabold text-foreground"
              >
                Grupo muscular
              </Label>
              <select
                id="exercise-muscle-group"
                className={cn(inputClasses, "h-11 w-full")}
                aria-invalid={Boolean(errors.muscleGroup)}
                aria-describedby={
                  errors.muscleGroup
                    ? "exercise-muscle-group-error"
                    : undefined
                }
                {...register("muscleGroup")}
              >
                <option value="" disabled>
                  Selecciona un grupo muscular
                </option>
                {getExerciseSelectOptions(
                  exerciseMuscleGroupOptions,
                  muscleGroup,
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                    {!exerciseMuscleGroupOptions.includes(
                      option as (typeof exerciseMuscleGroupOptions)[number],
                    )
                      ? " (valor existente)"
                      : ""}
                  </option>
                ))}
              </select>
              <FieldError
                id="exercise-muscle-group-error"
                message={errors.muscleGroup?.message}
              />
            </div>

            <div>
              <Label
                htmlFor="exercise-category"
                className="font-extrabold text-foreground"
              >
                Categoría
              </Label>
              <select
                id="exercise-category"
                className={cn(inputClasses, "h-11 w-full")}
                aria-invalid={Boolean(errors.category)}
                aria-describedby={
                  errors.category ? "exercise-category-error" : undefined
                }
                {...register("category")}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {getExerciseSelectOptions(
                  exerciseCategoryOptions,
                  category,
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                    {!exerciseCategoryOptions.includes(
                      option as (typeof exerciseCategoryOptions)[number],
                    )
                      ? " (valor existente)"
                      : ""}
                  </option>
                ))}
              </select>
              <FieldError
                id="exercise-category-error"
                message={errors.category?.message}
              />
            </div>

            <div>
              <Label
                htmlFor="exercise-type"
                className="font-extrabold text-foreground"
              >
                Tipo
              </Label>
              <select
                id="exercise-type"
                className={cn(inputClasses, "h-11 w-full")}
                aria-invalid={Boolean(errors.exerciseType)}
                aria-describedby={
                  errors.exerciseType ? "exercise-type-error" : undefined
                }
                {...register("exerciseType")}
              >
                <option value="" disabled>
                  Selecciona un tipo
                </option>
                {getExerciseSelectOptions(
                  exerciseTypeOptions,
                  exerciseType,
                ).map((option) => (
                  <option key={option} value={option}>
                    {option}
                    {!exerciseTypeOptions.includes(
                      option as (typeof exerciseTypeOptions)[number],
                    )
                      ? " (valor existente)"
                      : ""}
                  </option>
                ))}
              </select>
              <FieldError
                id="exercise-type-error"
                message={errors.exerciseType?.message}
              />
            </div>
          </div>

          </fieldset>

          <fieldset className={formSectionClasses}>
            <legend className={legendClasses}>
              Recursos multimedia externos
            </legend>
            <p className="text-sm leading-6 text-muted">
              Opcional. Agrega hasta 3 enlaces HTTP o HTTPS. No se suben
              imagenes, videos ni archivos.
            </p>

            <div className="mt-4 space-y-4">
              {multimediaUrls.map((_, index) => {
                const error = errors.multimediaUrls?.[index]?.message;
                const inputId = `exercise-multimedia-${index}`;
                const errorId = `${inputId}-error`;

                return (
                  <div
                    key={inputId}
                    className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                  >
                    <div>
                      <Label
                        htmlFor={inputId}
                        className="font-extrabold text-foreground"
                      >
                        Recurso {index + 1}
                      </Label>
                      <Input
                        id={inputId}
                        type="url"
                        className={inputClasses}
                        placeholder="https://..."
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? errorId : undefined}
                        {...register(`multimediaUrls.${index}`)}
                      />
                      <FieldError id={errorId} message={error} />
                    </div>

                    {multimediaUrls.length > 1 ? (
                      <Button
                        type="button"
                        variant="destructive"
                        className="min-h-11"
                        onClick={() => removeMultimediaUrl(index)}
                        aria-label={`Quitar recurso multimedia ${index + 1}`}
                      >
                        <X aria-hidden="true" />
                        Quitar
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {multimediaUrls.length < 3 ? (
              <Button
                type="button"
                variant="outline"
                className="mt-4 min-h-11"
                onClick={addMultimediaUrl}
              >
                <Plus aria-hidden="true" />
                Agregar recurso multimedia
              </Button>
            ) : (
              <p className="mt-4 text-xs font-bold text-muted">
                Alcanzaste el máximo de 3 recursos multimedia.
              </p>
            )}
          </fieldset>

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
              Biblioteca
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {pagination.totalCount} ejercicios encontrados
            </h2>
            <p className="mt-2 text-sm font-semibold text-muted">
              Mostrando {exercises.length} de {pagination.totalCount}. Los
              filtros se aplican antes de cargar más resultados.
            </p>
          </div>
        </div>

        <form
          className="mt-5 rounded-[22px] border border-foreground/10 bg-background p-4"
          onSubmit={applyLibraryFilters}
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={draftFilters.query}
              onChange={(event) =>
                updateDraftFilter("query", event.target.value)
              }
              className="rounded-control bg-surface pl-10"
              placeholder="Buscar por nombre, grupo, categoría o tipo"
              aria-label="Buscar ejercicios"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <Label
                htmlFor="exercise-filter-muscle"
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted"
              >
                Grupo muscular
              </Label>
              <select
                id="exercise-filter-muscle"
                value={draftFilters.muscleGroup}
                onChange={(event) =>
                  updateDraftFilter("muscleGroup", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="all">Todos</option>
                {filterOptions.muscleGroups.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor="exercise-filter-difficulty"
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted"
              >
                Dificultad
              </Label>
              <select
                id="exercise-filter-difficulty"
                value={draftFilters.difficulty}
                onChange={(event) =>
                  updateDraftFilter("difficulty", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="all">Todas</option>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor="exercise-filter-status"
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted"
              >
                Estado
              </Label>
              <select
                id="exercise-filter-status"
                value={draftFilters.status}
                onChange={(event) =>
                  updateDraftFilter("status", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                {Object.entries(statusFilterLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor="exercise-filter-category"
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted"
              >
                Categoría
              </Label>
              <select
                id="exercise-filter-category"
                value={draftFilters.category}
                onChange={(event) =>
                  updateDraftFilter("category", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="all">Todas</option>
                {filterOptions.categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor="exercise-filter-type"
                className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted"
              >
                Tipo
              </Label>
              <select
                id="exercise-filter-type"
                value={draftFilters.exerciseType}
                onChange={(event) =>
                  updateDraftFilter("exerciseType", event.target.value)
                }
                className="mt-2 h-11 w-full rounded-control border border-border bg-surface px-3 text-sm font-semibold text-foreground shadow-soft outline-none focus-visible:ring-3 focus-visible:ring-primary/20"
              >
                <option value="all">Todos</option>
                {filterOptions.exerciseTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={clearLibraryFilters}
              disabled={isPending}
            >
              Limpiar filtros
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <Search aria-hidden="true" />
              )}
              Aplicar filtros
            </Button>
          </div>
        </form>

        <div className="mt-5 grid gap-4">
          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <article
                key={exercise.id}
                className={cn(
                  "group relative overflow-hidden rounded-[26px] border bg-surface p-5 shadow-soft transition-[background-color,border-color,box-shadow] hover:border-primary/45 hover:bg-surface-hover sm:p-6",
                  exercise.isActive
                    ? "border-border"
                    : "border-border opacity-90",
                )}
              >
                <Link
                  href={`/app/entrenamiento/ejercicios/${exercise.id}`}
                  className="absolute inset-0 z-0 rounded-[26px] outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35"
                  aria-label={`Ver información completa de ${exercise.name}`}
                >
                  <span className="sr-only">
                    Ver información completa de {exercise.name}
                  </span>
                </Link>

                <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-3 py-1 text-xs font-extrabold",
                        exercise.isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-muted text-foreground",
                      )}
                    >
                      {exercise.isActive ? "Activo" : "Inactivo"}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground sm:text-2xl">
                      {exercise.name}
                    </h3>
                    {exercise.description ? (
                      <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted">
                        {exercise.description}
                      </p>
                    ) : null}
                    <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-muted-foreground transition group-hover:text-foreground">
                      Ver información completa
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="pointer-events-auto relative z-20 shrink-0">
                    <CardActionsMenu
                      label={exercise.name}
                      items={[
                        {
                          icon: Pencil,
                          label: "Editar",
                          onSelect: () => editExercise(exercise),
                        },
                        {
                          destructive: exercise.isActive,
                          icon: exercise.isActive ? PowerOff : Power,
                          label: exercise.isActive ? "Desactivar" : "Activar",
                          onSelect: () =>
                            setConfirmation({ exercise, type: "status" }),
                          separatorBefore: true,
                        },
                        {
                          destructive: true,
                          icon: Trash2,
                          label: "Eliminar",
                          onSelect: () => removeExercise(exercise),
                        },
                      ]}
                    />
                  </div>
                </div>

                <div className="pointer-events-none relative z-10 mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-muted-foreground">
                  <span className="rounded-full bg-secondary-soft px-3 py-1 text-foreground">
                    {difficultyLabels[exercise.difficulty ?? "beginner"]}
                  </span>
                  <span
                    className="rounded-full border border-border bg-background px-3 py-1"
                    title="Grupo muscular"
                  >
                    {exercise.muscleGroup}
                  </span>
                  <span
                    className="rounded-full border border-border bg-background px-3 py-1"
                    title="Categoría"
                  >
                    {exercise.category}
                  </span>
                  <span
                    className="rounded-full border border-border bg-background px-3 py-1"
                    title="Tipo de ejercicio"
                  >
                    {exercise.exerciseType}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
                      exercise.multimediaUrls.length > 0
                        ? "border-primary/30 bg-primary-soft text-foreground"
                        : "border-border bg-background text-muted",
                    )}
                  >
                    <Link2 className="size-3.5" aria-hidden="true" />
                    {exercise.multimediaUrls.length}{" "}
                    {exercise.multimediaUrls.length === 1
                      ? "recurso"
                      : "recursos"}
                  </span>
                </div>

                <div className="pointer-events-none relative z-10 -mx-5 mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 pt-4 text-sm text-muted sm:-mx-6 sm:px-6">
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="size-4" aria-hidden="true" />
                    {exercise.creatorName}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="size-4" aria-hidden="true" />
                    Creado {formatDate(exercise.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="size-4" aria-hidden="true" />
                    Actualizado {formatDate(exercise.updatedAt)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-border bg-background p-8 text-center">
              <p className="font-extrabold text-foreground">
                No hay ejercicios que coincidan.
              </p>
              <p className="mt-2 text-sm text-muted">
                Ajusta la busqueda o crea el primer ejercicio.
              </p>
            </div>
          )}

          {pagination.hasMore ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full"
              onClick={loadMoreExercises}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : null}
              {isPending ? "Cargando..." : `Cargar ${pagination.pageSize} más`}
            </Button>
          ) : exercises.length > 0 ? (
            <p className="rounded-[18px] bg-background px-4 py-3 text-center text-sm font-semibold text-muted">
              Ya estas viendo todos los ejercicios que coinciden.
            </p>
          ) : null}
        </div>
      </section>

      <ConfirmationDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmation(null);
          }
        }}
        title={confirmationTitle}
        description={confirmationDescription}
        confirmLabel={confirmationLabel}
        pendingLabel={
          confirmation?.type === "delete"
            ? "Eliminando…"
            : confirmation?.type === "status"
              ? "Actualizando…"
              : "Guardando…"
        }
        tone={
          confirmation?.type === "delete" ||
          (confirmation?.type === "status" &&
            confirmation.exercise.isActive)
            ? "destructive"
            : "default"
        }
        onConfirm={confirmAction}
      />
    </div>
  );
}

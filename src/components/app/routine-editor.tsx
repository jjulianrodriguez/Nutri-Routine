"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
 ArrowDown,
 ArrowLeft,
 ArrowUp,
 CheckCircle2,
 Dumbbell,
 Loader2,
 Save,
 Trash2,
 TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
 AssignmentEntitySelector,
 ExerciseSearchCard,
} from "@/components/app/assignment-entity-selector";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgressiveResults } from "@/hooks/use-progressive-results";
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

const routineCategoryOptions = [
 "Fuerza",
 "Hipertrofia",
 "Resistencia",
 "Cardio",
 "Movilidad",
 "Tecnica",
 "Recuperacion",
 "Ganar masa muscular",
 "Perdida de grasa",
 "General",
] as const;

const routineTargetAudienceOptions = [
 "General",
 "Principiantes",
 "Intermedio",
 "Avanzado",
 "Adultos",
 "Adultos mayores",
 "Deportistas",
 "Postura y movilidad",
 "Reacondicionamiento",
 "Otro",
] as const;

const selectClasses =
  "mt-2 h-11 w-full min-w-0 rounded-control bg-surface px-4 py-2 text-base text-foreground transition-[background-color,border-color,box-shadow,color,transform] outline-none placeholder:text-muted-foreground ring-2 ring-primary/30 focus:bg-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-danger/40 aria-invalid:bg-danger/10 md:text-sm dark:ring-primary/40 dark:focus:bg-primary-soft appearance-none";
const textareaClasses =
  "mt-2 min-h-28 w-full resize-none rounded-control bg-surface px-4 py-3 text-sm leading-6 text-foreground transition-[background-color,border-color,box-shadow,color,transform] outline-none placeholder:text-muted-foreground ring-2 ring-primary/30 focus:bg-primary-soft disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-danger/40 aria-invalid:bg-danger/10 dark:ring-primary/40 dark:focus:bg-primary-soft";
const formSectionClasses =
 "rounded-[22px] bg-background p-4 sm:p-5";
const legendClasses = "px-1 text-sm font-extrabold text-foreground";

function normalizeSearch(value: string) {
 return value
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .toLocaleLowerCase("es");
}

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

function getRoutineSelectOptions(
 options: readonly string[],
 currentValue: string | undefined,
) {
 const normalizedCurrent = currentValue?.trim();

 if (
 normalizedCurrent &&
 !options.some((option) => option === normalizedCurrent)
 ) {
 return [...options, normalizedCurrent];
 }

 return [...options];
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

function getExerciseSetupState(
 exercise: RoutineExerciseFormValues | undefined,
) {
 const missing = [];

 if (!exercise?.series.trim()) {
 missing.push("series");
 }

 if (!exercise?.repetitions.trim()) {
 missing.push("repeticiones");
 }

 if (!exercise?.restValue.trim()) {
 missing.push("descanso");
 }

 return {
 isConfigured: missing.length === 0,
 missing,
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

function RoutineBuilderStat({
 detail,
 label,
 tone = "neutral",
 value,
}: {
 detail: string;
 label: string;
 tone?: "neutral" | "ready" | "warning";
 value: string;
}) {
 return (
 <div
 className={cn(
 "rounded-[18px] p-4",
 tone === "neutral" && " bg-background",
 tone === "ready" && "border-primary/40 bg-primary-soft/45",
 tone === "warning" && "border-danger/25 bg-danger/5",
 )}
 >
 <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
 {label}
 </p>
 <p className="mt-2 text-3xl font-black text-foreground">{value}</p>
 <p className="mt-1 text-sm font-semibold text-muted-foreground">{detail}</p>
 </div>
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
 const [exerciseQuery, setExerciseQuery] = useState("");
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
 const selectedCategory = useWatch({ control, name: "category" });
 const selectedTargetAudience = useWatch({
 control,
 name: "targetAudience",
 });
 const watchedItems = useWatch({ control, name: "exercises" });
 const selectedItems = useMemo(() => watchedItems ?? [], [watchedItems]);
 const selectedIds = useMemo(
 () => new Set(selectedItems.map((item) => item.exerciseId)),
 [selectedItems],
 );
 const catalogExercises = useMemo(() => {
 const exercisesById = new Map(
 exerciseOptions.map((exercise) => [exercise.id, exercise]),
 );

 routine?.exercises.forEach((item) => {
 if (!exercisesById.has(item.exercise.id)) {
 exercisesById.set(item.exercise.id, item.exercise);
 }
 });

 return [...exercisesById.values()];
 }, [exerciseOptions, routine]);
 const listedExercises = useMemo(
 () =>
 catalogExercises.filter(
 (exercise) => exercise.isActive || selectedIds.has(exercise.id),
 ),
 [catalogExercises, selectedIds],
 );
 const filteredExercises = useMemo(() => {
 const query = normalizeSearch(exerciseQuery.trim());

 return listedExercises.filter((exercise) => {
 if (!query) {
 return true;
 }

 return normalizeSearch(
 [
 exercise.name,
 exercise.muscleGroup,
 exercise.difficulty,
 exercise.category,
 exercise.exerciseType,
 exercise.isActive ? "activo" : "desactivado",
 ]
 .filter(Boolean)
 .join(" "),
 ).includes(query);
 });
 }, [exerciseQuery, listedExercises]);
 const exerciseResults = useProgressiveResults(filteredExercises, 10);
 const inactiveSelectedCount = selectedItems.filter(
 (item) =>
 catalogExercises.find((exercise) => exercise.id === item.exerciseId)
 ?.isActive === false,
 ).length;
 const configuredExerciseCount = selectedItems.filter(
 (item) => getExerciseSetupState(item).isConfigured,
 ).length;
 const pendingExerciseCount =
 selectedItems.length - configuredExerciseCount;

 function updateExerciseQuery(value: string) {
 setExerciseQuery(value);
 exerciseResults.reset();
 }

 function toggleExercise(exerciseId: string) {
 const exercise = exerciseOptions.find(
 (item) => item.id === exerciseId,
 );
 const selectedIndex = selectedItems.findIndex(
 (item) => item.exerciseId === exerciseId,
 );

 if (selectedIndex >= 0) {
 remove(selectedIndex);
 return;
 }

 if (!exercise?.isActive || selectedIds.has(exercise.id)) {
 return;
 }

 append(toFormExercise(exercise));
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
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
 {routine ? "Editar entrenamiento" : "Nuevo entrenamiento"}
 </p>
 <h2 className="mt-2 text-2xl font-semibold text-foreground">
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

 <fieldset className={cn(formSectionClasses, "mt-6")}>
 <legend className={legendClasses}>Información general</legend>

 <div className="grid gap-5 lg:grid-cols-2">
 <div>
 <Label htmlFor="routine-name" className="font-extrabold text-foreground">
 Nombre
 </Label>
 <Input
 id="routine-name"
 className="mt-2"
 placeholder="Ej. Fuerza de tren inferior"
 aria-invalid={Boolean(errors.name)}
 {...register("name")}
 />
 <FieldError message={errors.name?.message} />
 </div>

 <div>
 <Label
 htmlFor="routine-category"
 className="font-extrabold text-foreground"
 >
 Categoría
 </Label>
 <select
 id="routine-category"
 className={selectClasses}
 aria-invalid={Boolean(errors.category)}
 {...register("category")}
 >
 <option value="" disabled>
 Selecciona una categoría
 </option>
 {getRoutineSelectOptions(
 routineCategoryOptions,
 selectedCategory,
 ).map((option) => (
 <option key={option} value={option}>
 {option}
 {!routineCategoryOptions.includes(
 option as (typeof routineCategoryOptions)[number],
 )
 ? " (valor existente)"
 : ""}
 </option>
 ))}
 </select>
 <FieldError message={errors.category?.message} />
 </div>

 <div>
 <Label
 htmlFor="routine-difficulty"
 className="font-extrabold text-foreground"
 >
 Dificultad
 </Label>
 <select
 id="routine-difficulty"
 className={selectClasses}
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
 className="font-extrabold text-foreground"
 >
 Publico objetivo
 </Label>
 <select
 id="routine-audience"
 className={selectClasses}
 aria-invalid={Boolean(errors.targetAudience)}
 {...register("targetAudience")}
 >
 <option value="" disabled>
 Selecciona el público objetivo
 </option>
 {getRoutineSelectOptions(
 routineTargetAudienceOptions,
 selectedTargetAudience,
 ).map((option) => (
 <option key={option} value={option}>
 {option}
 {!routineTargetAudienceOptions.includes(
 option as (typeof routineTargetAudienceOptions)[number],
 )
 ? " (valor existente)"
 : ""}
 </option>
 ))}
 </select>
 <FieldError message={errors.targetAudience?.message} />
 </div>
 </div>
 </fieldset>

 {inactiveSelectedCount > 0 ? (
 <Alert className="mt-5 rounded-[18px] border-primary/40 bg-primary-soft/45 px-4 py-3 text-foreground">
 <TriangleAlert
 className="size-5 text-muted-foreground"
 aria-hidden="true"
 />
 <AlertDescription className="font-semibold leading-6 text-foreground">
 {inactiveSelectedCount === 1
 ? "Este entrenamiento contiene 1 ejercicio desactivado."
 : `Este entrenamiento contiene ${inactiveSelectedCount} ejercicios desactivados.`}{" "}
 Puedes conservarlos o quitarlos. Si los quitas, no podras volver
 a agregarlos mientras sigan desactivados.
 </AlertDescription>
 </Alert>
 ) : null}

 <fieldset className={cn(formSectionClasses, "mt-5")}>
 <legend className={legendClasses}>Notas del entrenamiento</legend>
 <Label
 htmlFor="routine-description"
 className="font-extrabold text-foreground"
 >
 Descripción
 </Label>
 <textarea
 id="routine-description"
 rows={4}
 className={textareaClasses}
 placeholder="Objetivo, recomendaciones y contexto del entrenamiento."
 aria-invalid={Boolean(errors.description)}
 {...register("description")}
 />
 <FieldError message={errors.description?.message} />
 </fieldset>

 <label className="mt-5 flex min-h-11 w-fit items-center gap-3 rounded-control bg-background px-4 text-sm font-extrabold text-foreground">
 <input
 type="checkbox"
 className="size-4 accent-[var(--primary)]"
 {...register("isActive")}
 />
 Entrenamiento activo
 </label>
 </section>

 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
 Constructor
 </p>
 <h2 className="mt-2 text-2xl font-semibold text-foreground">
 Ejercicios del entrenamiento
 </h2>
 <p className="mt-2 text-sm leading-6 text-muted">
 Agrega ejercicios de la biblioteca y define series, repeticiones,
 descanso y notas. El orden de esta lista sera el orden del entrenamiento.
 </p>
 </div>

 <div className="mt-5">
 <AssignmentEntitySelector
 id="routine-exercise-search"
 label="Selecciona ejercicios de la biblioteca"
 query={exerciseQuery}
 onQueryChange={updateExerciseQuery}
 resultCount={filteredExercises.length}
 totalCount={listedExercises.length}
 visibleCount={exerciseResults.visibleItems.length}
 searchPlaceholder="Buscar por nombre, músculo, categoría o tipo..."
 emptyMessage="No encontramos ejercicios que coincidan con la busqueda."
 error={errors.exercises?.root?.message}
 isLoading={exerciseResults.isLoading}
 loadMoreLabel="Cargar más ejercicios"
 onLoadMore={exerciseResults.loadMore}
 >
 {exerciseResults.visibleItems.map((exercise) => (
 <ExerciseSearchCard
 key={exercise.id}
 exercise={exercise}
 selected={selectedIds.has(exercise.id)}
 onSelect={toggleExercise}
 />
 ))}
 </AssignmentEntitySelector>
 </div>

 {selectedItems.length > 0 ? (
 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 <RoutineBuilderStat
 label="Seleccionados"
 value={String(selectedItems.length)}
 detail="En el orden del entrenamiento"
 />
 <RoutineBuilderStat
 label="Configurados"
 value={String(configuredExerciseCount)}
 detail="Con series, reps. y descanso"
 />
 <RoutineBuilderStat
 label="Pendientes"
 value={String(pendingExerciseCount)}
 detail="Revisa antes de guardar"
 tone={pendingExerciseCount > 0 ? "warning" : "ready"}
 />
 </div>
 ) : null}

 {pendingExerciseCount > 0 ? (
 <Alert className="mt-4 rounded-[18px] border-primary/40 bg-primary-soft/45 px-4 py-3 text-foreground">
 <TriangleAlert
 className="size-5 text-muted-foreground"
 aria-hidden="true"
 />
 <AlertDescription className="font-semibold leading-6 text-foreground">
 Hay {pendingExerciseCount}{" "}
 {pendingExerciseCount === 1
 ? "ejercicio pendiente"
 : "ejercicios pendientes"}{" "}
 de series, repeticiones o descanso. No pierdes lo avanzado, pero
 este resumen te ayuda a cerrar la configuración antes de usarlo.
 </AlertDescription>
 </Alert>
 ) : null}

 <div className="mt-5 space-y-4">
 {fields.length > 0 ? (
 fields.map((field, index) => {
 const sourceExercise = catalogExercises.find(
 (exercise) => exercise.id === field.exerciseId,
 );
 const isInactive = sourceExercise && !sourceExercise.isActive;
 const setupState = getExerciseSetupState(
 selectedItems[index],
 );

 return (
 <article
 key={field.id}
 className={cn(
 "rounded-[22px] bg-background p-4",
 isInactive
 ? "border-danger/25"
 : "",
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
 <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
 <Dumbbell className="size-4" aria-hidden="true" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
 Ejercicio {index + 1}
 </p>
 <span
 className={cn(
 "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold",
 setupState.isConfigured
 ? "bg-primary-soft text-foreground"
 : "bg-danger/10 text-danger",
 )}
 >
 {setupState.isConfigured ? (
 <CheckCircle2
 className="size-3.5"
 aria-hidden="true"
 />
 ) : (
 <TriangleAlert
 className="size-3.5"
 aria-hidden="true"
 />
 )}
 {setupState.isConfigured
 ? "Configurado"
 : `Pendiente: ${setupState.missing.join(", ")}`}
 </span>
 </div>
 <h3 className="mt-1 text-lg font-semibold text-foreground">
 {field.name}
 </h3>
 <p className="mt-1 text-xs font-bold text-muted-foreground">
 {field.muscleGroup} - {field.exerciseType}
 </p>
 {isInactive ? (
 <div className="mt-2">
 <span className="inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-extrabold text-danger">
 Desactivado
 </span>
 <p className="mt-2 text-sm font-semibold leading-6 text-muted">
 Se puede conservar en este entrenamiento, pero no
 está disponible para nuevos entrenamientos.
 </p>
 </div>
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
 className="font-extrabold text-foreground"
 >
 Series
 </Label>
 <Input
 id={`routine-series-${index}`}
 inputMode="numeric"
 className="mt-2"
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
 className="font-extrabold text-foreground"
 >
 Repeticiones
 </Label>
 <Input
 id={`routine-repetitions-${index}`}
 className="mt-2"
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
 className="font-extrabold text-foreground"
 >
 Descanso
 </Label>
 <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
 <Input
 id={`routine-rest-value-${index}`}
 type="number"
 min="0"
 inputMode="numeric"
 className=""
 placeholder="Cantidad"
 {...register(`exercises.${index}.restValue`)}
 />
 <select
 aria-label={`Unidad de descanso para ${field.name}`}
 className={selectClasses}
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
 className="font-extrabold text-foreground"
 >
 Notas especificas
 </Label>
 <textarea
 id={`routine-notes-${index}`}
 rows={2}
 className={textareaClasses}
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
 <div className="rounded-[22px] bg-background p-8 text-center">
 <Dumbbell className="mx-auto size-6 text-muted-foreground" />
 <p className="mt-3 font-extrabold text-foreground">
 El entrenamiento aun no tiene ejercicios.
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
 {routine ? "Guardar cambios" : "Crear entrenamiento"}
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
 title="Guardar cambios del entrenamiento"
 description={`Se actualizará "${pendingUpdate?.name ?? routine?.name ?? "este entrenamiento"}" y la configuración de sus ejercicios.`}
 confirmLabel="Guardar cambios"
 pendingLabel="Guardando…"
 onConfirm={confirmUpdate}
 />
 </form>
 );
}

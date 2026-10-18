"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
 ArrowLeft,
 CalendarDays,
 CheckCircle2,
 Loader2,
 Save,
 TriangleAlert,
 X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
 AssignmentEntitySelector,
 RoutineSearchCard,
} from "@/components/app/domains/clients/assignment-entity-selector";
import { Button } from "@/components/ui/actions/button";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import { Checkbox } from "@/components/ui/forms/checkbox";
import {
 FieldGroup,
 FormAlert,
 FormField,
} from "@/components/ui/forms/form-field";
import { Input, NumberInput } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import { useProgressiveResults } from "@/hooks/use-progressive-results";
import { saveWorkoutTemplate } from "@/lib/actions/workout-templates";
import {
 workoutTemplateFormSchema,
 type WorkoutTemplateFormValues,
} from "@/lib/validations/workout-templates";
import { WORKOUT_WEEKDAYS } from "@/lib/workout-templates/weekdays";
import { cn } from "@/lib/utils";
import type { RoutineListItem } from "@/types/routine";
import type { WorkoutTemplateDetail } from "@/types/workout-template";

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
 weekday: day.weekday ?? "",
 })),
 description: template.description ?? "",
 identifier: template.identifier ?? "",
 isActive: template.isActive,
 name: template.name,
 };
 }

 return {
 cycleDays: "7",
 days: Array.from({ length: 7 }, (_, index) => ({
 dayNumber: index + 1,
 routineId: index === 0 ? defaultRoutineId ?? "" : "",
 weekday: "",
 })),
 description: "",
 identifier: "",
 isActive: true,
 name: "",
 };
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
 const watchedDaysValue = useWatch({ control, name: "days" });
 const watchedDays = useMemo(
 () => watchedDaysValue ?? [],
 [watchedDaysValue],
 );
 const cycleDays = Number(cycleDaysValue);
 const effectiveActiveDay =
 Number.isInteger(cycleDays) && cycleDays >= 1
 ? Math.min(activeDay, cycleDays)
 : 1;
 const selectedForActiveDay = watchedDays.find(
 (day) => day.dayNumber === effectiveActiveDay,
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
 const completedDayCount = watchedDays.filter((day) =>
 Boolean(day.routineId),
 ).length;
 const pendingDayCount = Math.max(
 (Number.isInteger(cycleDays) ? cycleDays : watchedDays.length) -
 completedDayCount,
 0,
 );
 const daysError =
 typeof errors.days?.message === "string"
 ? errors.days.message
 : errors.days?.root?.message;

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

 return existing ?? { dayNumber, routineId: "", weekday: "" };
 }),
 { shouldDirty: true, shouldValidate: false },
 );

 // watchedDays is intentionally excluded to avoid rebuilding on selection.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cycleDays, setValue]);

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
 day.dayNumber === effectiveActiveDay
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
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
 {template ? "Editar plantilla" : "Nueva plantilla"}
 </p>
 <h2 className="mt-2 text-2xl font-semibold text-foreground">
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

 <FieldGroup
 className="mt-6 rounded-[22px] bg-background p-4 sm:p-5"
 legend="Información general"
 legendClassName="px-1"
 >
 <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(10rem,0.35fr)]">
 <FormField
 controlId="template-name"
 label="Nombre"
 error={errors.name?.message}
 >
 <Input
 placeholder="Ej. Semana de fuerza inicial"
 {...register("name")}
 />
 </FormField>

 <FormField
 controlId="template-identifier"
 label="Identificador interno"
 hint="Opcional, único y visible solo para profesionales."
 hintClassName="text-xs leading-5"
 error={errors.identifier?.message}
 >
 <Input
 {...register("identifier")}
 />
 </FormField>

 <FormField
 controlId="template-cycle-days"
 label="Días del ciclo"
 error={errors.cycleDays?.message}
 >
 <NumberInput
 min="1"
 max="31"
 inputMode="numeric"
 {...register("cycleDays")}
 />
 </FormField>
 </div>
 </FieldGroup>

 <FieldGroup
 className="mt-5 rounded-[22px] bg-background p-4 sm:p-5"
 legend="Notas de la plantilla"
 legendClassName="px-1"
 >
 <FormField
 controlId="template-description"
 label="Descripción"
 error={errors.description?.message}
 >
 <Textarea
 rows={4}
 placeholder="Objetivo general o indicaciones del ciclo."
 {...register("description")}
 />
 </FormField>
 </FieldGroup>

 <Controller
 control={control}
 name="isActive"
 render={({ field }) => (
 <label className="mt-5 flex min-h-11 w-fit cursor-pointer items-center gap-3 rounded-control bg-background px-4 text-sm font-extrabold text-foreground">
 <Checkbox
 ref={field.ref}
 name={field.name}
 checked={field.value}
 onBlur={field.onBlur}
 onCheckedChange={(checked) => field.onChange(checked === true)}
 />
 Plantilla activa
 </label>
 )}
 />
 </section>

 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-start gap-3">
 <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
 <CalendarDays className="size-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-2xl font-semibold text-foreground">
 Días de la plantilla
 </h2>
 <p className="mt-2 text-sm leading-6 text-muted">
 Selecciona un día y asígnale un entrenamiento. Un mismo
 entrenamiento puede repetirse en varios días.
 </p>
 </div>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-3">
 <TemplateCompletionStat
 label="Dias del ciclo"
 value={String(Number.isInteger(cycleDays) ? cycleDays : 0)}
 detail="Total configurado"
 />
 <TemplateCompletionStat
 label="Completos"
 value={String(completedDayCount)}
 detail="Con entrenamiento asignado"
 tone="ready"
 />
 <TemplateCompletionStat
 label="Pendientes"
 value={String(pendingDayCount)}
 detail="Faltan antes de guardar"
 tone={pendingDayCount > 0 ? "warning" : "ready"}
 />
 </div>

 <FormAlert className="mt-4" message={pendingDayCount > 0 ? (
 <span className="flex items-start gap-3">
 <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
 <span className="leading-6">
 Completa {pendingDayCount}{" "}
 {pendingDayCount === 1 ? "día pendiente" : "días pendientes"}{" "}
 antes de guardar. Cada día del ciclo necesita un entrenamiento
 asignado.
 </span>
 </span>
 ) : null} />

 <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
 {watchedDays.map((day) => {
 const routine = routines.find(
 (item) => item.id === day.routineId,
 );
 const isSelected = effectiveActiveDay === day.dayNumber;
 const configuredByAnotherDay = new Set(
 watchedDays
 .filter((item) => item.dayNumber !== day.dayNumber)
 .map((item) => item.weekday)
 .filter(Boolean),
 );

 return (
 <article
 key={day.dayNumber}
 className={cn(
 "rounded-[20px] p-4 transition",
 isSelected
 ? "border-primary bg-primary-tint/45 "
 : " bg-background",
 )}
 >
 <Input
 type="hidden"
 {...register(`days.${day.dayNumber - 1}.dayNumber`, {
 valueAsNumber: true,
 })}
 />
 <Input
 type="hidden"
 {...register(`days.${day.dayNumber - 1}.routineId`)}
 />
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Dia {day.dayNumber}
 </p>
 <span
 className={cn(
 "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold",
 routine
 ? "bg-primary-soft text-foreground"
 : "bg-danger/10 text-danger",
 )}
 >
 {routine ? (
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
 {routine ? "Listo" : "Pendiente"}
 </span>
 </div>
 <h3 className="mt-2 break-words font-extrabold text-foreground">
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
 <FormField
 controlId={`template-day-${day.dayNumber}-weekday`}
 className="mt-4"
 label="Día específico"
 labelClassName="text-xs font-extrabold uppercase tracking-[0.12em] text-muted"
 error={errors.days?.[day.dayNumber - 1]?.weekday?.message}
 >
 <Select
 {...register(`days.${day.dayNumber - 1}.weekday`)}
 >
 <option value="">Sin día específico</option>
 {WORKOUT_WEEKDAYS.map((option) => (
 <option
 key={option.value}
 value={option.value}
 disabled={configuredByAnotherDay.has(option.value)}
 >
 {option.label}
 </option>
 ))}
 </Select>
 </FormField>
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

 <FormAlert className="mt-4" message={daysError} />

 <div className="mt-6">
 <AssignmentEntitySelector
 id="template-training-search"
 label={`Entrenamiento para el día ${effectiveActiveDay}`}
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

 <FormAlert message={serverMessage} />

 <div className="flex flex-wrap justify-end gap-3">
 <Button asChild type="button" variant="outline" size="lg">
 <Link href="/app/entrenamiento/plantillas">Cancelar</Link>
 </Button>
 <Button
 type="submit"
 size="lg"
 disabled={isSubmitting || pendingDayCount > 0}
 >
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

function TemplateCompletionStat({
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
 tone === "ready" && "border-primary/40 bg-primary-tint/45",
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

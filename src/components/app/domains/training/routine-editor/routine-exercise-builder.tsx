"use client";

import { ArrowDown, ArrowUp, CheckCircle2, Dumbbell, Trash2, TriangleAlert } from "lucide-react";

import { AssignmentEntitySelector, ExerciseSearchCard } from "@/components/app/domains/clients/assignment-entity-selector";
import { Button } from "@/components/ui/actions/button";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { FormControl, FormField } from "@/components/ui/forms/form-field";
import { Input, NumberInput } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import { cn } from "@/lib/utils";

import { getExerciseSetupState } from "./helpers";
import type { RoutineEditorViewModel } from "./hooks/use-routine-editor";

function RoutineBuilderStat({ detail, label, tone = "neutral", value }: { detail: string; label: string; tone?: "neutral" | "ready" | "warning"; value: string }) {
 return (
  <div className={cn("rounded-[18px] p-4", tone === "neutral" && " bg-background", tone === "ready" && "border-primary/40 bg-primary-soft/45", tone === "warning" && "border-danger/25 bg-danger/5")}>
   <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{label}</p><p className="mt-2 text-3xl font-black text-foreground">{value}</p><p className="mt-1 text-sm font-semibold text-muted-foreground">{detail}</p>
  </div>
 );
}

export function RoutineExerciseBuilder({ editor }: { editor: RoutineEditorViewModel }) {
 const { form, fieldArray } = editor;
 const { formState: { errors }, register } = form;
 const { fields, move, remove } = fieldArray;

 return (
  <section className="rounded-[28px] bg-surface p-5 sm:p-6">
   <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Constructor</p><h2 className="mt-2 text-2xl font-semibold text-foreground">Ejercicios del entrenamiento</h2><p className="mt-2 text-sm leading-6 text-muted">Agrega ejercicios de la biblioteca y define series, repeticiones, descanso y notas. El orden de esta lista sera el orden del entrenamiento.</p></div>
   <div className="mt-5">
    <AssignmentEntitySelector id="routine-exercise-search" label="Selecciona ejercicios de la biblioteca" query={editor.exerciseQuery} onQueryChange={editor.updateExerciseQuery} resultCount={editor.filteredExercises.length} totalCount={editor.listedExercises.length} visibleCount={editor.exerciseResults.visibleItems.length} searchPlaceholder="Buscar por nombre, músculo, categoría o tipo..." emptyMessage="No encontramos ejercicios que coincidan con la busqueda." error={errors.exercises?.root?.message} isLoading={editor.exerciseResults.isLoading} loadMoreLabel="Cargar más ejercicios" onLoadMore={editor.exerciseResults.loadMore}>
     {editor.exerciseResults.visibleItems.map((exercise) => <ExerciseSearchCard key={exercise.id} exercise={exercise} selected={editor.selectedIds.has(exercise.id)} onSelect={editor.toggleExercise} />)}
    </AssignmentEntitySelector>
   </div>

   {editor.selectedItems.length > 0 ? <div className="mt-5 grid gap-3 sm:grid-cols-3">
    <RoutineBuilderStat label="Seleccionados" value={String(editor.selectedItems.length)} detail="En el orden del entrenamiento" />
    <RoutineBuilderStat label="Configurados" value={String(editor.configuredExerciseCount)} detail="Con series, reps. y descanso" />
    <RoutineBuilderStat label="Pendientes" value={String(editor.pendingExerciseCount)} detail="Revisa antes de guardar" tone={editor.pendingExerciseCount > 0 ? "warning" : "ready"} />
   </div> : null}

   {editor.pendingExerciseCount > 0 ? <Alert className="mt-4 rounded-[18px] border-primary/40 bg-primary-soft/45 px-4 py-3 text-foreground"><TriangleAlert className="size-5 text-muted-foreground" aria-hidden="true" /><AlertDescription className="font-semibold leading-6 text-foreground">Hay {editor.pendingExerciseCount} {editor.pendingExerciseCount === 1 ? "ejercicio pendiente" : "ejercicios pendientes"} de series, repeticiones o descanso. No pierdes lo avanzado, pero este resumen te ayuda a cerrar la configuración antes de usarlo.</AlertDescription></Alert> : null}

   <div className="mt-5 space-y-4">
    {fields.length > 0 ? fields.map((field, index) => {
     const sourceExercise = editor.catalogExercises.find((exercise) => exercise.id === field.exerciseId);
     const isInactive = sourceExercise && !sourceExercise.isActive;
     const setupState = getExerciseSetupState(editor.selectedItems[index]);
     return (
      <article key={field.id} className={cn("rounded-[22px] bg-background p-4", isInactive ? "border-danger/25" : "")}>
       <Input type="hidden" {...register(`exercises.${index}.exerciseId`)} /><Input type="hidden" {...register(`exercises.${index}.name`)} /><Input type="hidden" {...register(`exercises.${index}.description`)} /><Input type="hidden" {...register(`exercises.${index}.category`)} /><Input type="hidden" {...register(`exercises.${index}.difficulty`)} /><Input type="hidden" {...register(`exercises.${index}.muscleGroup`)} /><Input type="hidden" {...register(`exercises.${index}.exerciseType`)} /><Input type="hidden" {...register(`exercises.${index}.durationMinutes`)} />
       <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
         <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground"><Dumbbell className="size-4" aria-hidden="true" /></div>
         <div>
          <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-extrabold uppercase tracking-wide text-muted">Ejercicio {index + 1}</p><span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold", setupState.isConfigured ? "bg-primary-soft text-foreground" : "bg-danger/10 text-danger")}>{setupState.isConfigured ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : <TriangleAlert className="size-3.5" aria-hidden="true" />}{setupState.isConfigured ? "Configurado" : `Pendiente: ${setupState.missing.join(", ")}`}</span></div>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{field.name}</h3><p className="mt-1 text-xs font-bold text-muted-foreground">{field.muscleGroup} - {field.exerciseType}</p>
          {isInactive ? <div className="mt-2"><span className="inline-flex rounded-full bg-danger/10 px-2.5 py-1 text-xs font-extrabold text-danger">Desactivado</span><p className="mt-2 text-sm font-semibold leading-6 text-muted">Se puede conservar en este entrenamiento, pero no está disponible para nuevos entrenamientos.</p></div> : null}
         </div>
        </div>
        <div className="flex gap-2">
         <Button type="button" size="icon" variant="outline" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Subir ${field.name}`}><ArrowUp aria-hidden="true" /></Button>
         <Button type="button" size="icon" variant="outline" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} aria-label={`Bajar ${field.name}`}><ArrowDown aria-hidden="true" /></Button>
         <Button type="button" size="icon" variant="destructive" onClick={() => remove(index)} aria-label={`Retirar ${field.name}`}><Trash2 aria-hidden="true" /></Button>
        </div>
       </div>
       <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <FormField controlId={`routine-series-${index}`} label="Series" error={errors.exercises?.[index]?.series?.message}><Input inputMode="numeric" placeholder="Opcional" {...register(`exercises.${index}.series`)} /></FormField>
        <FormField controlId={`routine-repetitions-${index}`} label="Repeticiones" error={errors.exercises?.[index]?.repetitions?.message}><Input placeholder="Ej. 8-12" {...register(`exercises.${index}.repetitions`)} /></FormField>
        <FormField autoControl={false} controlId={`routine-rest-value-${index}`} label="Descanso" hint="Se guarda internamente en segundos." error={errors.exercises?.[index]?.restValue?.message}>
         <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"><FormControl><NumberInput min="0" inputMode="numeric" placeholder="Cantidad" {...register(`exercises.${index}.restValue`)} /></FormControl><Select aria-label={`Unidad de descanso para ${field.name}`} {...register(`exercises.${index}.restUnit`)}><option value="seconds">Segundos</option><option value="minutes">Minutos</option></Select></div>
        </FormField>
       </div>
       <FormField controlId={`routine-notes-${index}`} className="mt-4" label="Notas especificas" error={errors.exercises?.[index]?.notes?.message}><Textarea rows={2} placeholder="Opcional" {...register(`exercises.${index}.notes`)} /></FormField>
      </article>
     );
    }) : <div className="rounded-[22px] bg-background p-8 text-center"><Dumbbell className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 font-extrabold text-foreground">El entrenamiento aun no tiene ejercicios.</p><p className="mt-2 text-sm text-muted">Selecciona al menos uno de la biblioteca.</p></div>}
   </div>
  </section>
 );
}

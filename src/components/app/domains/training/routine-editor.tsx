"use client";

import { ArrowLeft, Loader2, Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/actions/button";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Checkbox } from "@/components/ui/forms/checkbox";
import { FieldGroup, FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import type { ExerciseOption } from "@/types/exercise";
import type { RoutineDetail } from "@/types/routine";

import { getRoutineSelectOptions, routineCategoryOptions, routineDifficultyLabels, routineTargetAudienceOptions } from "./routine-editor/helpers";
import { useRoutineEditor } from "./routine-editor/hooks/use-routine-editor";
import { RoutineExerciseBuilder } from "./routine-editor/routine-exercise-builder";

export function RoutineEditor({ exerciseOptions, routine }: { exerciseOptions: ExerciseOption[]; routine?: RoutineDetail }) {
 const editor = useRoutineEditor(exerciseOptions, routine);
 const { control, formState: { errors, isSubmitting }, handleSubmit, register } = editor.form;

 return (
  <form className="space-y-6" onSubmit={handleSubmit(editor.onSubmit)} noValidate>
   <section className="rounded-[28px] bg-surface p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
     <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">{routine ? "Editar entrenamiento" : "Nuevo entrenamiento"}</p><h2 className="mt-2 text-2xl font-semibold text-foreground">Datos generales</h2></div>
     <Button asChild type="button" variant="outline"><Link href="/app/entrenamiento/rutinas"><ArrowLeft aria-hidden="true" />Volver</Link></Button>
    </div>

    <FieldGroup className="mt-6 rounded-[22px] bg-background p-4 sm:p-5" legend="Información general" legendClassName="px-1">
     <div className="grid gap-5 lg:grid-cols-2">
      <FormField controlId="routine-name" label="Nombre" error={errors.name?.message}><Input placeholder="Ej. Fuerza de tren inferior" {...register("name")} /></FormField>
      <FormField controlId="routine-category" label="Categoría" error={errors.category?.message}>
       <Select {...register("category")}><option value="" disabled>Selecciona una categoría</option>{getRoutineSelectOptions(routineCategoryOptions, editor.selectedCategory).map((option) => <option key={option} value={option}>{option}{!routineCategoryOptions.includes(option as (typeof routineCategoryOptions)[number]) ? " (valor existente)" : ""}</option>)}</Select>
      </FormField>
      <FormField controlId="routine-difficulty" label="Dificultad"><Select {...register("difficulty")}>{Object.entries(routineDifficultyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></FormField>
      <FormField controlId="routine-audience" label="Publico objetivo" error={errors.targetAudience?.message}>
       <Select {...register("targetAudience")}><option value="" disabled>Selecciona el público objetivo</option>{getRoutineSelectOptions(routineTargetAudienceOptions, editor.selectedTargetAudience).map((option) => <option key={option} value={option}>{option}{!routineTargetAudienceOptions.includes(option as (typeof routineTargetAudienceOptions)[number]) ? " (valor existente)" : ""}</option>)}</Select>
      </FormField>
     </div>
    </FieldGroup>

    {editor.inactiveSelectedCount > 0 ? <Alert className="mt-5 rounded-[18px] border-primary/40 bg-primary-tint/45 px-4 py-3 text-foreground"><TriangleAlert className="size-5 text-muted-foreground" aria-hidden="true" /><AlertDescription className="font-semibold leading-6 text-foreground">{editor.inactiveSelectedCount === 1 ? "Este entrenamiento contiene 1 ejercicio desactivado." : `Este entrenamiento contiene ${editor.inactiveSelectedCount} ejercicios desactivados.`} Puedes conservarlos o quitarlos. Si los quitas, no podras volver a agregarlos mientras sigan desactivados.</AlertDescription></Alert> : null}

    <FieldGroup className="mt-5 rounded-[22px] bg-background p-4 sm:p-5" legend="Notas del entrenamiento" legendClassName="px-1">
     <FormField controlId="routine-description" label="Descripción" error={errors.description?.message}><Textarea rows={4} placeholder="Objetivo, recomendaciones y contexto del entrenamiento." {...register("description")} /></FormField>
    </FieldGroup>
    <Controller control={control} name="isActive" render={({ field }) => <label className="mt-5 flex min-h-11 w-fit cursor-pointer items-center gap-3 rounded-control bg-background px-4 text-sm font-extrabold text-foreground"><Checkbox ref={field.ref} name={field.name} checked={field.value} onBlur={field.onBlur} onCheckedChange={(checked) => field.onChange(checked === true)} />Entrenamiento activo</label>} />
   </section>

   <RoutineExerciseBuilder editor={editor} />
   <FormAlert message={editor.serverMessage} />
   <div className="flex flex-wrap justify-end gap-3"><Button asChild type="button" variant="outline" size="lg"><Link href="/app/entrenamiento/rutinas">Cancelar</Link></Button><Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="animate-spin" aria-hidden="true" />Guardando...</> : <><Save aria-hidden="true" />{routine ? "Guardar cambios" : "Crear entrenamiento"}</>}</Button></div>
   <ConfirmationDialog open={Boolean(editor.pendingUpdate)} onOpenChange={(open) => { if (!open) editor.setPendingUpdate(null); }} title="Guardar cambios del entrenamiento" description={`Se actualizará "${editor.pendingUpdate?.name ?? routine?.name ?? "este entrenamiento"}" y la configuración de sus ejercicios.`} confirmLabel="Guardar cambios" pendingLabel="Guardando…" onConfirm={editor.confirmUpdate} />
  </form>
 );
}

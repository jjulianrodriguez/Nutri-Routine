"use client";

import { Loader2, Pencil, Plus, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import { FieldGroup, FormAlert, FormField } from "@/components/ui/forms/form-field";
import { Input } from "@/components/ui/forms/input";
import { Select } from "@/components/ui/forms/select";
import { Textarea } from "@/components/ui/forms/textarea";
import {
 exerciseCategoryOptions,
 exerciseMuscleGroupOptions,
 exerciseTypeOptions,
 getExerciseSelectOptions,
} from "@/lib/exercises/options";

import { difficultyLabels } from "./helpers";
import type { ExerciseManagerViewModel } from "./hooks/use-exercise-manager";

export function ExerciseFormSection({ manager }: { manager: ExerciseManagerViewModel }) {
 const {
  addMultimediaUrl,
  category,
  editingId,
  exerciseType,
  form,
  multimediaUrls,
  muscleGroup,
  removeMultimediaUrl,
  resetForm,
  statusMessage,
 } = manager;
 const {
  formState: { errors, isSubmitting },
  handleSubmit,
  register,
 } = form;

 return (
  <section id="exercise-form" className="scroll-mt-6 rounded-[28px] bg-surface p-5 sm:p-6 xl:self-start">
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

   <form className="mt-6 space-y-5" onSubmit={handleSubmit(manager.onSubmit)} noValidate>
    <Input type="hidden" {...register("id")} />

    <FieldGroup className="rounded-[22px] bg-background p-4 sm:p-5" legend="Información principal" legendClassName="px-1">
     <div className="grid gap-5">
      <FormField controlId="exercise-name" error={errors.name?.message} errorId="exercise-name-error" label="Nombre">
       <Input placeholder="Ej. Sentadilla goblet" aria-invalid={Boolean(errors.name)} {...register("name")} />
      </FormField>
      <FormField controlId="exercise-description" error={errors.description?.message} errorId="exercise-description-error" label="Descripción e instrucciones">
       <Textarea rows={5} placeholder="Explica la tecnica, postura y puntos de control." aria-invalid={Boolean(errors.description)} {...register("description")} />
      </FormField>
     </div>
    </FieldGroup>

    <FieldGroup className="rounded-[22px] bg-background p-4 sm:p-5" legend="Clasificación" legendClassName="px-1">
     <div className="grid gap-5 sm:grid-cols-2">
      <Select id="exercise-difficulty" label="Dificultad" labelClassName="font-extrabold" {...register("difficulty")}>
       {Object.entries(difficultyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </Select>
      <Select id="exercise-muscle-group" label="Grupo muscular" labelClassName="font-extrabold" error={errors.muscleGroup?.message} {...register("muscleGroup")}>
       <option value="" disabled>Selecciona un grupo muscular</option>
       {getExerciseSelectOptions(exerciseMuscleGroupOptions, muscleGroup).map((option) => (
        <option key={option} value={option}>
         {option}{!exerciseMuscleGroupOptions.includes(option as (typeof exerciseMuscleGroupOptions)[number]) ? " (valor existente)" : ""}
        </option>
       ))}
      </Select>
      <Select id="exercise-category" label="Categoría" labelClassName="font-extrabold" error={errors.category?.message} {...register("category")}>
       <option value="" disabled>Selecciona una categoría</option>
       {getExerciseSelectOptions(exerciseCategoryOptions, category).map((option) => (
        <option key={option} value={option}>
         {option}{!exerciseCategoryOptions.includes(option as (typeof exerciseCategoryOptions)[number]) ? " (valor existente)" : ""}
        </option>
       ))}
      </Select>
      <Select id="exercise-type" label="Tipo" labelClassName="font-extrabold" error={errors.exerciseType?.message} {...register("exerciseType")}>
       <option value="" disabled>Selecciona un tipo</option>
       {getExerciseSelectOptions(exerciseTypeOptions, exerciseType).map((option) => (
        <option key={option} value={option}>
         {option}{!exerciseTypeOptions.includes(option as (typeof exerciseTypeOptions)[number]) ? " (valor existente)" : ""}
        </option>
       ))}
      </Select>
     </div>
    </FieldGroup>

    <FieldGroup className="rounded-[22px] bg-background p-4 sm:p-5" legend="Recursos multimedia externos" legendClassName="px-1" description="Opcional. Agrega hasta 3 enlaces HTTP o HTTPS. No se suben imagenes, videos ni archivos.">
     <div className="mt-4 space-y-4">
      {multimediaUrls.map((_, index) => {
       const error = errors.multimediaUrls?.[index]?.message;
       const inputId = `exercise-multimedia-${index}`;
       return (
        <div key={inputId} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
         <FormField controlId={inputId} error={error} errorId={`${inputId}-error`} label={`Recurso ${index + 1}`}>
          <Input type="url" placeholder="https://..." aria-invalid={Boolean(error)} {...register(`multimediaUrls.${index}`)} />
         </FormField>
         {multimediaUrls.length > 1 ? (
          <Button type="button" variant="destructive" className="min-h-11" onClick={() => removeMultimediaUrl(index)} aria-label={`Quitar recurso multimedia ${index + 1}`}>
           <X aria-hidden="true" /> Quitar
          </Button>
         ) : null}
        </div>
       );
      })}
     </div>
     {multimediaUrls.length < 3 ? (
      <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={addMultimediaUrl}>
       <Plus aria-hidden="true" /> Agregar recurso multimedia
      </Button>
     ) : (
      <p className="mt-4 text-xs font-bold text-muted">Alcanzaste el máximo de 3 recursos multimedia.</p>
     )}
    </FieldGroup>

    <FormAlert message={statusMessage} />
    <Button type="submit" size="lg" disabled={isSubmitting}>
     {isSubmitting ? (
      <><Loader2 className="animate-spin" aria-hidden="true" /> Guardando...</>
     ) : (
      <>{editingId ? <Pencil aria-hidden="true" /> : <Plus aria-hidden="true" />}{editingId ? "Guardar cambios" : "Crear ejercicio"}</>
     )}
    </Button>
   </form>
  </section>
 );
}

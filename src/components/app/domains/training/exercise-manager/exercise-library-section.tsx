"use client";

import {
 ArrowRight,
 CalendarClock,
 Link2,
 Loader2,
 Pencil,
 Power,
 PowerOff,
 Search,
 Trash2,
 UserRound,
} from "lucide-react";
import Link from "next/link";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { Button } from "@/components/ui/actions/button";
import { SearchField } from "@/components/ui/forms/search-field";
import { Select } from "@/components/ui/forms/select";
import { cn } from "@/lib/utils";

import {
 difficultyLabels,
 formatExerciseDate,
 statusFilterLabels,
} from "./helpers";
import type { ExerciseManagerViewModel } from "./hooks/use-exercise-manager";

export function ExerciseLibrarySection({ manager }: { manager: ExerciseManagerViewModel }) {
 const {
  applyLibraryFilters,
  clearLibraryFilters,
  draftFilters,
  editExercise,
  exercises,
  filterOptions,
  isPending,
  loadMoreExercises,
  pagination,
  removeExercise,
  setConfirmation,
  updateDraftFilter,
 } = manager;

 return (
  <section className="rounded-[28px] bg-surface p-5 sm:p-6">
   <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
     <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">Biblioteca</p>
     <h2 className="mt-2 text-2xl font-semibold text-foreground">{pagination.totalCount} ejercicios encontrados</h2>
     <p className="mt-2 text-sm font-semibold text-muted">
      Mostrando {exercises.length} de {pagination.totalCount}. Los filtros se aplican antes de cargar más resultados.
     </p>
    </div>
   </div>

   <form className="mt-5 rounded-[22px] border-foreground/10 bg-background p-4" onSubmit={applyLibraryFilters}>
    <SearchField value={draftFilters.query} onValueChange={(value) => updateDraftFilter("query", value)} placeholder="Buscar por nombre, grupo, categoría o tipo" aria-label="Buscar ejercicios" />
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
     <Select id="exercise-filter-muscle" label="Grupo muscular" labelClassName="text-xs font-extrabold uppercase tracking-[0.12em] text-muted" value={draftFilters.muscleGroup} onChange={(event) => updateDraftFilter("muscleGroup", event.target.value)}>
      <option value="all">Todos</option>
      {filterOptions.muscleGroups.map((option) => <option key={option} value={option}>{option}</option>)}
     </Select>
     <Select id="exercise-filter-difficulty" label="Dificultad" labelClassName="text-xs font-extrabold uppercase tracking-[0.12em] text-muted" value={draftFilters.difficulty} onChange={(event) => updateDraftFilter("difficulty", event.target.value)}>
      <option value="all">Todas</option>
      {Object.entries(difficultyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
     </Select>
     <Select id="exercise-filter-status" label="Estado" labelClassName="text-xs font-extrabold uppercase tracking-[0.12em] text-muted" value={draftFilters.status} onChange={(event) => updateDraftFilter("status", event.target.value)}>
      {Object.entries(statusFilterLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
     </Select>
     <Select id="exercise-filter-category" label="Categoría" labelClassName="text-xs font-extrabold uppercase tracking-[0.12em] text-muted" value={draftFilters.category} onChange={(event) => updateDraftFilter("category", event.target.value)}>
      <option value="all">Todas</option>
      {filterOptions.categories.map((option) => <option key={option} value={option}>{option}</option>)}
     </Select>
     <Select id="exercise-filter-type" label="Tipo" labelClassName="text-xs font-extrabold uppercase tracking-[0.12em] text-muted" value={draftFilters.exerciseType} onChange={(event) => updateDraftFilter("exerciseType", event.target.value)}>
      <option value="all">Todos</option>
      {filterOptions.exerciseTypes.map((option) => <option key={option} value={option}>{option}</option>)}
     </Select>
    </div>
    <div className="mt-4 flex flex-wrap justify-end gap-3">
     <Button type="button" variant="outline" onClick={clearLibraryFilters} disabled={isPending}>Limpiar filtros</Button>
     <Button type="submit" disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
      Aplicar filtros
     </Button>
    </div>
   </form>

   <div className="mt-5 grid gap-4">
    {exercises.length > 0 ? exercises.map((exercise) => (
     <article key={exercise.id} className={cn("group relative overflow-hidden rounded-[26px] bg-surface p-5 transition-[background-color,border-color,box-shadow] hover:border-primary/45 hover:bg-surface-hover sm:p-6", exercise.isActive ? "" : " opacity-90")}>
      <Link href={`/app/entrenamiento/ejercicios/${exercise.id}`} className="absolute inset-0 z-0 rounded-[26px] outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/35" aria-label={`Ver información completa de ${exercise.name}`}>
       <span className="sr-only">Ver información completa de {exercise.name}</span>
      </Link>
      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
       <div className="min-w-0 flex-1">
        <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-extrabold", exercise.isActive ? "bg-primary text-primary-foreground" : "bg-surface-muted text-foreground")}>{exercise.isActive ? "Activo" : "Inactivo"}</span>
        <h3 className="mt-3 text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground sm:text-2xl">{exercise.name}</h3>
        {exercise.description ? <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-muted">{exercise.description}</p> : null}
        <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-muted-foreground transition group-hover:text-foreground">
         Ver información completa <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
       </div>
       <div className="pointer-events-auto relative z-20 shrink-0">
        <CardActionsMenu label={exercise.name} items={[
         { icon: Pencil, label: "Editar", onSelect: () => editExercise(exercise) },
         { destructive: exercise.isActive, icon: exercise.isActive ? PowerOff : Power, label: exercise.isActive ? "Desactivar" : "Activar", onSelect: () => setConfirmation({ exercise, type: "status" }), separatorBefore: true },
         { destructive: true, icon: Trash2, label: "Eliminar", onSelect: () => removeExercise(exercise) },
        ]} />
       </div>
      </div>
      <div className="pointer-events-none relative z-10 mt-4 flex flex-wrap items-center gap-2 text-xs font-extrabold text-muted-foreground">
       <span className="rounded-full bg-secondary-soft px-3 py-1 text-foreground">{difficultyLabels[exercise.difficulty ?? "beginner"]}</span>
       <span className="rounded-full bg-background px-3 py-1" title="Grupo muscular">{exercise.muscleGroup}</span>
       <span className="rounded-full bg-background px-3 py-1" title="Categoría">{exercise.category}</span>
       <span className="rounded-full bg-background px-3 py-1" title="Tipo de ejercicio">{exercise.exerciseType}</span>
       <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1", exercise.multimediaUrls.length > 0 ? "border-primary/30 bg-primary-soft text-foreground" : " bg-background text-muted")}>
        <Link2 className="size-3.5" aria-hidden="true" />
        {exercise.multimediaUrls.length} {exercise.multimediaUrls.length === 1 ? "recurso" : "recursos"}
       </span>
      </div>
      <div className="pointer-events-none relative z-10 -mx-5 mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t px-5 pt-4 text-sm text-muted sm:-mx-6 sm:px-6">
       <span className="inline-flex items-center gap-2"><UserRound className="size-4" aria-hidden="true" />{exercise.creatorName}</span>
       <span className="inline-flex items-center gap-2"><CalendarClock className="size-4" aria-hidden="true" />Creado {formatExerciseDate(exercise.createdAt)}</span>
       <span className="inline-flex items-center gap-2"><CalendarClock className="size-4" aria-hidden="true" />Actualizado {formatExerciseDate(exercise.updatedAt)}</span>
      </div>
     </article>
    )) : (
     <div className="rounded-[22px] bg-background p-8 text-center">
      <p className="font-extrabold text-foreground">No hay ejercicios que coincidan.</p>
      <p className="mt-2 text-sm text-muted">Ajusta la busqueda o crea el primer ejercicio.</p>
     </div>
    )}
    {pagination.hasMore ? (
     <Button type="button" variant="outline" className="min-h-11 w-full" onClick={loadMoreExercises} disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {isPending ? "Cargando..." : `Cargar ${pagination.pageSize} más`}
     </Button>
    ) : exercises.length > 0 ? (
     <p className="rounded-[18px] bg-background px-4 py-3 text-center text-sm font-semibold text-muted">Ya estas viendo todos los ejercicios que coinciden.</p>
    ) : null}
   </div>
  </section>
 );
}

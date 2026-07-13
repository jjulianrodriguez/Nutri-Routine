import type { ExerciseListFilters } from "@/types/exercise";

import type { ExerciseFilterDraft } from "./types";

export const difficultyLabels = {
 advanced: "Avanzado",
 beginner: "Principiante",
 intermediate: "Intermedio",
} as const;

export const libraryPath = "/app/entrenamiento/ejercicios";

export const statusFilterLabels = {
 active: "Activos",
 all: "Todos",
 inactive: "Inactivos",
} as const;

export function formatExerciseDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
 }).format(new Date(value));
}

export function getDraftFilters(
 filters: ExerciseListFilters,
): ExerciseFilterDraft {
 return {
  category: filters.category || "all",
  difficulty: filters.difficulty || "all",
  exerciseType: filters.exerciseType || "all",
  muscleGroup: filters.muscleGroup || "all",
  query: filters.query ?? "",
  status: filters.status || "all",
 };
}

export function buildExerciseLibraryUrl(
 filters: ExerciseFilterDraft,
 page: number,
) {
 const params = new URLSearchParams();
 const query = filters.query.trim();

 if (query) params.set("q", query);
 if (filters.muscleGroup !== "all") params.set("muscle", filters.muscleGroup);
 if (filters.difficulty !== "all") params.set("difficulty", filters.difficulty);
 if (filters.status !== "all") params.set("status", filters.status);
 if (filters.category !== "all") params.set("category", filters.category);
 if (filters.exerciseType !== "all") params.set("type", filters.exerciseType);
 if (page > 1) params.set("page", String(page));

 const search = params.toString();
 return search ? `${libraryPath}?${search}` : libraryPath;
}

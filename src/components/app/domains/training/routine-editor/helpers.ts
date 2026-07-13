import type { ExerciseOption } from "@/types/exercise";
import type { RoutineDetail } from "@/types/routine";
import type { RoutineExerciseFormValues, RoutineFormValues } from "@/lib/validations/routines";

export const routineDifficultyLabels = {
 advanced: "Avanzado",
 beginner: "Principiante",
 intermediate: "Intermedio",
} as const;

export const routineCategoryOptions = ["Fuerza", "Hipertrofia", "Resistencia", "Cardio", "Movilidad", "Tecnica", "Recuperacion", "Ganar masa muscular", "Perdida de grasa", "General"] as const;
export const routineTargetAudienceOptions = ["General", "Principiantes", "Intermedio", "Avanzado", "Adultos", "Adultos mayores", "Deportistas", "Postura y movilidad", "Reacondicionamiento", "Otro"] as const;

export function normalizeRoutineSearch(value: string) {
 return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
}

export function toRoutineFormExercise(
 exercise: ExerciseOption,
 details?: { durationMinutes: number | null; notes: string | null; repetitions: string | null; restSeconds: number | null; series: number | null },
): RoutineExerciseFormValues {
 const useMinutes = details?.restSeconds !== null && details?.restSeconds !== undefined && details.restSeconds >= 60 && details.restSeconds % 60 === 0;
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
  restValue: details?.restSeconds === null || details?.restSeconds === undefined ? "" : String(useMinutes ? details.restSeconds / 60 : details.restSeconds),
  series: details?.series?.toString() ?? "",
 };
}

export function getRoutineSelectOptions(options: readonly string[], currentValue: string | undefined) {
 const normalizedCurrent = currentValue?.trim();
 if (normalizedCurrent && !options.some((option) => option === normalizedCurrent)) return [...options, normalizedCurrent];
 return [...options];
}

export function getRoutineDefaultValues(routine?: RoutineDetail): RoutineFormValues {
 return {
  category: routine?.category ?? "",
  description: routine?.description ?? "",
  difficulty: routine?.difficulty ?? "beginner",
  exercises: routine?.exercises.map((item) => toRoutineFormExercise(item.exercise, { durationMinutes: item.durationMinutes, notes: item.notes, repetitions: item.repetitions, restSeconds: item.restSeconds, series: item.series })) ?? [],
  isActive: routine?.isActive ?? true,
  name: routine?.name ?? "",
  targetAudience: routine?.targetAudience ?? "General",
 };
}

export function getExerciseSetupState(exercise: RoutineExerciseFormValues | undefined) {
 const missing = [];
 if (!exercise?.series.trim()) missing.push("series");
 if (!exercise?.repetitions.trim()) missing.push("repeticiones");
 if (!exercise?.restValue.trim()) missing.push("descanso");
 return { isConfigured: missing.length === 0, missing };
}

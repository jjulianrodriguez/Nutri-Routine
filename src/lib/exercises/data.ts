import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ExerciseDifficulty,
  ExerciseListItem,
} from "@/types/exercise";

function normalizeDifficulty(value: string | null): ExerciseDifficulty {
  if (
    value === "beginner" ||
    value === "intermediate" ||
    value === "advanced"
  ) {
    return value;
  }

  return "beginner";
}

export async function listExercises(): Promise<ExerciseListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, name, description, difficulty, muscle_group, category, exercise_type, multimedia_url, created_by, is_active, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("No se pudo cargar el catalogo de ejercicios.");
  }

  const exercises = data ?? [];
  const creatorIds = [...new Set(exercises.map((exercise) => exercise.created_by))];
  const creatorsResult =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [], error: null };

  if (creatorsResult.error) {
    throw new Error("No se pudieron cargar los creadores de los ejercicios.");
  }

  const creators = new Map(
    (creatorsResult.data ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Profesional",
    ]),
  );

  return exercises.map((exercise) => ({
    category: exercise.category,
    createdAt: exercise.created_at,
    createdBy: exercise.created_by,
    creatorName: creators.get(exercise.created_by) ?? "Profesional",
    description: exercise.description,
    difficulty: normalizeDifficulty(exercise.difficulty),
    exerciseType: exercise.exercise_type,
    id: exercise.id,
    isActive: exercise.is_active,
    multimediaUrl: exercise.multimedia_url,
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
    updatedAt: exercise.updated_at,
  }));
}

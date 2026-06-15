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

function normalizeOptionalDifficulty(
  value: string | null,
): ExerciseDifficulty | null {
  if (
    value === "beginner" ||
    value === "intermediate" ||
    value === "advanced"
  ) {
    return value;
  }

  return null;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeMultimediaUrls(
  multimediaUrls: string[] | null,
  multimediaUrl: string | null,
) {
  if (multimediaUrls && multimediaUrls.length > 0) {
    return multimediaUrls.slice(0, 3);
  }

  return multimediaUrl ? [multimediaUrl] : [];
}

export async function listExercises(): Promise<ExerciseListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, name, description, difficulty, muscle_group, category, exercise_type, multimedia_url, multimedia_urls, created_by, is_active, created_at, updated_at",
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
    multimediaUrls: normalizeMultimediaUrls(
      exercise.multimedia_urls,
      exercise.multimedia_url,
    ),
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
    updatedAt: exercise.updated_at,
  }));
}

export async function getExerciseDetail(
  exerciseId: string,
): Promise<ExerciseListItem | null> {
  if (!UUID_PATTERN.test(exerciseId)) {
    return null;
  }

  const supabase = await createClient();
  const { data: exercise, error } = await supabase
    .from("exercises")
    .select(
      "id, name, description, difficulty, muscle_group, category, exercise_type, multimedia_url, multimedia_urls, created_by, is_active, created_at, updated_at",
    )
    .eq("id", exerciseId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar el detalle del ejercicio.");
  }

  if (!exercise) {
    return null;
  }

  const { data: creator, error: creatorError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", exercise.created_by)
    .maybeSingle();

  if (creatorError) {
    throw new Error("No se pudo cargar el creador del ejercicio.");
  }

  return {
    category: exercise.category,
    createdAt: exercise.created_at,
    createdBy: exercise.created_by,
    creatorName: creator?.full_name?.trim() || "No indicado",
    description: exercise.description,
    difficulty: normalizeOptionalDifficulty(exercise.difficulty),
    exerciseType: exercise.exercise_type,
    id: exercise.id,
    isActive: exercise.is_active,
    multimediaUrl: exercise.multimedia_url,
    multimediaUrls: normalizeMultimediaUrls(
      exercise.multimedia_urls,
      exercise.multimedia_url,
    ),
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
    updatedAt: exercise.updated_at,
  };
}

import "server-only";

import { normalizeExerciseMultimediaUrls } from "@/lib/exercises/multimedia";
import { createClient } from "@/lib/supabase/server";
import type {
  ExerciseDifficulty,
  ExerciseFilterOptions,
  ExerciseListFilters,
  ExerciseListItem,
  ExerciseListResult,
} from "@/types/exercise";

const EXERCISE_COLUMNS =
  "id, name, description, difficulty, muscle_group, category, exercise_type, multimedia_url, multimedia_urls, created_by, is_active, created_at, updated_at";

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

function getVisibleCount(page: number, pageSize: number) {
  return Math.max(1, page) * Math.max(1, pageSize);
}

function normalizePageValue(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function normalizeTextFilter(value?: string) {
  const trimmed = value?.trim();

  return trimmed && trimmed !== "all" ? trimmed : null;
}

function getSafeSearchPattern(value?: string) {
  const trimmed = value?.trim().replace(/[,%]/g, " ");

  return trimmed ? `%${trimmed}%` : null;
}

async function mapExerciseRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  exercises: Array<{
    category: string;
    created_at: string;
    created_by: string;
    description: string | null;
    difficulty: string | null;
    exercise_type: string;
    id: string;
    is_active: boolean;
    multimedia_url: string | null;
    multimedia_urls: string[] | null;
    muscle_group: string;
    name: string;
    updated_at: string;
  }>,
): Promise<ExerciseListItem[]> {
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
    multimediaUrls: normalizeExerciseMultimediaUrls(
      exercise.multimedia_urls,
      exercise.multimedia_url,
    ),
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
    updatedAt: exercise.updated_at,
  }));
}

export async function listExercises({
  category,
  difficulty = "all",
  exerciseType,
  muscleGroup,
  page = 1,
  pageSize = 10,
  query,
  status = "all",
}: Partial<ExerciseListFilters> = {}): Promise<ExerciseListResult> {
  const supabase = await createClient();
  const safePage = normalizePageValue(page, 1);
  const safePageSize = normalizePageValue(pageSize, 10);
  const visibleCount = getVisibleCount(safePage, safePageSize);
  let exercisesQuery = supabase
    .from("exercises")
    .select(EXERCISE_COLUMNS, { count: "exact" });
  const searchPattern = getSafeSearchPattern(query);

  if (searchPattern) {
    exercisesQuery = exercisesQuery.or(
      [
        `name.ilike.${searchPattern}`,
        `description.ilike.${searchPattern}`,
        `muscle_group.ilike.${searchPattern}`,
        `category.ilike.${searchPattern}`,
        `exercise_type.ilike.${searchPattern}`,
      ].join(","),
    );
  }

  if (difficulty && difficulty !== "all") {
    exercisesQuery = exercisesQuery.eq("difficulty", difficulty);
  }

  if (status === "active") {
    exercisesQuery = exercisesQuery.eq("is_active", true);
  } else if (status === "inactive") {
    exercisesQuery = exercisesQuery.eq("is_active", false);
  }

  const normalizedMuscleGroup = normalizeTextFilter(muscleGroup);
  const normalizedCategory = normalizeTextFilter(category);
  const normalizedExerciseType = normalizeTextFilter(exerciseType);

  if (normalizedMuscleGroup) {
    exercisesQuery = exercisesQuery.eq("muscle_group", normalizedMuscleGroup);
  }

  if (normalizedCategory) {
    exercisesQuery = exercisesQuery.eq("category", normalizedCategory);
  }

  if (normalizedExerciseType) {
    exercisesQuery = exercisesQuery.eq("exercise_type", normalizedExerciseType);
  }

  const { data, error, count } = await exercisesQuery
    .order("updated_at", { ascending: false })
    .range(0, visibleCount - 1);

  if (error) {
    throw new Error("No se pudo cargar el catalogo de ejercicios.");
  }

  const totalCount = count ?? 0;
  const items = await mapExerciseRows(supabase, data ?? []);

  return {
    hasMore: visibleCount < totalCount,
    items,
    page: safePage,
    pageSize: safePageSize,
    totalCount,
  };
}

export async function getExerciseFilterOptions(): Promise<ExerciseFilterOptions> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("muscle_group, category, exercise_type");

  if (error) {
    throw new Error("No se pudieron cargar los filtros de ejercicios.");
  }

  const rows = data ?? [];
  const sortOptions = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((left, right) =>
      left.localeCompare(right, "es"),
    );

  return {
    categories: sortOptions(rows.map((row) => row.category)),
    exerciseTypes: sortOptions(rows.map((row) => row.exercise_type)),
    muscleGroups: sortOptions(rows.map((row) => row.muscle_group)),
  };
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
    .select(EXERCISE_COLUMNS)
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
    multimediaUrls: normalizeExerciseMultimediaUrls(
      exercise.multimedia_urls,
      exercise.multimedia_url,
    ),
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
    updatedAt: exercise.updated_at,
  };
}

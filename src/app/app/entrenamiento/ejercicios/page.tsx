import { redirect } from "next/navigation";

import { AppHeader, AppScreen } from "@/components/app/AppScreen";
import { ExerciseManager } from "@/components/app/exercise-manager";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
 getExerciseFilterOptions,
 listExercises,
} from "@/lib/exercises/data";
import type {
 ExerciseDifficulty,
 ExerciseListFilters,
 ExerciseStatusFilter,
} from "@/types/exercise";

const EXERCISE_PAGE_SIZE = 10;
const difficultyValues = ["beginner", "intermediate", "advanced"] as const;
const statusValues = ["active", "all", "inactive"] as const;

function getParam(value: string | string[] | undefined) {
 return typeof value === "string" ? value : "";
}

function getDifficulty(value: string): ExerciseDifficulty | "all" {
 return difficultyValues.includes(value as ExerciseDifficulty)
 ? (value as ExerciseDifficulty)
 : "all";
}

function getStatus(value: string): ExerciseStatusFilter {
 return statusValues.includes(value as ExerciseStatusFilter)
 ? (value as ExerciseStatusFilter)
 : "all";
}

function getPage(value: string) {
 const parsed = Number(value);

 return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export default async function ExercisesPage({
 searchParams,
}: {
 searchParams: Promise<{
 category?: string | string[];
 difficulty?: string | string[];
 muscle?: string | string[];
 page?: string | string[];
 q?: string | string[];
 status?: string | string[];
 type?: string | string[];
 }>;
}) {
 const access = await requireRouteAccess(
 "/app/entrenamiento/ejercicios",
 );

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const query = await searchParams;
 const filters: ExerciseListFilters = {
 category: getParam(query.category),
 difficulty: getDifficulty(getParam(query.difficulty)),
 exerciseType: getParam(query.type),
 muscleGroup: getParam(query.muscle),
 page: getPage(getParam(query.page)),
 pageSize: EXERCISE_PAGE_SIZE,
 query: getParam(query.q),
 status: getStatus(getParam(query.status)),
 };
 const [exerciseResult, filterOptions] = await Promise.all([
 listExercises(filters),
 getExerciseFilterOptions(),
 ]);

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Entrenamiento"
 title="Ejercicios"
 description="Crea y mantiene la biblioteca que se utiliza despues para construir entrenamientos."
 />
 <TrainingSectionNav active="exercises" />
 <ExerciseManager
 exercises={exerciseResult.items}
 filterOptions={filterOptions}
 filters={filters}
 pagination={{
 hasMore: exerciseResult.hasMore,
 page: exerciseResult.page,
 pageSize: exerciseResult.pageSize,
 totalCount: exerciseResult.totalCount,
 }}
 />
 </AppScreen>
 );
}

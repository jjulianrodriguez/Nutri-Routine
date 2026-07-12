import type { WorkoutWeekday } from "@/lib/workout-templates/weekdays";
import type { ExerciseDifficulty, ExerciseOption } from "@/types/exercise";

export type WorkoutSnapshotRoutine = {
 category: string;
 description: string;
 difficulty: ExerciseDifficulty;
 exercises: {
 durationMinutes: number | null;
 exercise: ExerciseOption;
 id: string;
 notes: string | null;
 position: number;
 repetitions: string | null;
 restSeconds: number | null;
 series: number | null;
 }[];
 id: string;
 name: string;
 targetAudience: string;
};

export type WorkoutTemplateSnapshot = {
 days: {
 dayNumber: number;
 routine: WorkoutSnapshotRoutine;
 weekday: WorkoutWeekday | null;
 }[];
 template: {
 cycleDays: number;
 description: string | null;
 id: string;
 name: string;
 };
 version: number;
};

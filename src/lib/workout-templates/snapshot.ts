import { z } from "zod";

import { normalizeExerciseMultimediaUrls } from "@/lib/exercises/multimedia";
import { WORKOUT_WEEKDAY_VALUES } from "@/lib/workout-templates/weekdays";
import type { Json } from "@/types/database";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

const difficultySchema = z.enum([
 "beginner",
 "intermediate",
 "advanced",
]);

const exerciseSchema = z
 .object({
 category: z.string(),
 description: z.string().nullable(),
 difficulty: difficultySchema.nullable(),
 exerciseType: z.string(),
 id: z.string().uuid(),
 isActive: z.boolean(),
 multimediaUrl: z.string().nullable().optional(),
 multimediaUrls: z.array(z.string()).max(3).optional(),
 muscleGroup: z.string(),
 name: z.string(),
 })
 .transform((exercise) => {
 const multimediaUrls = normalizeExerciseMultimediaUrls(
 exercise.multimediaUrls,
 exercise.multimediaUrl,
 );

 return {
 ...exercise,
 multimediaUrl: exercise.multimediaUrl ?? multimediaUrls[0] ?? null,
 multimediaUrls,
 };
 });

const routineExerciseSchema = z.object({
 durationMinutes: z.number().int().nullable(),
 exercise: exerciseSchema,
 id: z.string().uuid(),
 notes: z.string().nullable(),
 position: z.number().int(),
 repetitions: z.string().nullable(),
 restSeconds: z.number().int().nullable(),
 series: z.number().int().nullable(),
});

const workoutTemplateSnapshotSchema = z.object({
 days: z.array(
 z.object({
 dayNumber: z.number().int().min(1),
 routine: z.object({
 category: z.string(),
 description: z.string(),
 difficulty: difficultySchema,
 exercises: z.array(routineExerciseSchema),
 id: z.string().uuid(),
 name: z.string(),
 targetAudience: z.string(),
 }),
 weekday: z.enum(WORKOUT_WEEKDAY_VALUES).nullable().optional(),
 }),
 ),
 template: z.object({
 cycleDays: z.number().int().min(1).max(31),
 description: z.string().nullable(),
 id: z.string().uuid(),
 name: z.string(),
 }),
 version: z.number().int().min(1),
});

export function parseWorkoutTemplateSnapshot(
 value: Json | null,
): WorkoutTemplateSnapshot | null {
 const parsed = workoutTemplateSnapshotSchema.safeParse(value);

 if (!parsed.success) {
 return null;
 }

 return {
 ...parsed.data,
 days: parsed.data.days.map((day) => ({
 ...day,
 weekday: day.weekday ?? null,
 })),
 };
}

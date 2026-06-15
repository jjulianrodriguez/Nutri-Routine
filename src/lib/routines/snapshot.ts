import { z } from "zod";

import type { Json } from "@/types/database";
import type { RoutineDetail } from "@/types/routine";

const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

const exerciseSchema = z.object({
  category: z.string(),
  description: z.string().nullable(),
  difficulty: difficultySchema.nullable(),
  exerciseType: z.string(),
  id: z.string().uuid(),
  isActive: z.boolean(),
  multimediaUrl: z.string().nullable(),
  muscleGroup: z.string(),
  name: z.string(),
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

const routineSnapshotSchema = z.object({
  capturedAt: z.string(),
  exercises: z.array(routineExerciseSchema),
  routine: z.object({
    category: z.string(),
    createdAt: z.string(),
    creator: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
    description: z.string(),
    difficulty: difficultySchema,
    id: z.string().uuid(),
    identifier: z.string().nullable(),
    isActive: z.boolean(),
    name: z.string(),
    targetAudience: z.string(),
    updatedAt: z.string(),
  }),
  source: z.enum(["assignment", "backfill"]),
  version: z.literal(1),
});

export type RoutineSnapshotSource = z.infer<
  typeof routineSnapshotSchema
>["source"];

export type ParsedRoutineSnapshot = {
  capturedAt: string;
  routine: RoutineDetail;
  source: RoutineSnapshotSource;
};

export function parseRoutineSnapshot(
  value: Json | null,
): ParsedRoutineSnapshot | null {
  const parsed = routineSnapshotSchema.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  return {
    capturedAt: parsed.data.capturedAt,
    routine: {
      category: parsed.data.routine.category,
      createdAt: parsed.data.routine.createdAt,
      creatorId: parsed.data.routine.creator.id,
      creatorName: parsed.data.routine.creator.name,
      description: parsed.data.routine.description,
      difficulty: parsed.data.routine.difficulty,
      exercises: parsed.data.exercises,
      id: parsed.data.routine.id,
      identifier: parsed.data.routine.identifier,
      isActive: parsed.data.routine.isActive,
      name: parsed.data.routine.name,
      targetAudience: parsed.data.routine.targetAudience,
      updatedAt: parsed.data.routine.updatedAt,
    },
    source: parsed.data.source,
  };
}

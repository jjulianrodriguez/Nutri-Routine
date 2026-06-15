import { z } from "zod";

const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

function optionalIntegerString(
  label: string,
  minimum: number,
  maximum: number,
) {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        (/^\d+$/.test(value) &&
          Number(value) >= minimum &&
          Number(value) <= maximum),
      `${label} debe estar entre ${minimum} y ${maximum}.`,
    );
}

export const routineExerciseSchema = z
  .object({
    category: z.string().trim().max(80),
    description: z.string().trim().max(1200),
    difficulty: z.union([difficultySchema, z.literal("")]),
    durationMinutes: optionalIntegerString("La duracion", 1, 1440),
    exerciseId: z.string().uuid("Selecciona un ejercicio existente."),
    exerciseType: z.string().trim().max(100),
    muscleGroup: z.string().trim().max(100),
    name: z.string().trim().max(140),
    notes: z.string().trim().max(1000),
    repetitions: z.string().trim().max(80),
    restUnit: z.enum(["seconds", "minutes"]),
    restValue: optionalIntegerString("El descanso", 0, 86400),
    series: optionalIntegerString("Las series", 1, 100),
  })
  .superRefine((exercise, context) => {
    if (
      exercise.restUnit === "minutes" &&
      exercise.restValue !== "" &&
      Number(exercise.restValue) > 1440
    ) {
      context.addIssue({
        code: "custom",
        message: "El descanso no puede superar 1440 minutos.",
        path: ["restValue"],
      });
    }
  });

export const routineFormSchema = z
  .object({
    category: z
      .string()
      .trim()
      .min(2, "Ingresa la categoria.")
      .max(80, "La categoria no puede superar 80 caracteres."),
    description: z
      .string()
      .trim()
      .min(2, "Ingresa una descripcion.")
      .max(2000, "La descripcion no puede superar 2000 caracteres."),
    difficulty: difficultySchema,
    exercises: z
      .array(routineExerciseSchema)
      .min(1, "Agrega al menos un ejercicio.")
      .max(100, "Una rutina no puede superar 100 ejercicios."),
    identifier: z
      .string()
      .trim()
      .max(160, "El identificador no puede superar 160 caracteres."),
    isActive: z.boolean(),
    name: z
      .string()
      .trim()
      .min(2, "Ingresa el nombre de la rutina.")
      .max(160, "El nombre no puede superar 160 caracteres."),
    targetAudience: z
      .string()
      .trim()
      .min(2, "Ingresa el publico objetivo.")
      .max(160, "El publico objetivo no puede superar 160 caracteres."),
  })
  .superRefine((routine, context) => {
    const exerciseIds = routine.exercises
      .map((exercise) => exercise.exerciseId)
      .filter(Boolean);
    const duplicateId = exerciseIds.find(
      (id, index) => exerciseIds.indexOf(id) !== index,
    );

    if (duplicateId) {
      context.addIssue({
        code: "custom",
        message: "No puedes agregar el mismo ejercicio dos veces.",
        path: ["exercises"],
      });
    }
  });

export type RoutineFormValues = z.infer<typeof routineFormSchema>;
export type RoutineExerciseFormValues = z.infer<
  typeof routineExerciseSchema
>;

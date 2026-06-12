import { z } from "zod";

const difficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const exerciseFormSchema = z.object({
  category: z
    .string()
    .trim()
    .min(2, "Ingresa una categoria.")
    .max(80, "La categoria no puede superar 80 caracteres."),
  description: z
    .string()
    .trim()
    .min(2, "Ingresa una descripcion o instrucciones.")
    .max(1200, "La descripcion no puede superar 1200 caracteres."),
  difficulty: difficultySchema,
  exerciseType: z
    .string()
    .trim()
    .min(2, "Ingresa el tipo de ejercicio.")
    .max(100, "El tipo no puede superar 100 caracteres."),
  id: z.union([z.literal(""), z.string().uuid()]),
  multimediaUrl: z
    .string()
    .trim()
    .max(2048, "La URL no puede superar 2048 caracteres.")
    .refine((value) => {
      if (!value) {
        return true;
      }

      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Ingresa una URL externa valida con http o https."),
  muscleGroup: z
    .string()
    .trim()
    .min(2, "Ingresa el grupo muscular.")
    .max(100, "El grupo muscular no puede superar 100 caracteres."),
  name: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre del ejercicio.")
    .max(140, "El nombre no puede superar 140 caracteres."),
});

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;

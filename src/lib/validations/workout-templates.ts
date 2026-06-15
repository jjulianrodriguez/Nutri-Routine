import { z } from "zod";

export const workoutTemplateDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(31),
  routineId: z.string().uuid("Selecciona un entrenamiento."),
});

export const workoutTemplateFormSchema = z
  .object({
    cycleDays: z
      .string()
      .trim()
      .regex(/^\d+$/, "Ingresa la cantidad de días.")
      .refine(
        (value) => Number(value) >= 1 && Number(value) <= 31,
        "El ciclo debe tener entre 1 y 31 días.",
      ),
    days: z.array(workoutTemplateDaySchema),
    description: z
      .string()
      .trim()
      .max(2000, "La descripción no puede superar 2000 caracteres."),
    isActive: z.boolean(),
    name: z
      .string()
      .trim()
      .min(2, "Ingresa el nombre de la plantilla.")
      .max(160, "El nombre no puede superar 160 caracteres."),
  })
  .superRefine((template, context) => {
    const cycleDays = Number(template.cycleDays);

    if (template.days.length !== cycleDays) {
      context.addIssue({
        code: "custom",
        message: "Asigna un entrenamiento a cada día del ciclo.",
        path: ["days"],
      });
      return;
    }

    const dayNumbers = new Set(template.days.map((day) => day.dayNumber));

    if (
      dayNumbers.size !== cycleDays ||
      template.days.some(
        (day) => day.dayNumber < 1 || day.dayNumber > cycleDays,
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "Los días del ciclo no son válidos.",
        path: ["days"],
      });
    }
  });

export type WorkoutTemplateFormValues = z.infer<
  typeof workoutTemplateFormSchema
>;

export const workoutTemplateAssignmentSchema = z.object({
  clientId: z.string().uuid("Selecciona un cliente."),
  durationWeeks: z
    .string()
    .trim()
    .regex(/^\d+$/, "Ingresa la duración en semanas.")
    .refine(
      (value) => Number(value) >= 1 && Number(value) <= 104,
      "La duración debe estar entre 1 y 104 semanas.",
    ),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha de inicio."),
  templateId: z.string().uuid("Selecciona una plantilla."),
});

export type WorkoutTemplateAssignmentFormValues = z.infer<
  typeof workoutTemplateAssignmentSchema
>;

import { z } from "zod";

const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha valida.")
  .optional()
  .or(z.literal(""));

export const habitSchema = z.object({
  active: z.boolean().optional(),
  description: z
    .string()
    .trim()
    .max(800, "La descripcion no puede superar 800 caracteres.")
    .optional()
    .or(z.literal("")),
  habitId: z.string().uuid("El habito no es valido.").optional(),
  title: z
    .string()
    .trim()
    .min(1, "Escribe un nombre para el habito.")
    .max(160, "El nombre no puede superar 160 caracteres."),
});

export const habitAssignmentSchema = z
  .object({
    active: z.boolean().optional(),
    assignmentId: z.string().uuid("La asignacion no es valida.").optional(),
    clientId: z.string().uuid("Selecciona una clienta valida."),
    daysOfWeek: z
      .array(z.number().int().min(1).max(7))
      .min(1, "Selecciona al menos un dia.")
      .max(7, "Selecciona solo dias de la semana."),
    endDate: optionalDateSchema,
    habitId: z.string().uuid("Selecciona un habito valido."),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha de inicio valida."),
  })
  .refine(
    (value) => !value.endDate || value.endDate >= value.startDate,
    {
      message: "La fecha final debe ser posterior al inicio.",
      path: ["endDate"],
    },
  );

export const habitProgressSchema = z.object({
  assignmentId: z.string().uuid("La asignacion no es valida."),
  completed: z.boolean(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no es valida."),
});

export type HabitValues = z.infer<typeof habitSchema>;
export type HabitAssignmentValues = z.infer<typeof habitAssignmentSchema>;
export type HabitProgressValues = z.infer<typeof habitProgressSchema>;

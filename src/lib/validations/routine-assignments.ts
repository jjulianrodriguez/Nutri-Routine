import { z } from "zod";

export const routineAssignmentSchema = z.object({
  clientId: z.string().uuid("Selecciona un cliente."),
  durationWeeks: z
    .string()
    .trim()
    .regex(/^\d+$/, "Ingresa la duracion en semanas.")
    .refine(
      (value) => Number(value) >= 1 && Number(value) <= 104,
      "La duracion debe estar entre 1 y 104 semanas.",
    ),
  routineId: z.string().uuid("La rutina indicada no es valida."),
  startDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha de inicio."),
});

export type RoutineAssignmentFormValues = z.infer<
  typeof routineAssignmentSchema
>;

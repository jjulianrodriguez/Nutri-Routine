import { z } from "zod";

export const clientActivationServiceSchema = z.enum([
  "none",
  "nutrition",
  "training",
  "both",
]);

export const clientActivationSchema = z.object({
  assignedNutritionistId: z.string().uuid().optional().or(z.literal("")),
  assignedTrainerId: z.string().uuid().optional().or(z.literal("")),
  clientId: z.string().uuid("Selecciona un cliente válido."),
  serviceType: clientActivationServiceSchema,
});

export type ClientActivationService = z.infer<
  typeof clientActivationServiceSchema
>;
export type ClientActivationValues = z.infer<typeof clientActivationSchema>;

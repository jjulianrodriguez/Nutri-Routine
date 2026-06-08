import { z } from "zod";

export const clientActivationServiceSchema = z.enum([
  "nutrition",
  "training",
  "both",
]);

export const clientActivationSchema = z.object({
  assignedNutritionistId: z.string().uuid().optional().or(z.literal("")),
  assignedTrainerId: z.string().uuid().optional().or(z.literal("")),
  clientId: z.string().uuid("Selecciona un cliente valido."),
  serviceType: clientActivationServiceSchema,
});

export type ClientActivationService = z.infer<
  typeof clientActivationServiceSchema
>;
export type ClientActivationValues = z.infer<typeof clientActivationSchema>;

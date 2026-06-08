import { z } from "zod";

export const updateBasicAccountSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre completo.")
    .max(120, "El nombre no puede superar 120 caracteres."),
});

export type UpdateBasicAccountValues = z.infer<
  typeof updateBasicAccountSchema
>;

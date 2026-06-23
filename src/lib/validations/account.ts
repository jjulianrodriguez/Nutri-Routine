import { z } from "zod";

import { passwordSchema } from "@/lib/validations/auth";

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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirma la contraseña."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

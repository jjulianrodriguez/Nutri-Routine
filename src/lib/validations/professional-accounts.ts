import { z } from "zod";

const temporaryPasswordSchema = z
  .string()
  .min(8, "La contraseña temporal debe tener al menos 8 caracteres.")
  .max(72, "La contraseña temporal no puede tener más de 72 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña temporal debe incluir al menos una letra.")
  .regex(/[0-9]/, "La contraseña temporal debe incluir al menos un número.");

export const professionalSpecialtySchema = z.enum([
  "nutrition",
  "training",
  "both",
]);

export const professionalIdSchema = z
  .string()
  .uuid("La cuenta profesional indicada no es válida.");

export const updateProfessionalAccountSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(800, "La descripción no puede superar 800 caracteres."),
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre completo.")
    .max(120, "El nombre no puede superar 120 caracteres."),
  professionalId: professionalIdSchema,
  specialty: professionalSpecialtySchema,
});

export const createProfessionalAccountSchema = z
  .object({
    adminAccessCode: z
      .string()
      .trim()
      .min(1, "Ingresa el código administrativo."),
    confirmTemporaryPassword: z
      .string()
      .min(1, "Confirma la contraseña temporal."),
    email: z
      .string()
      .trim()
      .min(1, "Ingresa el email.")
      .email("Ingresa un email válido."),
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresa el nombre completo.")
      .max(120, "El nombre no puede superar 120 caracteres."),
    specialty: professionalSpecialtySchema,
    temporaryPassword: temporaryPasswordSchema,
  })
  .refine((data) => data.temporaryPassword === data.confirmTemporaryPassword, {
    message: "Las contraseñas temporales no coinciden.",
    path: ["confirmTemporaryPassword"],
  });

export type CreateProfessionalAccountValues = z.infer<
  typeof createProfessionalAccountSchema
>;
export type ProfessionalSpecialty = z.infer<typeof professionalSpecialtySchema>;
export type UpdateProfessionalAccountValues = z.infer<
  typeof updateProfessionalAccountSchema
>;

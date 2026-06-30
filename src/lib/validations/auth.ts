import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu email.")
    .email("Ingresa un email válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

export const passwordRecoverySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu email.")
    .email("Ingresa un email válido."),
});

export const profileRoleSchema = z.enum(["client"]);

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(72, "La contraseña no puede tener más de 72 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número.");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre completo.")
      .max(120, "El nombre no puede superar 120 caracteres."),
    email: z
      .string()
      .trim()
      .min(1, "Ingresa tu email.")
      .email("Ingresa un email válido."),
    accessCode: z
      .string()
      .trim()
      .min(1, "Ingresa el código de acceso."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contraseña."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type PasswordRecoveryValues = z.infer<typeof passwordRecoverySchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu email.")
    .email("Ingresa un email valido."),
  password: z.string().min(1, "Ingresa tu contrasena."),
});

export const profileRoleSchema = z.enum(["professional", "client"]);

const passwordSchema = z
  .string()
  .min(8, "La contrasena debe tener al menos 8 caracteres.")
  .max(72, "La contrasena no puede tener mas de 72 caracteres.")
  .regex(/[A-Za-z]/, "La contrasena debe incluir al menos una letra.")
  .regex(/[0-9]/, "La contrasena debe incluir al menos un numero.");

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Ingresa el nombre del profesional.")
      .max(120, "El nombre no puede superar 120 caracteres."),
    email: z
      .string()
      .trim()
      .min(1, "Ingresa tu email.")
      .email("Ingresa un email valido."),
    accessCode: z
      .string()
      .trim()
      .min(1, "Ingresa el codigo de acceso."),
    role: profileRoleSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirma la contrasena."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contrasenas no coinciden.",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;

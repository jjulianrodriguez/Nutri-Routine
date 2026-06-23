import { z } from "zod";

export const professionalFocusAreaOptions = [
  "fat_loss",
  "hypertrophy",
  "digestive_health",
  "body_recomposition",
  "performance",
  "other",
] as const;

export const professionalProfileSchema = z.object({
  availabilityDays: z
    .string()
    .trim()
    .max(1000, "Los dias disponibles no pueden superar 1000 caracteres."),
  availabilityNote: z
    .string()
    .trim()
    .max(1000, "La nota de disponibilidad no puede superar 1000 caracteres."),
  availabilitySchedule: z
    .string()
    .trim()
    .max(4000, "Los horarios no pueden superar 4000 caracteres."),
  bio: z
    .string()
    .trim()
    .max(800, "La biografia no puede superar 800 caracteres."),
  certifications: z
    .string()
    .trim()
    .max(4000, "Las certificaciones no pueden superar 4000 caracteres."),
  experience: z
    .string()
    .trim()
    .max(4000, "La experiencia no puede superar 4000 caracteres."),
  focusAreas: z
    .array(z.enum(professionalFocusAreaOptions))
    .max(8, "Selecciona hasta 8 areas de enfoque."),
  professionalLinks: z
    .string()
    .trim()
    .max(1000, "Los enlaces no pueden superar 1000 caracteres."),
  professionalPhone: z
    .string()
    .trim()
    .max(40, "El telefono profesional no puede superar 40 caracteres.")
    .refine(
      (value) => value === "" || /^[0-9+() .-]{5,40}$/.test(value),
      "Usa un formato de telefono valido.",
    ),
});

export type ProfessionalProfileValues = z.infer<
  typeof professionalProfileSchema
>;

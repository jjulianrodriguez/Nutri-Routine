import { z } from "zod";

export const genderOptions = [
 "male",
 "female",
 "non_binary",
 "prefer_not_to_say",
 "self_described",
] as const;

function getTodayDateKey() {
 const today = new Date();
 const month = String(today.getMonth() + 1).padStart(2, "0");
 const day = String(today.getDate()).padStart(2, "0");

 return `${today.getFullYear()}-${month}-${day}`;
}

function isCalendarDate(value: string) {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
 return false;
 }

 const [year, month, day] = value.split("-").map(Number);
 const date = new Date(Date.UTC(year, month - 1, day));

 return (
 date.getUTCFullYear() === year &&
 date.getUTCMonth() === month - 1 &&
 date.getUTCDate() === day
 );
}

function optionalPositiveNumber(label: string, maximum: number) {
 return z
 .string()
 .trim()
 .refine(
 (value) => value === "" || /^\d+([.,]\d{1,2})?$/.test(value),
 `${label} debe ser un número válido.`,
 )
 .refine(
 (value) =>
 value === "" ||
 (Number(value.replace(",", ".")) > 0 &&
 Number(value.replace(",", ".")) <= maximum),
 `${label} debe ser mayor que cero y no superar ${maximum}.`,
 );
}

export const personalDetailsSchema = z
 .object({
 allergies: z
 .string()
 .trim()
 .max(4000, "Las alergias no pueden superar 4000 caracteres."),
 birthDate: z
 .string()
 .trim()
 .refine(
 (value) => value === "" || isCalendarDate(value),
 "Selecciona una fecha válida.",
 )
 .refine(
 (value) => value === "" || value <= getTodayDateKey(),
 "La fecha de nacimiento no puede estar en el futuro.",
 ),
 bodyFatPercentage: optionalPositiveNumber("El porcentaje de grasa", 100),
 bodyMeasurements: z
 .string()
 .trim()
 .max(4000, "Las medidas fisicas no pueden superar 4000 caracteres."),
 dietaryRestrictions: z
 .string()
 .trim()
 .max(
 4000,
 "Las restricciones alimentarias no pueden superar 4000 caracteres.",
 ),
 gender: z.union([z.literal(""), z.enum(genderOptions)]),
 genderDescription: z
 .string()
 .trim()
 .max(120, "La autodescripción no puede superar 120 caracteres."),
 heightCm: optionalPositiveNumber("La altura", 300),
 importantMedications: z
 .string()
 .trim()
 .max(4000, "Los medicamentos no pueden superar 4000 caracteres."),
 injuries: z
 .string()
 .trim()
 .max(4000, "Las lesiones no pueden superar 4000 caracteres."),
 medicalConditions: z
 .string()
 .trim()
 .max(
 4000,
 "Las condiciones medicas no pueden superar 4000 caracteres.",
 ),
 phone: z
 .string()
 .trim()
 .max(40, "El teléfono no puede superar 40 caracteres.")
 .refine(
 (value) => value === "" || /^[0-9+() .-]{5,40}$/.test(value),
 "Usa un formato de teléfono válido.",
 ),
 professionalNotes: z
 .string()
 .trim()
 .max(4000, "Las notas importantes no pueden superar 4000 caracteres."),
 weightKg: optionalPositiveNumber("El peso", 1000),
 })
 .superRefine((values, context) => {
 if (
 values.gender === "self_described" &&
 values.genderDescription.length === 0
 ) {
 context.addIssue({
 code: z.ZodIssueCode.custom,
 message: "Escribe como deseas describir tu genero.",
 path: ["genderDescription"],
 });
 }
 });

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

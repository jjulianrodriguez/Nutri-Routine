import { z } from "zod";

import {
  CALENDAR_AREAS,
  CALENDAR_EVENT_TYPES,
  CALENDAR_STATUSES,
} from "@/lib/calendar/constants";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidDateKey(value: string) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function toLocalDateTime(dateKey: string, time: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

export const calendarEventValuesSchema = z
  .object({
    area: z.enum(CALENDAR_AREAS),
    clientId: z.string().uuid("Selecciona un cliente válido."),
    date: z
      .string()
      .trim()
      .refine(isValidDateKey, "Selecciona una fecha válida."),
    description: z
      .string()
      .trim()
      .max(2000, "La descripción no puede superar 2000 caracteres."),
    endTime: z
      .string()
      .trim()
      .refine((value) => value === "" || TIME_PATTERN.test(value), {
        message: "Selecciona una hora final válida.",
      }),
    eventType: z.enum(CALENDAR_EVENT_TYPES),
    professionalId: z
      .string()
      .trim()
      .refine((value) => value === "" || z.string().uuid().safeParse(value).success, {
        message: "Selecciona un profesional válido.",
      }),
    startTime: z
      .string()
      .trim()
      .regex(TIME_PATTERN, "Selecciona una hora válida."),
    status: z.enum(CALENDAR_STATUSES),
    title: z
      .string()
      .trim()
      .min(1, "Escribe un titulo.")
      .max(180, "El titulo no puede superar 180 caracteres."),
  })
  .superRefine((values, context) => {
    if (!values.endTime) {
      return;
    }

    const startsAt = toLocalDateTime(values.date, values.startTime);
    const endsAt = toLocalDateTime(values.date, values.endTime);

    if (endsAt <= startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La hora final debe ser posterior a la hora inicial.",
        path: ["endTime"],
      });
    }
  });

export const calendarUpdateValuesSchema = calendarEventValuesSchema.and(
  z.object({
    id: z.string().uuid("El evento seleccionado no es válido."),
  }),
);

export const calendarDeleteSchema = z.object({
  id: z.string().uuid("El evento seleccionado no es válido."),
});

export type CalendarEventValues = z.infer<typeof calendarEventValuesSchema>;
export type CalendarUpdateValues = z.infer<typeof calendarUpdateValuesSchema>;

export function combineLocalDateTime(dateKey: string, time: string) {
  return toLocalDateTime(dateKey, time);
}

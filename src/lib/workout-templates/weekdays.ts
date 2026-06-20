export const WORKOUT_WEEKDAYS = [
  { label: "Lunes", value: "monday" },
  { label: "Martes", value: "tuesday" },
  { label: "Miércoles", value: "wednesday" },
  { label: "Jueves", value: "thursday" },
  { label: "Viernes", value: "friday" },
  { label: "Sábado", value: "saturday" },
  { label: "Domingo", value: "sunday" },
] as const;

export const WORKOUT_WEEKDAY_VALUES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WorkoutWeekday = (typeof WORKOUT_WEEKDAY_VALUES)[number];

export function parseWorkoutWeekday(value: string | null | undefined) {
  return WORKOUT_WEEKDAY_VALUES.find((weekday) => weekday === value) ?? null;
}

export function getWorkoutWeekdayLabel(
  weekday: WorkoutWeekday | null | undefined,
) {
  return (
    WORKOUT_WEEKDAYS.find((option) => option.value === weekday)?.label ?? null
  );
}

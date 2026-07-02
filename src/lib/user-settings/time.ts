import type { TimeFormatPreference } from "@/lib/user-settings/types";

export const APP_TIME_ZONE = "America/Costa_Rica";

export function usesTwelveHourClock(timeFormat: TimeFormatPreference) {
 return timeFormat === "12h";
}

export function formatAppDateTime(
 value: string,
 timeFormat: TimeFormatPreference,
) {
 return new Intl.DateTimeFormat("es-CR", {
 dateStyle: "medium",
 hour12: usesTwelveHourClock(timeFormat),
 timeStyle: "short",
 timeZone: APP_TIME_ZONE,
 }).format(new Date(value));
}

export function formatAppTime(
 value: Date | string,
 timeFormat: TimeFormatPreference,
) {
 return new Intl.DateTimeFormat("es-CR", {
 hour: "2-digit",
 hour12: usesTwelveHourClock(timeFormat),
 minute: "2-digit",
 timeZone: APP_TIME_ZONE,
 }).format(new Date(value));
}

export function formatTimeInputLabel(
 value: string | null,
 timeFormat: TimeFormatPreference,
) {
 if (!value) {
 return null;
 }

 const [hour = "0", minute = "0"] = value.split(":");
 const hourNumber = ((Number(hour) % 24) + 24) % 24;
 const minuteLabel = String(Number(minute)).padStart(2, "0");

 if (timeFormat === "24h") {
 return `${String(hourNumber).padStart(2, "0")}:${minuteLabel}`;
 }

 const hourLabel = hourNumber % 12 || 12;
 const period = hourNumber < 12 ? "a. m." : "p. m.";

 return `${hourLabel}:${minuteLabel} ${period}`;
}

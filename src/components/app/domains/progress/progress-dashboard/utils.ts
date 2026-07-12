import type { ProgressEntrySummary, ProgressTab } from "@/lib/progress/data";
import type { WorkoutDayProgressSummary } from "@/types/routine";

export type ProgressMeasurementKind = "bodyFat" | "weight";

export function formatDate(value: string | null | undefined) {
 if (!value) {
 return "Sin fecha";
 }

 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 }).format(new Date(value));
}

export function formatShortDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 }).format(new Date(value));
}

export function formatValue(value: number | null | undefined, unit?: string | null) {
 if (value === null || value === undefined) {
 return "Sin dato";
 }

 return `${Number(value.toFixed(1))}${unit ? ` ${unit}` : ""}`;
}

function classifyMetric(metricType: string) {
 const normalized = metricType
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .toLowerCase();

 if (normalized.includes("peso") || normalized.includes("weight")) {
 return "weight";
 }

 if (
 normalized.includes("grasa") ||
 normalized.includes("body fat") ||
 normalized.includes("fat")
 ) {
 return "bodyFat";
 }

 return "other";
}

export function getMetricSeries(
 entries: ProgressEntrySummary[],
 kind: ProgressMeasurementKind,
) {
 return entries
 .filter((entry) => classifyMetric(entry.metric_type) === kind)
 .filter((entry) => entry.metric_value !== null)
 .map((entry) => ({
 date: entry.recorded_at,
 label: formatShortDate(entry.recorded_at),
 value: entry.metric_value ?? 0,
 }))
 .reverse();
}

export function getLatestByKind(
 entries: ProgressEntrySummary[],
 kind: ProgressMeasurementKind,
) {
 return entries.find((entry) => classifyMetric(entry.metric_type) === kind);
}

export function getPreviousByKind(
 entries: ProgressEntrySummary[],
 kind: ProgressMeasurementKind,
) {
 return entries.filter((entry) => classifyMetric(entry.metric_type) === kind)[1];
}

export function getWorkoutStats(progress: WorkoutDayProgressSummary[]) {
 const completed = progress.filter((item) => item.completedAt);
 const now = new Date();
 const weekStart = new Date(now);
 weekStart.setDate(now.getDate() - 6);
 weekStart.setHours(0, 0, 0, 0);
 const monthStart = new Date(now);
 monthStart.setDate(now.getDate() - 29);
 monthStart.setHours(0, 0, 0, 0);

 return {
 completed,
 monthly: completed.filter((item) => new Date(item.workoutDate) >= monthStart)
 .length,
 weekly: completed.filter((item) => new Date(item.workoutDate) >= weekStart)
 .length,
 };
}

export function getTrainingHistory(progress: WorkoutDayProgressSummary[]) {
 const ranges = Array.from({ length: 6 }, (_, index) => {
 const end = new Date();
 end.setDate(end.getDate() - 7 * (5 - index));
 const start = new Date(end);
 start.setDate(end.getDate() - 6);

 return {
 end,
 label: formatShortDate(end.toISOString()),
 start,
 };
 });
 const completed = progress.filter((item) => item.completedAt);

 return ranges.map((range) => ({
 label: range.label,
 value: completed.filter((item) => {
 const date = new Date(item.workoutDate);
 return date >= range.start && date <= range.end;
 }).length,
 }));
}

export function hrefForTab(tab: ProgressTab, clientId?: string | null) {
 const params = new URLSearchParams({ tab });

 if (clientId) {
 params.set("client", clientId);
 }

 return `/app/progreso?${params.toString()}`;
}
import type { HabitAssignmentSummary } from "@/lib/habits/utils";

import { weekdayOptions } from "./constants";
import type { CompletionOverrides } from "./types";

export function formatDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 dateStyle: "medium",
 timeZone: "America/Costa_Rica",
 }).format(new Date(`${value}T12:00:00`));
}

export function formatAssignmentDays(daysOfWeek: number[]) {
 return daysOfWeek
 .map((day) => weekdayOptions.find((item) => item.value === day)?.label)
 .filter(Boolean)
 .join(", ");
}

export function completionKey(assignmentId: string, date: string) {
 return `${assignmentId}:${date}`;
}

export function getCompletion(
 assignment: HabitAssignmentSummary,
 date: string,
 overrides: CompletionOverrides,
) {
 const key = completionKey(assignment.id, date);

 if (key in overrides) {
 return overrides[key];
 }

 return assignment.progressByDate[date]?.completed ?? false;
}


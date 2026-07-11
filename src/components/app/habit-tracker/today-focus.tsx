"use client";

import { CalendarCheck2 } from "lucide-react";

import {
 isAssignmentApplicableOnDate,
 type HabitAssignmentSummary,
} from "@/lib/habits/utils";

import type { CompletionOverrides } from "./types";
import { getCompletion } from "./utils";

export function TodayFocus({
 assignments,
 overrides,
 today,
}: {
 assignments: HabitAssignmentSummary[];
 overrides: CompletionOverrides;
 today: string;
}) {
 const todayAssignments = assignments.filter((assignment) =>
 isAssignmentApplicableOnDate(assignment, today),
 );
 const pendingToday = todayAssignments.filter(
 (assignment) => !getCompletion(assignment, today, overrides),
 );

 if (assignments.length === 0) {
 return null;
 }

 if (todayAssignments.length === 0) {
 return (
 <div className="h-fit self-start rounded-[22px] bg-surface p-5 text-sm font-semibold text-muted ">
 <p className="font-extrabold text-foreground">Hoy no tienes hábitos programados.</p>
 <p className="mt-1">Tu tracker semanal queda disponible para revisar otros días.</p>
 </div>
 );
 }

 return (
 <div className="h-fit self-start rounded-[22px] bg-surface p-5 ">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex min-w-0 items-start gap-3">
 <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary-soft text-muted-foreground">
 <CalendarCheck2 className="size-5" aria-hidden="true" />
 </span>
 <div>
 <p className="font-extrabold text-foreground">
 {pendingToday.length === 0
 ? "Hoy está completo."
 : `Faltan ${pendingToday.length} de ${todayAssignments.length} hábitos de hoy.`}
 </p>
 <p className="mt-1 text-sm leading-6 text-muted">
 {pendingToday.length === 0
 ? "Puedes revisar la semana o ajustar una marca si lo necesitas."
 : "Marca cada hábito cuando lo completes."}
 </p>
 </div>
 </div>
 <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-muted-foreground">
 Hoy
 </span>
 </div>

 {pendingToday.length > 0 ? (
 <div className="mt-4 grid items-start gap-2 sm:grid-cols-2">
 {pendingToday.map((assignment) => (
 <div
 key={assignment.id}
 className="h-fit self-start rounded-[16px] bg-background px-4 py-3"
 >
 <p className="font-extrabold text-foreground">
 {assignment.habit.title}
 </p>
 {assignment.habit.description ? (
 <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
 {assignment.habit.description}
 </p>
 ) : null}
 </div>
 ))}
 </div>
 ) : null}
 </div>
 );
}


"use client";

import { CheckCircle2, Circle } from "lucide-react";

import {
 isAssignmentApplicableOnDate,
 type HabitAssignmentSummary,
} from "@/lib/habits/utils";
import { cn } from "@/lib/utils";

export function HabitDayToggle({
 assignment,
 canToggle,
 completed,
 date,
 disabled,
 isToday,
 onToggle,
}: {
 assignment: HabitAssignmentSummary;
 canToggle: boolean;
 completed: boolean;
 date: string;
 disabled: boolean;
 isToday: boolean;
 onToggle: (assignmentId: string, date: string, completed: boolean) => void;
}) {
 const applicable = isAssignmentApplicableOnDate(assignment, date);

 if (!applicable) {
 return (
 <span className="inline-flex min-h-11 w-full items-center justify-center rounded-[14px] bg-background text-xs font-bold text-muted">
 No aplica
 </span>
 );
 }

 const buttonDisabled = disabled || !canToggle;
 const disabledTitle = disabled
 ? "Guardando tu cambio."
 : canToggle
 ? undefined
 : "Solo la clienta puede marcar hoy o días anteriores de esta semana.";

 return (
 <button
 type="button"
 disabled={buttonDisabled}
 aria-pressed={completed}
 onClick={() => onToggle(assignment.id, date, !completed)}
 title={disabledTitle}
 className={cn(
 "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] px-3 py-2 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed",
 completed
 ? "border-primary/50 bg-primary text-primary-foreground "
 : " bg-surface text-muted-foreground hover:border-primary/35 hover:bg-primary-soft",
 !canToggle && "opacity-70",
 isToday && "ring-2 ring-primary/25",
 )}
 >
 {completed ? (
 <CheckCircle2 className="size-4" aria-hidden="true" />
 ) : (
 <Circle className="size-4" aria-hidden="true" />
 )}
 <span className="sr-only">
 {completed ? "Completado" : "Pendiente"}
 </span>
 </button>
 );
}

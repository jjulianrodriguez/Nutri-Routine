"use client";

import {
 Check,
 CheckCircle2,
 Circle,
 Info,
 Loader2,
 Power,
 RotateCcw,
} from "lucide-react";

import { CardActionsMenu } from "@/components/app/shared/card-actions-menu";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import type { HabitAssignmentSummary } from "@/lib/habits/utils";
import { cn } from "@/lib/utils";

import { weekdayOptions } from "./constants";
import type { HabitAssignmentConfirmation } from "./types";
import { formatAssignmentDays, formatDate } from "./utils";

export function HabitAssignmentList({
 assignments,
 isPending,
 onConfirm,
}: {
 assignments: HabitAssignmentSummary[];
 isPending: boolean;
 onConfirm: (confirmation: HabitAssignmentConfirmation) => void;
}) {
 return (
 <div className="space-y-3" aria-busy={isPending}>
 {isPending ? (
 <div className="flex items-center gap-2 rounded-[18px] border-primary/25 bg-primary-tint px-4 py-3 text-sm font-extrabold text-foreground">
 <Loader2 className="size-4 animate-spin" aria-hidden="true" />
 Guardando asignación...
 </div>
 ) : null}
 {assignments.length === 0 ? (
 <Alert className="rounded-[22px] border-primary/35 bg-primary-tint/70 p-5">
 <AlertDescription className="flex items-start gap-3 font-semibold text-foreground">
 <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-surface text-muted-foreground">
 <Check className="size-5" aria-hidden="true" />
 </span>
 <span>
 <span className="block font-extrabold">Sin asignaciones activas para esta clienta.</span>
 <span className="mt-1 block text-sm leading-6 text-muted">
 Elige un hábito, define los días aplicables y guarda la asignación.
 </span>
 </span>
 </AlertDescription>
 </Alert>
 ) : (
 assignments.map((assignment) => {
 const isInactive = !assignment.active;
 const selectedDays = weekdayOptions.filter((day) =>
 assignment.daysOfWeek.includes(day.value),
 );
 return (
 <article
 key={assignment.id}
 className={cn(
 "h-fit self-start rounded-[22px] bg-background p-4 transition hover:border-primary/30 sm:p-5",
 isInactive && "bg-surface/65",
 )}
 >
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-start gap-2">
 <h4 className="min-w-0 max-w-full truncate text-lg font-extrabold leading-tight text-foreground">
 {assignment.habit.title}
 </h4>
 <span
 className={cn(
 "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
 assignment.active
 ? "bg-primary-soft text-foreground"
 : "bg-muted-surface/15 text-muted",
 )}
 >
 {assignment.active ? (
 <CheckCircle2 className="size-3.5" aria-hidden="true" />
 ) : (
 <Circle className="size-3.5" aria-hidden="true" />
 )}
 {assignment.active ? "Activo" : "Inactivo"}
 </span>
 </div>
 {assignment.habit.description ? (
 <p className="mt-2 text-sm leading-6 text-muted">
 {assignment.habit.description}
 </p>
 ) : null}
 <div className="mt-4 grid items-start gap-3 lg:grid-cols-[1fr_0.9fr]">
 <div className="h-fit self-start rounded-[16px] bg-surface p-3">
 <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
 Frecuencia/días
 </p>
 <div
 className="mt-2 flex flex-wrap gap-1.5"
 title={formatAssignmentDays(assignment.daysOfWeek)}
 >
 {selectedDays.map((day) => (
 <span
 key={day.value}
 className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-extrabold text-foreground"
 >
 {day.label}
 </span>
 ))}
 </div>
 </div>
 <div className="h-fit self-start rounded-[16px] bg-surface p-3">
 <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.12em] text-muted">
 Vigencia
 </p>
 <p className="mt-2 text-sm font-bold leading-5 text-foreground">
 Desde {formatDate(assignment.startDate)}
 </p>
 <p className="text-sm font-semibold leading-5 text-muted-foreground">
 {assignment.endDate
 ? `Hasta ${formatDate(assignment.endDate)}`
 : "Sin fecha final"}
 </p>
 </div>
 </div>
 <p className="mt-3 flex items-start gap-2 text-sm leading-5 text-muted">
 <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
 <span>
 Aparecerá en el tracker de la clienta solo durante estos días y vigencia.
 </span>
 </p>
 </div>
 <div className="flex shrink-0 items-center justify-end">
 <CardActionsMenu
 label={assignment.habit.title}
 items={[
 assignment.active
 ? {
 destructive: true,
 icon: Power,
 label: "Desactivar",
 onSelect: () => onConfirm({ assignment, type: "deactivate" }),
 }
 : {
 icon: RotateCcw,
 label: "Activar",
 onSelect: () => onConfirm({ assignment, type: "activate" }),
 },
 ]}
 />
 </div>
 </div>
 </article>
 );
 })
 )}
 </div>
 );
}

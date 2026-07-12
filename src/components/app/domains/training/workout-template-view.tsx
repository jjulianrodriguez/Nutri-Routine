"use client";

import {
 AlertTriangle,
 CalendarDays,
 CheckCircle2,
 Clock3,
 Dumbbell,
 History,
 Layers3,
 ListChecks,
 Play,
 UserRound,
 type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { GroupedRoutineExercises } from "@/components/app/domains/training/grouped-routine-exercises";
import { WorkoutExerciseCard } from "@/components/app/domains/training/workout-exercise-card";
import { WorkoutSummaryCard } from "@/components/app/domains/training/workout-summary-card";
import { Button } from "@/components/ui/actions/button";
import { EmptyState } from "@/components/ui/feedback/state-block";
import { cn } from "@/lib/utils";
import { getWorkoutWeekdayLabel } from "@/lib/workout-templates/weekdays";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

export type TemplateStatusTone =
 | "active"
 | "inactive"
 | "neutral"
 | "warning";

export type WorkoutTemplateViewer = "client" | "professional";

export type WorkoutTemplateMetaItem = {
 kind: "calendar" | "clock" | "dumbbell" | "history" | "layers" | "status" | "user";
 label: string;
 value: string;
};

type WorkoutTemplateProgress = {
 completedAt: string | null;
 completedExerciseIds: string[];
 disabled?: boolean;
 isPending?: boolean;
 onToggle?: (exerciseId: string, completed: boolean) => void;
 pendingExerciseId?: string | null;
};

type StartExpanded = "all" | "current" | "none";

type WorkoutTemplateViewProps = {
 assignedDayCount?: number;
 currentDayNumber?: number | null;
 description?: string | null;
 emptyMessage?: string;
 focusCurrentDayFirst?: boolean;
 headline?: string;
 identifier?: string | null;
 metaItems?: WorkoutTemplateMetaItem[];
 missingDayCount?: number;
 progress?: WorkoutTemplateProgress;
 routineHrefBase?: string | null;
 routineHrefs?: Record<string, string>;
 showPrimaryActions?: boolean;
 snapshot: WorkoutTemplateSnapshot;
 startExpanded?: StartExpanded;
 statusLabel?: string | null;
 statusTone?: TemplateStatusTone;
 topNote?: string | null;
 viewer: WorkoutTemplateViewer;
};

const metaIcons: Record<WorkoutTemplateMetaItem["kind"], LucideIcon> = {
 calendar: CalendarDays,
 clock: Clock3,
 dumbbell: Dumbbell,
 history: History,
 layers: Layers3,
 status: CheckCircle2,
 user: UserRound,
};

function getStatusClasses(tone: TemplateStatusTone) {
 if (tone === "active") {
 return "bg-primary text-primary-foreground";
 }

 if (tone === "inactive") {
 return "bg-surface-muted text-foreground";
 }

 if (tone === "warning") {
 return "bg-danger/10 text-danger";
 }

 return "bg-surface text-foreground";
}

function getDayLabel(dayNumber: number, currentDayNumber?: number | null) {
 if (!currentDayNumber) {
 return "Dia del ciclo";
 }

 if (dayNumber === currentDayNumber) {
 return "Entrenamiento de hoy";
 }

 if (dayNumber > currentDayNumber) {
 return "Proximo entrenamiento";
 }

 return "Dia anterior";
}

function getInitialExpandedDays(
 days: WorkoutTemplateSnapshot["days"],
 currentDayNumber: number | null | undefined,
 startExpanded: StartExpanded,
) {
 if (startExpanded === "all") {
 return new Set(days.map((day) => day.dayNumber));
 }

 if (startExpanded === "none") {
 return new Set<number>();
 }

 const currentDay = days.find((day) => day.dayNumber === currentDayNumber);
 const fallbackDay = days[0] ?? null;

 return new Set(currentDay ? [currentDay.dayNumber] : fallbackDay ? [fallbackDay.dayNumber] : []);
}

function SummaryStat({ item }: { item: WorkoutTemplateMetaItem }) {
 const Icon = metaIcons[item.kind];

 return (
 <div className="rounded-[20px] bg-surface p-4 ">
 <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
 <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
 {item.label}
 </p>
 <p className="mt-1 break-words text-lg font-black leading-6 text-foreground">
 {item.value}
 </p>
 </div>
 );
}

export function WorkoutTemplateView({
 assignedDayCount,
 currentDayNumber,
 description,
 emptyMessage = "Esta plantilla no tiene días configurados.",
 focusCurrentDayFirst = false,
 headline,
 identifier,
 metaItems = [],
 missingDayCount = 0,
 progress,
 routineHrefBase,
 routineHrefs,
 showPrimaryActions = false,
 snapshot,
 startExpanded = currentDayNumber ? "current" : "all",
 statusLabel,
 statusTone = "neutral",
 topNote,
 viewer,
}: WorkoutTemplateViewProps) {
 const sortedDays = useMemo(
 () => [...snapshot.days].sort((left, right) => left.dayNumber - right.dayNumber),
 [snapshot.days],
 );
 const orderedDays = useMemo(() => {
 if (!focusCurrentDayFirst || !currentDayNumber) {
 return sortedDays;
 }

 const currentDay = sortedDays.find(
 (day) => day.dayNumber === currentDayNumber,
 );

 return currentDay
 ? [
 currentDay,
 ...sortedDays.filter((day) => day.dayNumber !== currentDay.dayNumber),
 ]
 : sortedDays;
 }, [currentDayNumber, focusCurrentDayFirst, sortedDays]);
 const firstDay = orderedDays[0] ?? null;
 const [expandedDays, setExpandedDays] = useState<Set<number>>(() =>
 getInitialExpandedDays(orderedDays, currentDayNumber, startExpanded),
 );
 const allDaysExpanded =
 orderedDays.length > 0 &&
 orderedDays.every((day) => expandedDays.has(day.dayNumber));
 const usedFallbackDay =
 Boolean(currentDayNumber) &&
 Boolean(firstDay) &&
 firstDay?.dayNumber !== currentDayNumber &&
 focusCurrentDayFirst;
 const totalExercises =
 firstDay?.routine.exercises.map((item) => item.id) ?? [];
 const completedCount =
 progress?.completedExerciseIds.filter((exerciseId) =>
 totalExercises.includes(exerciseId),
 ).length ?? 0;
 const pendingCount = Math.max(totalExercises.length - completedCount, 0);
 const progressPercent =
 totalExercises.length > 0
 ? Math.round((completedCount / totalExercises.length) * 100)
 : 0;
 const isComplete =
 totalExercises.length > 0 && completedCount === totalExercises.length;
 const resolvedHeadline =
 headline ??
 (firstDay && currentDayNumber
 ? `Hoy te toca: Dia ${firstDay.dayNumber} - ${firstDay.routine.name}`
 : snapshot.template.name);
 const resolvedDescription =
 description ??
 snapshot.template.description ??
 "Ciclo de entrenamiento sin descripción adicional.";
 const resolvedAssignedDayCount = assignedDayCount ?? snapshot.days.length;
 const summaryItems: WorkoutTemplateMetaItem[] = [
 {
 kind: "calendar",
 label: "Dias del ciclo",
 value: String(snapshot.template.cycleDays),
 },
 {
 kind: "dumbbell",
 label: "Entrenamientos",
 value: String(snapshot.days.length),
 },
 statusLabel
 ? {
 kind: "status",
 label: "Estado",
 value: statusLabel,
 }
 : null,
 ...metaItems,
 ].filter(Boolean) as WorkoutTemplateMetaItem[];

 function toggleFullTemplate() {
 setExpandedDays(() => {
 if (allDaysExpanded) {
 return getInitialExpandedDays(orderedDays, currentDayNumber, "current");
 }

 return new Set(orderedDays.map((day) => day.dayNumber));
 });
 }

 function toggleDay(dayNumber: number) {
 setExpandedDays((current) => {
 const next = new Set(current);

 if (next.has(dayNumber)) {
 next.delete(dayNumber);
 } else {
 next.add(dayNumber);
 }

 return next;
 });
 }

 if (!firstDay) {
 return (
 <section className="rounded-[28px] bg-surface p-6 ">
 <EmptyState>{emptyMessage}</EmptyState>
 </section>
 );
 }

 return (
 <section className="space-y-5" aria-labelledby="workout-template-heading">
 <article
 className={cn(
 "overflow-hidden rounded-[32px] p-6 sm:p-7",
 statusTone === "warning"
 ? "border-danger/25 bg-danger/5"
 : "border-primary/30 bg-primary-soft/70",
 )}
 >
 <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-2">
 <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-extrabold text-foreground">
 <Layers3 className="size-3.5" aria-hidden="true" />
 Plantilla
 </span>
 {statusLabel ? (
 <span
 className={cn(
 "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold",
 getStatusClasses(statusTone),
 )}
 >
 {statusTone === "warning" ? (
 <AlertTriangle className="size-3.5" aria-hidden="true" />
 ) : (
 <CheckCircle2 className="size-3.5" aria-hidden="true" />
 )}
 {statusLabel}
 </span>
 ) : null}
 <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-extrabold text-muted-foreground">
 {resolvedAssignedDayCount} de {snapshot.template.cycleDays}{" "}
 {snapshot.template.cycleDays === 1 ? "día" : "días"}
 </span>
 {identifier && viewer === "professional" ? (
 <span className="max-w-full truncate rounded-full bg-background px-3 py-1 text-xs font-extrabold text-muted-foreground">
 ID: {identifier}
 </span>
 ) : null}
 {missingDayCount > 0 ? (
 <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-extrabold text-danger">
 Incompleta: {missingDayCount}{" "}
 {missingDayCount === 1 ? "día pendiente" : "días pendientes"}
 </span>
 ) : null}
 </div>

 <h2
 id="workout-template-heading"
 className="mt-5 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl"
 >
 {resolvedHeadline}
 </h2>
 <p className="mt-4 max-w-3xl text-sm leading-6 text-muted sm:text-base">
 {resolvedDescription}
 </p>

 {topNote ? (
 <p className="mt-3 rounded-[18px] border-secondary/20 bg-surface px-4 py-3 text-sm font-semibold leading-6 text-muted-foreground">
 {topNote}
 </p>
 ) : null}

 {usedFallbackDay ? (
 <p className="mt-3 rounded-[18px] border-secondary/20 bg-surface px-4 py-3 text-sm font-semibold leading-6 text-muted-foreground">
 No encontramos el día calculado en la plantilla, así que te
 mostramos el primer entrenamiento disponible. Consulta a tu
 entrenador si algo no coincide.
 </p>
 ) : null}

 {showPrimaryActions ? (
 <div className="mt-6 flex flex-wrap gap-3">
 <Button asChild size="lg">
 <a
 href={
 firstDay.dayNumber === currentDayNumber
 ? "#entrenamiento-de-hoy"
 : `#entrenamiento-dia-${firstDay.dayNumber}`
 }
 >
 <Play aria-hidden="true" />
 {progress?.disabled
 ? "Ver entrenamiento de hoy"
 : "Empezar entrenamiento de hoy"}
 </a>
 </Button>
 <Button
 type="button"
 variant="outline"
 size="lg"
 onClick={toggleFullTemplate}
 >
 <ListChecks aria-hidden="true" />
 {allDaysExpanded
 ? "Contraer plantilla"
 : "Ver plantilla completa"}
 </Button>
 </div>
 ) : null}
 </div>

 <div className="rounded-[24px] bg-surface p-5">
 {progress ? (
 <>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Avance de hoy
 </p>
 <div className="mt-4 flex items-end justify-between gap-4">
 <p className="font-serif text-5xl font-semibold leading-none text-foreground">
 {progressPercent}%
 </p>
 <p className="pb-1 text-right text-sm font-extrabold text-muted-foreground">
 {completedCount}/{totalExercises.length} ejercicios
 </p>
 </div>
 <div className="mt-4 h-3 overflow-hidden rounded-full bg-background">
 <div
 className="h-full rounded-full bg-primary transition-[width]"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 <p className="mt-4 text-sm font-semibold leading-6 text-muted">
 {isComplete
 ? "Listo. Completaste todos los ejercicios de hoy."
 : `${pendingCount} ${
 pendingCount === 1
 ? "ejercicio pendiente"
 : "ejercicios pendientes"
 }.`}
 </p>
 {progress.completedAt ? (
 <p className="mt-3 rounded-[16px] bg-primary-soft px-4 py-3 text-sm font-extrabold text-foreground">
 Entrenamiento completado.
 </p>
 ) : null}
 </>
 ) : (
 <>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Vista de ciclo
 </p>
 <p className="mt-3 text-3xl font-black text-foreground">
 {snapshot.template.cycleDays} días
 </p>
 <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
 {resolvedAssignedDayCount} de {snapshot.template.cycleDays}{" "}
 {snapshot.template.cycleDays === 1
 ? "día completo"
 : "días completos"}
 </p>
 </>
 )}
 </div>
 </div>

 <div className="mt-6 border-t border-border/70 pt-5">
 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 {summaryItems.map((item) => (
 <SummaryStat key={`${item.label}-${item.value}`} item={item} />
 ))}
 </section>
 </div>
 </article>

 <div>
 <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Dias del ciclo
 </p>
 <h3 className="mt-1 text-2xl font-semibold text-foreground">
 Entrenamientos por día
 </h3>
 </div>
 <p className="text-sm font-semibold text-muted">
 Abre cada día para revisar ejercicios, instrucciones y materiales.
 </p>
 </div>

 <div className="space-y-4">
 {orderedDays.map((day) => (
 <WorkoutTemplateDaySection
 key={`${day.dayNumber}-${day.routine.id}`}
 currentDayNumber={currentDayNumber}
 day={day}
 expanded={expandedDays.has(day.dayNumber)}
 onToggle={toggleDay}
 progress={progress}
 routineHref={
 routineHrefs?.[day.routine.id] ??
 (routineHrefBase
 ? `${routineHrefBase}/${day.routine.id}`
 : null)
 }
 />
 ))}
 </div>
 </div>
 </section>
 );
}

function WorkoutTemplateDaySection({
 currentDayNumber,
 day,
 expanded,
 onToggle,
 progress,
 routineHref,
}: {
 currentDayNumber?: number | null;
 day: WorkoutTemplateSnapshot["days"][number];
 expanded: boolean;
 onToggle: (dayNumber: number) => void;
 progress?: WorkoutTemplateProgress;
 routineHref?: string | null;
}) {
 const isCurrent = currentDayNumber === day.dayNumber;
 const weekdayLabel = getWorkoutWeekdayLabel(day.weekday);
 const summary =
 day.routine.description?.trim() ||
 `${day.routine.category} para ${day.routine.targetAudience}.`;

 return (
 <WorkoutSummaryCard
 id={isCurrent ? "entrenamiento-de-hoy" : `entrenamiento-dia-${day.dayNumber}`}
 category={day.routine.category}
 currentLabel={isCurrent ? "Hoy en el ciclo" : null}
 dayNumber={day.dayNumber}
 description={summary}
 difficulty={day.routine.difficulty}
 exerciseCount={day.routine.exercises.length}
 expanded={expanded}
 eyebrow={getDayLabel(day.dayNumber, currentDayNumber)}
 isCurrent={isCurrent}
 onToggle={() => onToggle(day.dayNumber)}
 title={day.routine.name}
 weekdayLabel={weekdayLabel}
 >
 {routineHref ? (
 <Button asChild variant="outline" className="mb-4">
 <Link href={routineHref}>Ver entrenamiento</Link>
 </Button>
 ) : null}
 {day.routine.exercises.length > 0 ? (
 <GroupedRoutineExercises
 exercises={day.routine.exercises}
 itemsClassName="space-y-3"
 renderExercise={(exercise, index) => (
 <WorkoutExerciseCard
 key={exercise.id}
 completed={
 progress?.completedExerciseIds.includes(exercise.id) ?? false
 }
 disabled={
 progress?.disabled ||
 progress?.isPending ||
 !isCurrent
 }
 exercise={exercise}
 isCurrent={isCurrent}
 onToggle={progress?.onToggle}
 order={index + 1}
 pending={progress?.pendingExerciseId === exercise.id}
 />
 )}
 />
 ) : (
 <div className="rounded-[20px] bg-background/70 p-5 text-sm font-semibold text-muted">
 Este día no tiene ejercicios disponibles.
 </div>
 )}
 </WorkoutSummaryCard>
 );
}

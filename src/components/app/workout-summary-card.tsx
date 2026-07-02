"use client";

import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Dumbbell,
  TriangleAlert,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type WorkoutSummaryMetaItem = {
  kind: "calendar" | "dumbbell" | "user";
  label: string;
};

export type WorkoutSummaryStatusTone =
  | "active"
  | "inactive"
  | "neutral"
  | "warning";

type WorkoutSummaryCardProps = {
  actions?: ReactNode;
  category?: string | null;
  children?: ReactNode;
  className?: string;
  currentLabel?: string | null;
  dayNumber?: number | null;
  description?: string | null;
  difficulty?: string | null;
  exerciseCount?: number | null;
  expanded?: boolean;
  eyebrow?: string | null;
  footerItems?: WorkoutSummaryMetaItem[];
  href?: string | null;
  id?: string;
  inactiveExerciseCount?: number;
  isCurrent?: boolean;
  onToggle?: () => void;
  statusLabel?: string | null;
  statusTone?: WorkoutSummaryStatusTone;
  targetAudience?: string | null;
  title: string;
  viewLabel?: string;
  weekdayLabel?: string | null;
};

const difficultyLabels: Record<string, string> = {
  advanced: "Avanzado",
  beginner: "Principiante",
  intermediate: "Intermedio",
};

const footerIcons: Record<WorkoutSummaryMetaItem["kind"], LucideIcon> = {
  calendar: CalendarClock,
  dumbbell: Dumbbell,
  user: UserRound,
};

function getDifficultyLabel(value: string | null | undefined) {
  return value ? (difficultyLabels[value] ?? value) : null;
}

function getStatusClasses(tone: WorkoutSummaryStatusTone) {
  if (tone === "active") {
    return "bg-primary text-charcoal";
  }

  if (tone === "inactive") {
    return "bg-stone-soft text-stone-hover";
  }

  if (tone === "warning") {
    return "bg-danger/10 text-danger";
  }

  return "bg-background text-warm-brown";
}

function FooterItem({ item }: { item: WorkoutSummaryMetaItem }) {
  const Icon = footerIcons[item.kind];

  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </span>
  );
}

function SummaryContent({
  category,
  currentLabel,
  dayNumber,
  description,
  difficulty,
  exerciseCount,
  eyebrow,
  href,
  inactiveExerciseCount,
  isCurrent,
  statusLabel,
  statusTone = "neutral",
  targetAudience,
  title,
  viewLabel,
  weekdayLabel,
}: Omit<
  WorkoutSummaryCardProps,
  "actions" | "children" | "className" | "expanded" | "footerItems" | "id" | "onToggle"
>) {
  const difficultyLabel = getDifficultyLabel(difficulty);
  const resolvedDescription =
    description?.trim() || "Sin descripción adicional.";

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap gap-2">
        {dayNumber ? (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold text-charcoal",
              isCurrent ? "bg-primary" : "bg-primary-soft",
            )}
          >
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Dia {dayNumber}
          </span>
        ) : null}

        {weekdayLabel ? (
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-warm-brown">
            {weekdayLabel}
          </span>
        ) : null}

        {currentLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-extrabold text-charcoal">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {currentLabel}
          </span>
        ) : null}

        {statusLabel ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold",
              getStatusClasses(statusTone),
            )}
          >
            {statusTone === "warning" ? (
              <TriangleAlert className="size-3.5" aria-hidden="true" />
            ) : null}
            {statusLabel}
          </span>
        ) : null}

        {inactiveExerciseCount && inactiveExerciseCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-3 py-1 text-xs font-extrabold text-danger">
            <TriangleAlert className="size-3.5" aria-hidden="true" />
            {inactiveExerciseCount}{" "}
            {inactiveExerciseCount === 1
              ? "ejercicio desactivado"
              : "ejercicios desactivados"}
          </span>
        ) : null}
      </div>

      {eyebrow ? (
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.14em] text-warm-brown">
          {eyebrow}
        </p>
      ) : null}

      <h3 className="mt-2 text-2xl font-semibold leading-tight text-charcoal">
        {title}
      </h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
        {resolvedDescription}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {difficultyLabel ? (
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-charcoal">
            {difficultyLabel}
          </span>
        ) : null}
        {category ? (
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-warm-brown">
            {category}
          </span>
        ) : null}
        {targetAudience ? (
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-warm-brown">
            {targetAudience}
          </span>
        ) : null}
        {typeof exerciseCount === "number" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-extrabold text-warm-brown">
            <Dumbbell className="size-3.5" aria-hidden="true" />
            {exerciseCount} {exerciseCount === 1 ? "ejercicio" : "ejercicios"}
          </span>
        ) : null}
      </div>

      {href ? (
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-warm-brown transition group-hover:text-charcoal">
          {viewLabel ?? "Ver detalle"}
          <ArrowRight className="size-4 transition group-hover:translate-x-1" />
        </span>
      ) : null}
    </div>
  );
}

export function WorkoutSummaryCard({
  actions,
  category,
  children,
  className,
  currentLabel,
  dayNumber,
  description,
  difficulty,
  exerciseCount,
  expanded,
  eyebrow,
  footerItems = [],
  href,
  id,
  inactiveExerciseCount,
  isCurrent = false,
  onToggle,
  statusLabel,
  statusTone = "neutral",
  targetAudience,
  title,
  viewLabel,
  weekdayLabel,
}: WorkoutSummaryCardProps) {
  const summary = (
    <SummaryContent
      category={category}
      currentLabel={currentLabel}
      dayNumber={dayNumber}
      description={description}
      difficulty={difficulty}
      exerciseCount={exerciseCount}
      eyebrow={eyebrow}
      href={href}
      inactiveExerciseCount={inactiveExerciseCount}
      isCurrent={isCurrent}
      statusLabel={statusLabel}
      statusTone={statusTone}
      targetAudience={targetAudience}
      title={title}
      viewLabel={viewLabel}
      weekdayLabel={weekdayLabel}
    />
  );

  return (
    <article
      id={id}
      className={cn(
        "h-fit self-start overflow-hidden rounded-[26px] border bg-surface shadow-soft",
        isCurrent ? "border-primary/45" : "border-border",
        className,
      )}
    >
      {onToggle ? (
        <button
          type="button"
          className="flex w-full items-start justify-between gap-4 p-5 text-left outline-none transition hover:bg-primary-soft/35 focus-visible:ring-3 focus-visible:ring-ring/35 sm:p-6"
          aria-expanded={expanded}
          onClick={onToggle}
        >
          {summary}
          <ChevronDown
            className={cn(
              "mt-1 size-5 shrink-0 text-warm-brown transition",
              expanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      ) : (
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
          {href ? (
            <Link href={href} className="group min-w-0 flex-1">
              {summary}
            </Link>
          ) : (
            <div className="min-w-0 flex-1">{summary}</div>
          )}
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}

      {children && expanded !== false ? (
        <div className="border-t border-border px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          {children}
        </div>
      ) : null}

      {footerItems.length > 0 ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 py-4 text-sm text-muted sm:px-6">
          {footerItems.map((item) => (
            <FooterItem key={`${item.kind}-${item.label}`} item={item} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

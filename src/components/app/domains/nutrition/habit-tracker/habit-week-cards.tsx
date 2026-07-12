"use client";

import {
 isHabitDateMarkable,
 type HabitAssignmentSummary,
 type HabitWeekDay,
} from "@/lib/habits/utils";
import { cn } from "@/lib/utils";

import { HabitDayToggle } from "./habit-day-toggle";
import type { CompletionOverrides } from "./types";
import { completionKey, getCompletion } from "./utils";

export function HabitWeekCards({
 assignments,
 isClient,
 isPending,
 onToggle,
 overrides,
 pendingKey,
 today,
 weekDays,
 weekStart,
}: {
 assignments: HabitAssignmentSummary[];
 isClient: boolean;
 isPending: boolean;
 onToggle: (assignmentId: string, date: string, completed: boolean) => void;
 overrides: CompletionOverrides;
 pendingKey: string | null;
 today: string;
 weekDays: HabitWeekDay[];
 weekStart: string;
}) {
 return (
 <div className="space-y-4 md:hidden">
 {assignments.map((assignment) => (
 <article
 key={assignment.id}
 className="h-fit self-start rounded-[24px] bg-surface p-4 "
 >
 <h3 className="font-extrabold text-foreground">
 {assignment.habit.title}
 </h3>
 {assignment.habit.description ? (
 <p className="mt-2 text-sm leading-6 text-muted">
 {assignment.habit.description}
 </p>
 ) : null}
 <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
 {weekDays.map((day) => {
 const key = completionKey(assignment.id, day.date);
 const canToggle =
 isClient && isHabitDateMarkable(day.date, today, weekStart);

 return (
 <div key={day.date} className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[3.25rem]">
 <p
 className={cn(
 "text-center text-xs font-extrabold",
 day.isToday ? "text-primary font-black" : "text-muted",
 )}
 >
 {day.shortLabel}
 </p>
 <HabitDayToggle
 assignment={assignment}
 canToggle={canToggle}
 completed={getCompletion(assignment, day.date, overrides)}
 date={day.date}
 disabled={pendingKey === key || isPending}
 isToday={day.isToday}
 onToggle={onToggle}
 />
 </div>
 );
 })}
 </div>
 </article>
 ))}
 </div>
 );
}

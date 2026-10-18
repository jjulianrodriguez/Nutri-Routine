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

export function HabitWeekTable({
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
 <div className="hidden overflow-hidden rounded-[24px] bg-surface md:block">
 <table className="w-full table-fixed border-collapse">
 <thead>
 <tr className="border-b bg-background/70">
 <th className="w-[32%] px-4 py-3 text-left text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Hábito
 </th>
 {weekDays.map((day) => (
 <th
 key={day.date}
 className={cn(
 "px-3 py-3 text-center text-xs font-extrabold uppercase tracking-[0.12em] relative",
 day.isToday ? "text-foreground bg-primary-tint/30 font-black rounded-t-[14px]" : "text-muted",
 )}
 >
 {day.isToday && (
 <span className="absolute inset-x-0 top-0 h-1 bg-primary rounded-full" />
 )}
 <span>{day.shortLabel}</span>
 <span className="mt-1 block text-[0.68rem] font-bold normal-case tracking-normal text-muted-foreground">
 {day.date.slice(5)}
 </span>
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {assignments.map((assignment) => (
 <tr key={assignment.id} className="border-b last:border-b-0">
 <td className="px-4 py-4 align-top">
 <p className="font-extrabold text-foreground">
 {assignment.habit.title}
 </p>
 {assignment.habit.description ? (
 <p className="mt-1 text-sm leading-5 text-muted">
 {assignment.habit.description}
 </p>
 ) : null}
 </td>
 {weekDays.map((day) => {
 const key = completionKey(assignment.id, day.date);
 const canToggle =
 isClient && isHabitDateMarkable(day.date, today, weekStart);

 return (
 <td key={day.date} className={cn("px-3 py-4 align-middle", day.isToday && "bg-primary-tint/10")}>
 <HabitDayToggle
 assignment={assignment}
 canToggle={canToggle}
 completed={getCompletion(assignment, day.date, overrides)}
 date={day.date}
 disabled={pendingKey === key || isPending}
 isToday={day.isToday}
 onToggle={onToggle}
 />
 </td>
 );
 })}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 );
}

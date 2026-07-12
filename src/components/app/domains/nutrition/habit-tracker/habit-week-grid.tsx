"use client";

import type {
 HabitAssignmentSummary,
 HabitWeekDay,
} from "@/lib/habits/utils";

import { useHabitProgressToggle } from "./hooks/use-habit-progress-toggle";
import { HabitWeekCards } from "./habit-week-cards";
import { HabitWeekTable } from "./habit-week-table";
import type { CompletionOverrides } from "./types";

export function HabitWeekGrid({
 assignments,
 isClient,
 overrides,
 today,
 weekDays,
 weekStart,
}: {
 assignments: HabitAssignmentSummary[];
 isClient: boolean;
 overrides: CompletionOverrides;
 today: string;
 weekDays: HabitWeekDay[];
 weekStart: string;
}) {
 const { handleToggle, isPending, pendingKey } =
 useHabitProgressToggle(isClient);

 if (assignments.length === 0) {
 return (
 <div className="rounded-[22px] bg-surface/58 p-5 text-sm font-semibold leading-6 text-muted ">
 <p className="font-extrabold text-foreground">
 Todavía no hay hábitos para esta semana.
 </p>
 <p className="mt-1">
 Cuando tu nutricionista active hábitos, podrás marcarlos de lunes a
 domingo desde aquí.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <HabitWeekTable
 assignments={assignments}
 isClient={isClient}
 isPending={isPending}
 onToggle={handleToggle}
 overrides={overrides}
 pendingKey={pendingKey}
 today={today}
 weekDays={weekDays}
 weekStart={weekStart}
 />

 <HabitWeekCards
 assignments={assignments}
 isClient={isClient}
 isPending={isPending}
 onToggle={handleToggle}
 overrides={overrides}
 pendingKey={pendingKey}
 today={today}
 weekDays={weekDays}
 weekStart={weekStart}
 />
 </div>
 );
}

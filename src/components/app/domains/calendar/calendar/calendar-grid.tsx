"use client";

import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import type { CalendarEventItem } from "@/lib/calendar/types";
import { formatTimeInputLabel } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";
import { cn } from "@/lib/utils";

import {
 type CalendarDay,
 formatFullDate,
 WEEKDAYS,
} from "./calendar-utils";

type CalendarGridProps = {
 activeSelectedDate: string;
 canCreate: boolean;
 days: CalendarDay[];
 eventCount: number;
 eventsByDate: Map<string, CalendarEventItem[]>;
 onCreate: () => void;
 onSelectDate: (dateKey: string) => void;
 onSelectEvent: (dateKey: string, eventId: string) => void;
 timeFormat: TimeFormatPreference;
};

function EmptyMonth({
 canCreate,
 onCreate,
}: {
 canCreate: boolean;
 onCreate: () => void;
}) {
 return (
 <div className="rounded-[24px] bg-background px-5 py-10 text-center">
 <CalendarDays className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
 <p className="mt-4 font-extrabold text-foreground">Sin eventos este mes</p>
 <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
 Navega a otro mes o crea un evento para un cliente permitido.
 </p>
 {canCreate ? (
 <Button type="button" className="mt-5" onClick={onCreate}>
 <Plus className="size-4" aria-hidden="true" />
 Crear evento
 </Button>
 ) : null}
 </div>
 );
}

export function CalendarGrid({
 activeSelectedDate,
 canCreate,
 days,
 eventCount,
 eventsByDate,
 onCreate,
 onSelectDate,
 onSelectEvent,
 timeFormat,
}: CalendarGridProps) {
 return (
 <>
 <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted sm:gap-2">
 {WEEKDAYS.map((weekday) => (
 <div key={weekday}>{weekday}</div>
 ))}
 </div>

 <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
 {days.map((day) => {
 const dayEvents = eventsByDate.get(day.dateKey) ?? [];
 const isSelected = activeSelectedDate === day.dateKey;

 return (
 <div
 key={day.dateKey}
 className={cn(
 "min-h-16 rounded-[16px] bg-background p-1 text-left sm:min-h-28 sm:p-2",
 day.inMonth ? "" : "border-border/60 opacity-55",
 isSelected && "border-primary/60 ring-3 ring-primary/20",
 dayEvents.length > 0 && "bg-primary-soft/32",
 )}
 >
 <button
 type="button"
 className={cn(
 "flex size-8 items-center justify-center rounded-full text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
 day.isToday && "bg-secondary text-secondary-foreground",
 isSelected && !day.isToday && "bg-primary text-primary-foreground",
 )}
 onClick={() => onSelectDate(day.dateKey)}
 aria-pressed={isSelected}
 aria-label={`${formatFullDate(day.dateKey)}, ${dayEvents.length} eventos`}
 >
 {day.dayNumber}
 </button>

 {dayEvents.length > 0 ? (
 <div className="mt-2 space-y-1">
 {dayEvents.slice(0, 2).map((event) => (
 <button
 key={event.id}
 type="button"
 className="hidden w-full min-w-0 rounded-[10px] border-primary/20 bg-surface/86 px-2 py-1 text-left text-[0.7rem] font-extrabold text-foreground transition hover:border-primary/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 sm:block"
 onClick={() => onSelectEvent(day.dateKey, event.id)}
 >
 <span className="block truncate">
 {formatTimeInputLabel(event.startTime, timeFormat)} {event.title}
 </span>
 </button>
 ))}
 <div className="sm:hidden">
 <span className="inline-flex max-w-full items-center rounded-full border-primary/20 bg-surface px-1.5 py-0.5 text-[0.62rem] font-extrabold text-foreground">
 {dayEvents.length} ev.
 </span>
 </div>
 {dayEvents.length > 2 ? (
 <p className="hidden px-2 text-[0.68rem] font-bold text-muted sm:block">
 +{dayEvents.length - 2} más
 </p>
 ) : null}
 </div>
 ) : null}
 </div>
 );
 })}
 </div>

 {eventCount === 0 ? (
 <div className="mt-5">
 <EmptyMonth canCreate={canCreate} onCreate={onCreate} />
 </div>
 ) : null}
 </>
 );
}
"use client";

import { CalendarClock, ListChecks } from "lucide-react";

import { EVENT_TYPE_LABELS } from "@/lib/calendar/constants";
import type { CalendarEventItem } from "@/lib/calendar/types";
import { formatTimeInputLabel } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";

import { EventBadge } from "./event-card";
import { formatShortDate } from "./calendar-utils";

type UpcomingEventListProps = {
 events: CalendarEventItem[];
 onOpen: (event: CalendarEventItem) => void;
 timeFormat: TimeFormatPreference;
};

export function UpcomingEventList({
 events,
 onOpen,
 timeFormat,
}: UpcomingEventListProps) {
 const nextEvent = events[0] ?? null;
 const remainingEvents = events.slice(1);

 return (
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-full bg-primary-soft text-foreground">
 <ListChecks className="size-5" aria-hidden="true" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Próximos
 </p>
 <h2 className="text-xl font-bold text-foreground">
 Consultas y recordatorios
 </h2>
 </div>
 </div>

 {nextEvent ? (
 <>
 <button
 type="button"
 className="mt-5 w-full rounded-[22px] border-primary/25 bg-primary-tint/70 p-4 text-left transition hover:border-primary/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
 onClick={() => onOpen(nextEvent)}
 >
 <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
 <CalendarClock className="size-4" aria-hidden="true" />
 Próxima consulta o recordatorio
 </span>
 <span className="mt-2 block break-words text-lg font-extrabold text-foreground">
 {nextEvent.title}
 </span>
 <span className="mt-2 block text-sm font-bold text-muted">
 {formatShortDate(nextEvent.dateKey)} ·{" "}
 {formatTimeInputLabel(nextEvent.startTime, timeFormat)}
 </span>
 </button>

 {remainingEvents.length > 0 ? (
 <div className="mt-3 space-y-3">
 {remainingEvents.map((event) => (
 <button
 key={event.id}
 type="button"
 className="w-full rounded-[18px] bg-background p-4 text-left transition hover:border-primary/45 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
 onClick={() => onOpen(event)}
 >
 <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
 {formatShortDate(event.dateKey)} ·{" "}
 {formatTimeInputLabel(event.startTime, timeFormat)}
 </span>
 <span className="mt-1 block break-words text-base font-extrabold text-foreground">
 {event.title}
 </span>
 <span className="mt-2 flex flex-wrap gap-2">
 <EventBadge event={event} />
 <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-muted-foreground">
 {EVENT_TYPE_LABELS[event.eventType]}
 </span>
 </span>
 </button>
 ))}
 </div>
 ) : null}
 </>
 ) : (
 <div className="mt-5 rounded-[22px] bg-background p-5 text-sm font-semibold leading-6 text-muted">
 No hay eventos programados en los próximos 90 días con los filtros actuales.
 </div>
 )}
 </section>
 );
}
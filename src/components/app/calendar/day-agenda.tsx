"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CalendarEventItem } from "@/lib/calendar/types";
import type { TimeFormatPreference } from "@/lib/user-settings/types";

import { EventCard } from "./event-card";
import { formatFullDate } from "./calendar-utils";

type DayAgendaProps = {
 activeSelectedDate: string;
 canCreate: boolean;
 canEditEvent: (event: CalendarEventItem) => boolean;
 events: CalendarEventItem[];
 onCreate: () => void;
 onEdit: (event: CalendarEventItem) => void;
 onOpen: (event: CalendarEventItem) => void;
 selectedIsToday: boolean;
 timeFormat: TimeFormatPreference;
};

export function DayAgenda({
 activeSelectedDate,
 canCreate,
 canEditEvent,
 events,
 onCreate,
 onEdit,
 onOpen,
 selectedIsToday,
 timeFormat,
}: DayAgendaProps) {
 return (
 <section className="rounded-[28px] bg-surface p-5 sm:p-6">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 {selectedIsToday ? "Hoy" : "Agenda del día"}
 </p>
 <h2 className="mt-2 text-2xl font-bold capitalize text-foreground">
 {formatFullDate(activeSelectedDate)}
 </h2>
 </div>
 {canCreate ? (
 <Button
 type="button"
 size="sm"
 variant="outline"
 onClick={onCreate}
 aria-label="Crear evento para el día seleccionado"
 >
 <Plus className="size-4" aria-hidden="true" />
 Crear
 </Button>
 ) : null}
 </div>

 {events.length > 0 ? (
 <div className="mt-5 space-y-3">
 {events.map((event) => (
 <EventCard
 key={event.id}
 event={event}
 onEdit={canEditEvent(event) ? onEdit : undefined}
 onOpen={onOpen}
 timeFormat={timeFormat}
 />
 ))}
 </div>
 ) : (
 <div className="mt-5 rounded-[22px] bg-background p-5 text-sm font-semibold leading-6 text-muted">
 No hay eventos para este día.
 {canCreate ? (
 <Button type="button" size="sm" className="mt-4" onClick={onCreate}>
 <Plus className="size-4" aria-hidden="true" />
 Crear evento
 </Button>
 ) : null}
 </div>
 )}
 </section>
 );
}

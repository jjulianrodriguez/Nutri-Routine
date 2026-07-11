"use client";

import {
 CalendarClock,
 CheckCircle2,
 CircleSlash,
 Clock,
 Pencil,
} from "lucide-react";

import { RelationshipBadge } from "@/components/app/relationship-badges";
import { Button } from "@/components/ui/button";
import {
 EVENT_TYPE_LABELS,
 STATUS_DESCRIPTIONS,
} from "@/lib/calendar/constants";
import type { CalendarEventItem } from "@/lib/calendar/types";
import { formatTimeInputLabel } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";

import { EventBadge, StatusBadge } from "./event-card";
import { formatFullDate } from "./calendar-utils";

type EventDetailCardProps = {
 canEditEvent: (event: CalendarEventItem) => boolean;
 event: CalendarEventItem | null;
 onEdit: (event: CalendarEventItem) => void;
 onStatusChange: (
 event: CalendarEventItem,
 status: CalendarEventItem["status"],
 ) => void;
 timeFormat: TimeFormatPreference;
};

export function EventDetailCard({
 canEditEvent,
 event,
 onEdit,
 onStatusChange,
 timeFormat,
}: EventDetailCardProps) {
 return (
 <section className="rounded-[28px] bg-primary-soft/68 p-5 sm:p-6">
 <div className="flex items-center gap-3">
 <div className="grid size-11 place-items-center rounded-full bg-surface text-muted-foreground ">
 <CalendarClock className="size-5" aria-hidden="true" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Detalle
 </p>
 <h2 className="text-xl font-bold text-foreground">
 {event ? event.title : "Sin evento seleccionado"}
 </h2>
 </div>
 </div>

 {event ? (
 <div className="mt-5 space-y-4">
 <div className="flex flex-wrap gap-2">
 <EventBadge event={event} />
 <RelationshipBadge>{EVENT_TYPE_LABELS[event.eventType]}</RelationshipBadge>
 <StatusBadge status={event.status} />
 </div>

 <dl className="grid gap-3 text-sm leading-6">
 <div>
 <dt className="font-extrabold text-foreground">Fecha y hora</dt>
 <dd className="mt-1 text-muted">
 <Clock className="mr-1 inline size-4" aria-hidden="true" />
 {formatFullDate(event.dateKey)},{" "}
 {formatTimeInputLabel(event.startTime, timeFormat)}
 {event.endTime
 ? ` - ${formatTimeInputLabel(event.endTime, timeFormat)}`
 : ""}
 </dd>
 </div>
 <div>
 <dt className="font-extrabold text-foreground">Cliente</dt>
 <dd className="mt-1 text-muted">
 <span className="block font-bold text-foreground">{event.clientName}</span>
 {event.clientEmail ? (
 <span className="block truncate">{event.clientEmail}</span>
 ) : null}
 </dd>
 </div>
 <div>
 <dt className="font-extrabold text-foreground">Profesional</dt>
 <dd className="mt-1 text-muted">{event.professionalName}</dd>
 </div>
 <div>
 <dt className="font-extrabold text-foreground">Descripción</dt>
 <dd className="mt-1 whitespace-pre-wrap text-muted">
 {event.description || "Sin descripción adicional."}
 </dd>
 </div>
 <div>
 <dt className="font-extrabold text-foreground">Estado</dt>
 <dd className="mt-1 text-muted">{STATUS_DESCRIPTIONS[event.status]}</dd>
 </div>
 </dl>

 {canEditEvent(event) ? (
 <div className="flex flex-col gap-2 sm:flex-row">
 {event.status !== "completed" ? (
 <Button
 type="button"
 size="sm"
 variant="outline"
 onClick={() => onStatusChange(event, "completed")}
 >
 <CheckCircle2 className="size-4" aria-hidden="true" />
 Marcar completado
 </Button>
 ) : null}
 {event.status !== "cancelled" ? (
 <Button
 type="button"
 size="sm"
 variant="outline"
 onClick={() => onStatusChange(event, "cancelled")}
 >
 <CircleSlash className="size-4" aria-hidden="true" />
 Cancelar
 </Button>
 ) : null}
 <Button type="button" size="sm" onClick={() => onEdit(event)}>
 <Pencil className="size-4" aria-hidden="true" />
 Editar
 </Button>
 </div>
 ) : null}
 </div>
 ) : (
 <p className="mt-5 text-sm leading-6 text-muted">
 Selecciona un evento del calendario para ver titulo, hora, profesional,
 descripción y área.
 </p>
 )}
 </section>
 );
}

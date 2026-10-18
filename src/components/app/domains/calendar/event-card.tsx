"use client";

import { Dumbbell, Layers3, Leaf, Pencil, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import {
 AREA_LABELS,
 EVENT_TYPE_LABELS,
 STATUS_DESCRIPTIONS,
 STATUS_LABELS,
} from "@/lib/calendar/constants";
import type { CalendarArea, CalendarEventItem } from "@/lib/calendar/types";
import { formatTimeInputLabel } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";
import { cn } from "@/lib/utils";

const AREA_DETAILS: Record<
 CalendarArea,
 { icon: LucideIcon; tone: string }
> = {
 general: {
 icon: Layers3,
 tone: "border-accent/45 bg-secondary-soft text-foreground",
 },
 nutrition: {
 icon: Leaf,
 tone: "border-accent/40 bg-secondary-tint/70 text-foreground",
 },
 training: {
 icon: Dumbbell,
 tone: "border-primary/40 bg-primary-soft text-foreground",
 },
};

export function EventBadge({ event }: { event: CalendarEventItem }) {
 const area = AREA_DETAILS[event.area];
 const AreaIcon = area.icon;

 return (
 <span
 className={cn(
 "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold",
 area.tone,
 )}
 >
 <AreaIcon className="size-3.5 shrink-0" aria-hidden="true" />
 <span className="truncate">{AREA_LABELS[event.area]}</span>
 </span>
 );
}

export function StatusBadge({
 status,
}: {
 status: CalendarEventItem["status"];
}) {
 return (
 <span
 className={cn(
 "rounded-full px-2.5 py-1 text-xs font-extrabold",
 status === "scheduled" &&
 "border-primary/25 bg-primary-soft text-foreground",
 status === "completed" &&
 "border-accent/35 bg-secondary-soft text-foreground",
 status === "cancelled" &&
 "border-danger/20 bg-danger/5 text-danger",
 )}
 title={STATUS_DESCRIPTIONS[status]}
 >
 {STATUS_LABELS[status]}
 </span>
 );
}

export function EventCard({
 event,
 onEdit,
 onOpen,
 timeFormat,
}: {
 event: CalendarEventItem;
 onEdit?: (event: CalendarEventItem) => void;
 onOpen: (event: CalendarEventItem) => void;
 timeFormat: TimeFormatPreference;
}) {
 const isCancelled = event.status === "cancelled";
 const startTime = formatTimeInputLabel(event.startTime, timeFormat);
 const endTime = formatTimeInputLabel(event.endTime, timeFormat);

 return (
 <article
 className={cn(
 "rounded-[22px] bg-background p-4 ",
 isCancelled ? "border-danger/20" : "",
 )}
 >
 <div className="flex items-start justify-between gap-3">
 <button
 type="button"
 className="min-w-0 text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
 onClick={() => onOpen(event)}
 >
 <span className="block truncate text-sm font-extrabold text-muted-foreground">
 {startTime}
 {endTime ? ` - ${endTime}` : ""}
 </span>
 <h3 className="mt-1 break-words text-lg font-extrabold text-foreground">
 {event.title}
 </h3>
 </button>
 {onEdit ? (
 <Button
 type="button"
 size="icon-sm"
 variant="ghost"
 onClick={() => onEdit(event)}
 aria-label={`Editar ${event.title}`}
 >
 <Pencil className="size-4" aria-hidden="true" />
 </Button>
 ) : null}
 </div>
 <div className="mt-3 flex flex-wrap gap-2">
 <EventBadge event={event} />
 <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-extrabold text-muted-foreground">
 {EVENT_TYPE_LABELS[event.eventType]}
 </span>
 <StatusBadge status={event.status} />
 </div>
 <p className="mt-3 text-sm leading-6 text-muted">
 <span className="block font-bold text-foreground">{event.clientName}</span>
 {event.clientEmail ? (
 <span className="block truncate">{event.clientEmail}</span>
 ) : null}
 {event.professionalName ? (
 <span className="block">Con {event.professionalName}</span>
 ) : null}
 </p>
 </article>
 );
}
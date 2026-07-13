"use client";

import { Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/actions/button";
import type { AppNotification } from "@/lib/notifications/data";
import { cn } from "@/lib/utils";

import { getDestinationLabel, getEventPresentation, getNotificationMessage } from "./helpers";
import type { NotificationViewer } from "./types";

export function NotificationItem({
 activeId,
 assignedNutritionistName,
 assignedTrainerName,
 hasNutrition,
 hasTraining,
 isPending,
 notification,
 onMarkAsRead,
 onOpen,
 viewer,
}: {
 activeId: string | null;
 assignedNutritionistName: string | null;
 assignedTrainerName: string | null;
 hasNutrition: boolean;
 hasTraining: boolean;
 isPending: boolean;
 notification: AppNotification;
 onMarkAsRead: (notification: AppNotification) => void;
 onOpen: (notification: AppNotification) => void;
 viewer: NotificationViewer;
}) {
 const isUnread = notification.groupUnreadCount > 0;
 const presentation = getEventPresentation(notification.event_type);
 const Icon = presentation.icon;
 const isProcessing = isPending && activeId === notification.id;
 const displayMessage = getNotificationMessage(notification, viewer, assignedNutritionistName, assignedTrainerName, hasNutrition, hasTraining);
 const destinationLabel = getDestinationLabel(notification);

 return (
  <article className={cn("flex min-w-0 flex-col gap-3 overflow-hidden rounded-[24px] p-4 transition-colors sm:flex-row sm:items-center", isUnread ? "border-primary/35 bg-primary-soft/65" : " bg-surface")}>
   <button type="button" className="flex min-w-0 flex-1 items-start gap-4 rounded-control text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-wait" onClick={() => onOpen(notification)} disabled={isPending} aria-label={`${presentation.label}: ${displayMessage}. ${destinationLabel}`}>
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-full ", isUnread ? "border-primary/30 bg-primary text-primary-foreground" : " bg-background text-muted-foreground")}>
     {isProcessing ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : <Icon className="size-5" aria-hidden="true" />}
    </span>
    <span className="min-w-0 flex-1">
     <span className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-extrabold uppercase tracking-normal text-muted">{presentation.label}</span>
      {isUnread ? <span className="rounded-full bg-primary px-2 py-0.5 text-[0.68rem] font-extrabold text-primary-foreground">Nueva</span> : null}
      {notification.groupCount > 1 ? <span className="rounded-full bg-surface px-2 py-0.5 text-[0.68rem] font-extrabold text-muted">{notification.groupCount} similares</span> : null}
     </span>
     <span className="mt-2 block break-words text-sm font-bold leading-6 text-foreground sm:text-base">{displayMessage}</span>
     <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-muted">
      <span>{destinationLabel}</span>
      <span>{notification.createdRelativeLabel} · {notification.createdLabel}</span>
      {notification.groupUnreadCount > 1 ? <span>Incluye {notification.groupUnreadCount} sin leer.</span> : null}
     </span>
    </span>
   </button>
   {isUnread ? (
    <Button type="button" size="sm" variant="ghost" onClick={() => onMarkAsRead(notification)} disabled={isPending} className="self-end sm:self-center"><Check className="size-4" aria-hidden="true" />Marcar como leída</Button>
   ) : <span className="self-end text-xs font-bold text-muted sm:self-center">Leída</span>}
  </article>
 );
}

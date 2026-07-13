"use client";

import { CheckCheck, Inbox, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { SectionTabs } from "@/components/app/shared/section-tabs";
import { Button } from "@/components/ui/actions/button";
import { EmptyState } from "@/components/ui/feedback/state-block";
import { markAllNotificationsRead, markNotificationGroupRead } from "@/lib/actions/notifications";
import type { AppNotification } from "@/lib/notifications/data";

import { filterNotifications, getEmptyMessage, getFilterEmptyMessage, getTabs, getUnreadCount } from "./notification-center/helpers";
import { NotificationItem } from "./notification-center/notification-item";
import type { NotificationFilter, NotificationViewer } from "./notification-center/types";

export function NotificationCenter({
 assignedNutritionistName = null,
 assignedTrainerName = null,
 hasNutrition = false,
 hasTraining = false,
 notifications,
 viewer = "professional",
}: {
 assignedNutritionistName?: string | null;
 assignedTrainerName?: string | null;
 hasNutrition?: boolean;
 hasTraining?: boolean;
 notifications: AppNotification[];
 viewer?: NotificationViewer;
}) {
 const router = useRouter();
 const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
 const [activeId, setActiveId] = useState<string | null>(null);
 const [feedback, setFeedback] = useState<string | null>(null);
 const [isPending, startTransition] = useTransition();
 const unreadCount = getUnreadCount(notifications);
 const tabs = useMemo(() => getTabs(notifications), [notifications]);
 const visibleNotifications = useMemo(() => filterNotifications(notifications, activeFilter), [activeFilter, notifications]);

 function openNotification(notification: AppNotification) {
  setActiveId(notification.id);
  setFeedback(null);
  startTransition(async () => {
   try {
    const result = await markNotificationGroupRead(notification.groupedIds);
    if (result.status === "error" || !result.destination) {
     setFeedback(result.message);
     setActiveId(null);
     return;
    }
    router.push(result.destination);
    router.refresh();
   } catch {
    setFeedback("No pudimos abrir esta notificación. Inténtalo de nuevo.");
    setActiveId(null);
   }
  });
 }

 function markAsRead(notification: AppNotification) {
  setActiveId(notification.id);
  setFeedback(null);
  startTransition(async () => {
   try {
    const result = await markNotificationGroupRead(notification.groupedIds);
    setFeedback(result.status === "error" ? result.message : null);
    setActiveId(null);
    router.refresh();
   } catch {
    setFeedback("No pudimos actualizar esta notificación.");
    setActiveId(null);
   }
  });
 }

 function markAllAsRead() {
  setActiveId("all");
  setFeedback(null);
  startTransition(async () => {
   try {
    const result = await markAllNotificationsRead();
    setFeedback(result.status === "error" ? result.message : null);
    setActiveId(null);
    router.refresh();
   } catch {
    setFeedback("No pudimos marcar tus notificaciones como leídas.");
    setActiveId(null);
   }
  });
 }

 if (notifications.length === 0) {
  return <EmptyState><Inbox className="mx-auto mb-3 size-9 text-muted" aria-hidden="true" />{getEmptyMessage(viewer, assignedNutritionistName, assignedTrainerName, hasNutrition, hasTraining)}</EmptyState>;
 }

 return (
  <div className="space-y-4">
   <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm font-semibold text-muted" aria-live="polite">{unreadCount === 0 ? "Estás al día." : `${unreadCount} ${unreadCount === 1 ? "notificación nueva" : "notificaciones nuevas"}`}</p>
    {unreadCount > 0 ? <Button type="button" variant="outline" onClick={markAllAsRead} disabled={isPending}>{isPending && activeId === "all" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CheckCheck className="size-4" aria-hidden="true" />}Marcar todas como leídas</Button> : null}
   </div>
   <SectionTabs activeId={activeFilter} ariaLabel="Filtros de notificaciones" className="flex-nowrap overflow-x-auto rounded-[20px] bg-background/50 p-2" interaction="tabs" items={tabs.map((tab) => ({ count: tab.count, id: tab.id, label: tab.label, onClick: () => setActiveFilter(tab.id) }))} size="sm" />
   {feedback ? <p className="rounded-control border-danger/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive" role="alert">{feedback}</p> : null}
   {visibleNotifications.length === 0 ? <EmptyState>{getFilterEmptyMessage(activeFilter)}</EmptyState> : (
    <div className="space-y-3" aria-label="Lista de notificaciones">
     {visibleNotifications.map((notification) => <NotificationItem key={notification.id} activeId={activeId} assignedNutritionistName={assignedNutritionistName} assignedTrainerName={assignedTrainerName} hasNutrition={hasNutrition} hasTraining={hasTraining} isPending={isPending} notification={notification} onMarkAsRead={markAsRead} onOpen={openNotification} viewer={viewer} />)}
    </div>
   )}
  </div>
 );
}

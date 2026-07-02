"use client";

import {
 Bell,
 BookOpen,
 CalendarClock,
 Check,
 CheckCheck,
 Dumbbell,
 HeartPulse,
 Inbox,
 Leaf,
 LoaderCircle,
 MessageCircle,
 UserRoundCheck,
 type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import {
 markAllNotificationsRead,
 markNotificationGroupRead,
} from "@/lib/actions/notifications";
import type { AppNotification } from "@/lib/notifications/data";
import { cn } from "@/lib/utils";

type EventPresentation = {
 icon: LucideIcon;
 label: string;
};

type NotificationViewer = "client" | "professional";
type NotificationCategory =
 | "nutrition"
 | "training"
 | "resources"
 | "calendar"
 | "messages"
 | "general";
type NotificationFilter = "all" | "unread" | NotificationCategory;

type NotificationTab = {
 count: number;
 id: NotificationFilter;
 label: string;
};

const DEFAULT_PRESENTATION: EventPresentation = {
 icon: Bell,
 label: "Actualización",
};

function getEventPresentation(eventType: string): EventPresentation {
 if (eventType.startsWith("chat_")) {
 return { icon: MessageCircle, label: "Mensajes" };
 }

 if (eventType.startsWith("appointment_")) {
 return { icon: CalendarClock, label: "Calendario" };
 }

 if (
 eventType === "resource_available" ||
 eventType.includes("_resource_")
 ) {
 return { icon: BookOpen, label: "Recursos" };
 }

 if (
 eventType.startsWith("routine_") ||
 eventType.startsWith("workout_") ||
 eventType.startsWith("training_")
 ) {
 return { icon: Dumbbell, label: "Entrenamiento" };
 }

 if (eventType.startsWith("nutrition_")) {
 return { icon: Leaf, label: "Nutrición" };
 }

 if (eventType.includes("professional_")) {
 return { icon: UserRoundCheck, label: "Asignación" };
 }

 if (eventType === "progress_recorded") {
 return { icon: HeartPulse, label: "Progreso" };
 }

 return DEFAULT_PRESENTATION;
}

function getMetadataRecord(value: unknown): Record<string, unknown> | null {
 if (!value || typeof value !== "object" || Array.isArray(value)) {
 return null;
 }

 return value as Record<string, unknown>;
}

function getMetadataString(notification: AppNotification, keys: string[]) {
 const metadata = getMetadataRecord(notification.metadata);

 if (!metadata) {
 return null;
 }

 for (const key of keys) {
 const value = metadata[key];

 if (typeof value === "string" && value.trim()) {
 return value.trim();
 }
 }

 return null;
}

function getQuotedText(value: string) {
 const match = value.match(/"([^"]+)"/);

 return match?.[1] ?? null;
}

function cleanNotificationMessage(message: string) {
 return message
 .replaceAll("Agrego", "Agregó")
 .replaceAll("agrego", "agregó")
 .replaceAll("Creo", "Creó")
 .replaceAll("creo", "creó")
 .replaceAll("Leida", "Leída")
 .replaceAll("asigno", "asignó")
 .replaceAll("Asignacion", "Asignación")
 .replaceAll("asignacion", "asignación")
 .replaceAll("esta disponible", "está disponible")
 .replaceAll("esta activo", "está activo")
 .replaceAll("nutricion", "nutrición")
 .replaceAll("alimentacion", "alimentación")
 .replaceAll("habitos", "hábitos")
 .replaceAll("habito", "hábito")
 .replaceAll("actualizacion", "actualización")
 .replaceAll("actualizo", "actualizó")
 .replaceAll("registro", "registró")
 .replaceAll("conservo", "conservó")
 .replaceAll("finalizo", "finalizó")
 .replaceAll("completo", "completó");
}

function getNotificationCategory(
 notification: AppNotification,
): NotificationCategory {
 const destination = notification.destination_path;
 const eventType = notification.event_type;

 if (eventType.startsWith("chat_") || destination.includes("chat=")) {
 return "messages";
 }

 if (
 eventType.startsWith("appointment_") ||
 destination.startsWith("/app/calendario")
 ) {
 return "calendar";
 }

 if (
 eventType === "resource_available" ||
 eventType.includes("_resource_") ||
 destination.startsWith("/app/recursos") ||
 destination.startsWith("/app/nutricion/biblioteca")
 ) {
 return "resources";
 }

 if (
 eventType.startsWith("routine_") ||
 eventType.startsWith("workout_") ||
 eventType.startsWith("training_") ||
 destination.startsWith("/app/entrenamiento")
 ) {
 return "training";
 }

 if (eventType === "progress_recorded") {
 const area = getMetadataString(notification, ["area"]);

 return area === "nutrition" ? "nutrition" : "training";
 }

 if (
 eventType.startsWith("nutrition_") ||
 destination.startsWith("/app/nutricion")
 ) {
 return "nutrition";
 }

 return "general";
}

function getDestinationLabel(notification: AppNotification) {
 const destination = notification.destination_path;

 if (destination.startsWith("/app/recursos")) {
 return "Abrirá Recursos";
 }

 if (destination.startsWith("/app/nutricion/habitos")) {
 return "Abrirá Hábitos de nutrición";
 }

 if (destination.startsWith("/app/nutricion/biblioteca")) {
 return "Abrirá Recursos";
 }

 if (destination.startsWith("/app/nutricion/asignaciones")) {
 return "Abrirá Asignaciones de nutrición";
 }

 if (destination.startsWith("/app/nutricion")) {
 return "Abrirá Plan de alimentación";
 }

 if (destination.startsWith("/app/entrenamiento/historial")) {
 return "Abrirá Historial de entrenamiento";
 }

 if (destination.startsWith("/app/entrenamiento/plantillas")) {
 return "Abrirá Plantillas";
 }

 if (destination.startsWith("/app/entrenamiento/rutinas")) {
 return "Abrirá Rutinas";
 }

 if (destination.startsWith("/app/entrenamiento")) {
 return "Abrirá Entrenamiento";
 }

 if (destination.startsWith("/app/progreso")) {
 return "Abrirá Progreso";
 }

 if (destination.startsWith("/app/calendario")) {
 return "Abrirá Calendario";
 }

 if (destination.includes("chat=")) {
 return "Abrirá Mensajes";
 }

 if (destination.startsWith("/app/clientes/")) {
 return "Abrirá Cliente";
 }

 if (destination.startsWith("/app/dashboard")) {
 return "Abrirá Dashboard";
 }

 return "Abrirá la sección relacionada";
}

function getResourceAreaMessage(
 notification: AppNotification,
 hasNutrition: boolean,
 hasTraining: boolean,
) {
 const area = getMetadataString(notification, [
 "area",
 "service_area",
 "resource_area",
 ]);

 if (area === "training" || (hasTraining && !hasNutrition)) {
 return "Tienes nuevos recursos para tu entrenamiento.";
 }

 if (area === "nutrition" || (hasNutrition && !hasTraining)) {
 return "Tienes nuevos recursos de nutrición.";
 }

 return "Tienes nuevos recursos disponibles.";
}

function getClientNotificationMessage(
 notification: AppNotification,
 assignedNutritionistName: string | null,
 assignedTrainerName: string | null,
 hasNutrition: boolean,
 hasTraining: boolean,
) {
 const trainerLabel =
 assignedTrainerName ?? "Tu profesional de entrenamiento";
 const nutritionistLabel =
 assignedNutritionistName ?? "Tu profesional de nutrición";
 const title =
 getMetadataString(notification, [
 "templateName",
 "template_name",
 "routineName",
 "routine_name",
 "title",
 "name",
 ]) ?? getQuotedText(notification.message);

 switch (notification.event_type) {
 case "workout_template_assigned":
 return title
 ? `${trainerLabel} te asignó la plantilla "${title}".`
 : `${trainerLabel} te asignó una plantilla.`;
 case "workout_template_unassigned":
 return title
 ? `La plantilla "${title}" se archivó en tu historial.`
 : "Tu plantilla se archivó en tu historial.";
 case "workout_template_updated":
 return "Tu entrenamiento fue actualizado.";
 case "routine_assigned":
 return title
 ? `${trainerLabel} te asignó el entrenamiento "${title}".`
 : `${trainerLabel} te asignó un entrenamiento.`;
 case "routine_unassigned":
 return title
 ? `El entrenamiento "${title}" se archivó en tu historial.`
 : "Tu entrenamiento se archivó en tu historial.";
 case "training_plan_activated":
 return "Tu plan de entrenamiento está activo.";
 case "training_plan_deactivated":
 return "Tu plan de entrenamiento fue desactivado.";
 case "training_professional_changed":
 case "training_professional_assigned":
 return assignedTrainerName
 ? `${assignedTrainerName} es tu profesional de entrenamiento.`
 : "Tu profesional de entrenamiento fue actualizado.";
 case "resource_available":
 return getResourceAreaMessage(notification, hasNutrition, hasTraining);
 case "nutrition_plan_assigned":
 return `${nutritionistLabel} te asignó un plan de nutrición.`;
 case "nutrition_plan_archived":
 return "Tu plan de nutrición se archivó en tu historial.";
 case "nutrition_plan_activated":
 return "Tu plan de nutrición está activo.";
 case "nutrition_plan_deactivated":
 return "Tu plan de nutrición fue desactivado.";
 case "nutrition_meal_plan_assigned":
 return `${nutritionistLabel} compartió un nuevo plan de alimentación.`;
 case "nutrition_meal_plan_updated":
 return "Tu plan de alimentación fue actualizado.";
 case "nutrition_meal_plan_deactivated":
 return "Tu plan de alimentación fue desactivado.";
 case "nutrition_educational_resource_created":
 return "Hay un nuevo recurso educativo en Recursos.";
 case "nutrition_educational_resource_updated":
 return "Se actualizó un recurso educativo en Recursos.";
 case "nutrition_habit_assigned":
 return `${nutritionistLabel} te asignó un nuevo hábito de nutrición.`;
 case "nutrition_habit_updated":
 return "Se actualizó un hábito de nutrición que tienes asignado.";
 case "nutrition_habit_removed":
 return "Un hábito de nutrición fue desactivado de tu plan.";
 case "nutrition_habit_progress_perfect":
 return "Completaste todos tus hábitos de hoy.";
 case "nutrition_professional_changed":
 case "nutrition_professional_assigned":
 return assignedNutritionistName
 ? `${assignedNutritionistName} es tu nutricionista.`
 : "Tu profesional de nutrición fue actualizado.";
 default:
 if (
 notification.event_type.startsWith("workout_") ||
 notification.event_type.startsWith("routine_") ||
 notification.event_type.startsWith("training_")
 ) {
 return "Tu entrenamiento fue actualizado.";
 }

 return cleanNotificationMessage(notification.message);
 }
}

function getNotificationMessage(
 notification: AppNotification,
 viewer: NotificationViewer,
 assignedNutritionistName: string | null,
 assignedTrainerName: string | null,
 hasNutrition: boolean,
 hasTraining: boolean,
) {
 if (viewer === "client") {
 return getClientNotificationMessage(
 notification,
 assignedNutritionistName,
 assignedTrainerName,
 hasNutrition,
 hasTraining,
 );
 }

 return cleanNotificationMessage(notification.message);
}

function getEmptyMessage(
 viewer: NotificationViewer,
 assignedNutritionistName: string | null,
 assignedTrainerName: string | null,
 hasNutrition: boolean,
 hasTraining: boolean,
) {
 if (viewer !== "client") {
 return "No tienes notificaciones por ahora. La actividad reciente aparecerá aquí.";
 }

 if (hasTraining && !hasNutrition) {
 return `No tienes notificaciones por ahora. ${
 assignedTrainerName ?? "Tu profesional de entrenamiento"
 } te avisará aquí cuando haya cambios en tu entrenamiento o recursos nuevos.`;
 }

 if (hasNutrition && !hasTraining) {
 return `No tienes notificaciones por ahora. ${
 assignedNutritionistName ?? "Tu profesional de nutrición"
 } te avisará aquí cuando haya cambios en tu plan o recursos nuevos.`;
 }

 return "No tienes notificaciones por ahora. Aquí verás avisos sobre tus planes, calendario y recursos.";
}

function getFilterEmptyMessage(filter: NotificationFilter) {
 switch (filter) {
 case "unread":
 return "No tienes notificaciones sin leer.";
 case "nutrition":
 return "No hay notificaciones de nutrición en este momento.";
 case "training":
 return "No hay notificaciones de entrenamiento en este momento.";
 case "resources":
 return "No hay notificaciones de recursos en este momento.";
 case "calendar":
 return "No hay notificaciones de calendario en este momento.";
 case "messages":
 return "No hay notificaciones de mensajes en este momento.";
 default:
 return "No hay notificaciones para este filtro.";
 }
}

function getNotificationCount(notifications: AppNotification[]) {
 return notifications.reduce(
 (total, notification) => total + notification.groupCount,
 0,
 );
}

function getUnreadCount(notifications: AppNotification[]) {
 return notifications.reduce(
 (total, notification) => total + notification.groupUnreadCount,
 0,
 );
}

function getTabs(notifications: AppNotification[]): NotificationTab[] {
 const counts = notifications.reduce(
 (acc, notification) => {
 const category = getNotificationCategory(notification);

 acc[category] += notification.groupCount;
 return acc;
 },
 {
 calendar: 0,
 general: 0,
 messages: 0,
 nutrition: 0,
 resources: 0,
 training: 0,
 } satisfies Record<NotificationCategory, number>,
 );

 return [
 { id: "all", label: "Todas", count: getNotificationCount(notifications) },
 { id: "unread", label: "Sin leer", count: getUnreadCount(notifications) },
 { id: "nutrition", label: "Nutrición", count: counts.nutrition },
 { id: "training", label: "Entrenamiento", count: counts.training },
 { id: "resources", label: "Recursos", count: counts.resources },
 { id: "calendar", label: "Calendario", count: counts.calendar },
 ...(counts.messages > 0
 ? [{ id: "messages" as const, label: "Mensajes", count: counts.messages }]
 : []),
 ];
}

function filterNotifications(
 notifications: AppNotification[],
 filter: NotificationFilter,
) {
 if (filter === "all") {
 return notifications;
 }

 if (filter === "unread") {
 return notifications.filter(
 (notification) => notification.groupUnreadCount > 0,
 );
 }

 return notifications.filter(
 (notification) => getNotificationCategory(notification) === filter,
 );
}

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
 const visibleNotifications = useMemo(
 () => filterNotifications(notifications, activeFilter),
 [activeFilter, notifications],
 );

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
 return (
 <EmptyState>
 <Inbox className="mx-auto mb-3 size-9 text-muted" aria-hidden="true" />
 {getEmptyMessage(
 viewer,
 assignedNutritionistName,
 assignedTrainerName,
 hasNutrition,
 hasTraining,
 )}
 </EmptyState>
 );
 }

 return (
 <div className="space-y-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-sm font-semibold text-muted" aria-live="polite">
 {unreadCount === 0
 ? "Estás al día."
 : `${unreadCount} ${
 unreadCount === 1 ? "notificación nueva" : "notificaciones nuevas"
 }`}
 </p>
 {unreadCount > 0 ? (
 <Button
 type="button"
 variant="outline"
 onClick={markAllAsRead}
 disabled={isPending}
 >
 {isPending && activeId === "all" ? (
 <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
 ) : (
 <CheckCheck className="size-4" aria-hidden="true" />
 )}
 Marcar todas como leídas
 </Button>
 ) : null}
 </div>

 <div
 className="flex gap-2 overflow-x-auto rounded-[20px] bg-background/50 p-2"
 aria-label="Filtros de notificaciones"
 role="tablist"
 >
 {tabs.map((tab) => (
 <button
 key={tab.id}
 type="button"
 role="tab"
 aria-selected={activeFilter === tab.id}
 className={cn(
 "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-control px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
 activeFilter === tab.id
 ? "bg-primary text-primary-foreground "
 : "text-muted hover:bg-surface hover:text-foreground",
 )}
 onClick={() => setActiveFilter(tab.id)}
 >
 <span>{tab.label}</span>
 <span
 className={cn(
 "rounded-full px-2 py-0.5 text-xs",
 activeFilter === tab.id ? "bg-surface/70" : "bg-surface",
 )}
 >
 {tab.count}
 </span>
 </button>
 ))}
 </div>

 {feedback ? (
 <p
 className="rounded-control border-danger/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
 role="alert"
 >
 {feedback}
 </p>
 ) : null}

 {visibleNotifications.length === 0 ? (
 <EmptyState>{getFilterEmptyMessage(activeFilter)}</EmptyState>
 ) : (
 <div className="space-y-3" aria-label="Lista de notificaciones">
 {visibleNotifications.map((notification) => {
 const isUnread = notification.groupUnreadCount > 0;
 const presentation = getEventPresentation(notification.event_type);
 const Icon = presentation.icon;
 const isProcessing = isPending && activeId === notification.id;
 const displayMessage = getNotificationMessage(
 notification,
 viewer,
 assignedNutritionistName,
 assignedTrainerName,
 hasNutrition,
 hasTraining,
 );
 const destinationLabel = getDestinationLabel(notification);

 return (
 <article
 key={notification.id}
 className={cn(
 "flex min-w-0 flex-col gap-3 overflow-hidden rounded-[24px] p-4 transition-colors sm:flex-row sm:items-center",
 isUnread
 ? "border-primary/35 bg-primary-soft/65"
 : " bg-surface",
 )}
 >
 <button
 type="button"
 className="flex min-w-0 flex-1 items-start gap-4 rounded-control text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-wait"
 onClick={() => openNotification(notification)}
 disabled={isPending}
 aria-label={`${presentation.label}: ${displayMessage}. ${destinationLabel}`}
 >
 <span
 className={cn(
 "grid size-11 shrink-0 place-items-center rounded-full ",
 isUnread
 ? "border-primary/30 bg-primary text-primary-foreground"
 : " bg-background text-muted-foreground",
 )}
 >
 {isProcessing ? (
 <LoaderCircle
 className="size-5 animate-spin"
 aria-hidden="true"
 />
 ) : (
 <Icon className="size-5" aria-hidden="true" />
 )}
 </span>

 <span className="min-w-0 flex-1">
 <span className="flex flex-wrap items-center gap-2">
 <span className="text-xs font-extrabold uppercase tracking-normal text-muted">
 {presentation.label}
 </span>
 {isUnread ? (
 <span className="rounded-full bg-primary px-2 py-0.5 text-[0.68rem] font-extrabold text-primary-foreground">
 Nueva
 </span>
 ) : null}
 {notification.groupCount > 1 ? (
 <span className="rounded-full bg-surface px-2 py-0.5 text-[0.68rem] font-extrabold text-muted">
 {notification.groupCount} similares
 </span>
 ) : null}
 </span>
 <span className="mt-2 block break-words text-sm font-bold leading-6 text-foreground sm:text-base">
 {displayMessage}
 </span>
 <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-muted">
 <span>{destinationLabel}</span>
 <span>
 {notification.createdRelativeLabel} ·{" "}
 {notification.createdLabel}
 </span>
 {notification.groupUnreadCount > 1 ? (
 <span>
 Incluye {notification.groupUnreadCount} sin leer.
 </span>
 ) : null}
 </span>
 </span>
 </button>

 {isUnread ? (
 <Button
 type="button"
 size="sm"
 variant="ghost"
 onClick={() => markAsRead(notification)}
 disabled={isPending}
 className="self-end sm:self-center"
 >
 <Check className="size-4" aria-hidden="true" />
 Marcar como leída
 </Button>
 ) : (
 <span className="self-end text-xs font-bold text-muted sm:self-center">
 Leída
 </span>
 )}
 </article>
 );
 })}
 </div>
 )}
 </div>
 );
}

import { Bell, BookOpen, CalendarClock, Dumbbell, HeartPulse, Leaf, MessageCircle, UserRoundCheck } from "lucide-react";

import type { AppNotification } from "@/lib/notifications/data";

import type { EventPresentation, NotificationCategory, NotificationFilter, NotificationTab, NotificationViewer } from "./types";

const DEFAULT_PRESENTATION: EventPresentation = { icon: Bell, label: "Actualización" };

export function getEventPresentation(eventType: string): EventPresentation {
 if (eventType.startsWith("chat_")) return { icon: MessageCircle, label: "Mensajes" };
 if (eventType.startsWith("appointment_")) return { icon: CalendarClock, label: "Calendario" };
 if (eventType === "resource_available" || eventType.includes("_resource_")) return { icon: BookOpen, label: "Recursos" };
 if (eventType.startsWith("routine_") || eventType.startsWith("workout_") || eventType.startsWith("training_")) return { icon: Dumbbell, label: "Entrenamiento" };
 if (eventType.startsWith("nutrition_")) return { icon: Leaf, label: "Nutrición" };
 if (eventType.includes("professional_")) return { icon: UserRoundCheck, label: "Asignación" };
 if (eventType === "progress_recorded") return { icon: HeartPulse, label: "Progreso" };
 return DEFAULT_PRESENTATION;
}

function getMetadataRecord(value: unknown): Record<string, unknown> | null {
 if (!value || typeof value !== "object" || Array.isArray(value)) return null;
 return value as Record<string, unknown>;
}

function getMetadataString(notification: AppNotification, keys: string[]) {
 const metadata = getMetadataRecord(notification.metadata);
 if (!metadata) return null;
 for (const key of keys) {
  const value = metadata[key];
  if (typeof value === "string" && value.trim()) return value.trim();
 }
 return null;
}

function getQuotedText(value: string) {
 return value.match(/"([^"]+)"/)?.[1] ?? null;
}

function cleanNotificationMessage(message: string) {
 return message
  .replaceAll("Agrego", "Agregó").replaceAll("agrego", "agregó")
  .replaceAll("Creo", "Creó").replaceAll("creo", "creó")
  .replaceAll("Leida", "Leída").replaceAll("asigno", "asignó")
  .replaceAll("Asignacion", "Asignación").replaceAll("asignacion", "asignación")
  .replaceAll("esta disponible", "está disponible").replaceAll("esta activo", "está activo")
  .replaceAll("nutricion", "nutrición").replaceAll("alimentacion", "alimentación")
  .replaceAll("habitos", "hábitos").replaceAll("habito", "hábito")
  .replaceAll("actualizacion", "actualización").replaceAll("actualizo", "actualizó")
  .replaceAll("registro", "registró").replaceAll("conservo", "conservó")
  .replaceAll("finalizo", "finalizó").replaceAll("completo", "completó");
}

export function getNotificationCategory(notification: AppNotification): NotificationCategory {
 const destination = notification.destination_path;
 const eventType = notification.event_type;
 if (eventType.startsWith("chat_") || destination.includes("chat=")) return "messages";
 if (eventType.startsWith("appointment_") || destination.startsWith("/app/calendario")) return "calendar";
 if (eventType === "resource_available" || eventType.includes("_resource_") || destination.startsWith("/app/recursos") || destination.startsWith("/app/nutricion/biblioteca")) return "resources";
 if (eventType.startsWith("routine_") || eventType.startsWith("workout_") || eventType.startsWith("training_") || destination.startsWith("/app/entrenamiento")) return "training";
 if (eventType === "progress_recorded") return getMetadataString(notification, ["area"]) === "nutrition" ? "nutrition" : "training";
 if (eventType.startsWith("nutrition_") || destination.startsWith("/app/nutricion")) return "nutrition";
 return "general";
}

export function getDestinationLabel(notification: AppNotification) {
 const destination = notification.destination_path;
 if (destination.startsWith("/app/recursos")) return "Abrirá Recursos";
 if (destination.startsWith("/app/nutricion/habitos")) return "Abrirá Hábitos de nutrición";
 if (destination.startsWith("/app/nutricion/biblioteca")) return "Abrirá Recursos";
 if (destination.startsWith("/app/nutricion/asignaciones")) return "Abrirá Asignaciones de nutrición";
 if (destination.startsWith("/app/nutricion")) return "Abrirá Plan de alimentación";
 if (destination.startsWith("/app/entrenamiento/historial")) return "Abrirá Historial de entrenamiento";
 if (destination.startsWith("/app/entrenamiento/plantillas")) return "Abrirá Plantillas";
 if (destination.startsWith("/app/entrenamiento/rutinas")) return "Abrirá Rutinas";
 if (destination.startsWith("/app/entrenamiento")) return "Abrirá Entrenamiento";
 if (destination.startsWith("/app/progreso")) return "Abrirá Progreso";
 if (destination.startsWith("/app/calendario")) return "Abrirá Calendario";
 if (destination.includes("chat=")) return "Abrirá Mensajes";
 if (destination.startsWith("/app/clientes/")) return "Abrirá Cliente";
 if (destination.startsWith("/app/dashboard")) return "Abrirá Dashboard";
 return "Abrirá la sección relacionada";
}

function getResourceAreaMessage(notification: AppNotification, hasNutrition: boolean, hasTraining: boolean) {
 const area = getMetadataString(notification, ["area", "service_area", "resource_area"]);
 if (area === "training" || (hasTraining && !hasNutrition)) return "Tienes nuevos recursos para tu entrenamiento.";
 if (area === "nutrition" || (hasNutrition && !hasTraining)) return "Tienes nuevos recursos de nutrición.";
 return "Tienes nuevos recursos disponibles.";
}

function getClientNotificationMessage(notification: AppNotification, assignedNutritionistName: string | null, assignedTrainerName: string | null, hasNutrition: boolean, hasTraining: boolean) {
 const trainerLabel = assignedTrainerName ?? "Tu profesional de entrenamiento";
 const nutritionistLabel = assignedNutritionistName ?? "Tu profesional de nutrición";
 const title = getMetadataString(notification, ["templateName", "template_name", "routineName", "routine_name", "title", "name"]) ?? getQuotedText(notification.message);

 switch (notification.event_type) {
  case "workout_template_assigned": return title ? `${trainerLabel} te asignó la plantilla "${title}".` : `${trainerLabel} te asignó una plantilla.`;
  case "workout_template_unassigned": return title ? `La plantilla "${title}" se archivó en tu historial.` : "Tu plantilla se archivó en tu historial.";
  case "workout_template_updated": return "Tu entrenamiento fue actualizado.";
  case "routine_assigned": return title ? `${trainerLabel} te asignó el entrenamiento "${title}".` : `${trainerLabel} te asignó un entrenamiento.`;
  case "routine_unassigned": return title ? `El entrenamiento "${title}" se archivó en tu historial.` : "Tu entrenamiento se archivó en tu historial.";
  case "training_plan_activated": return "Tu plan de entrenamiento está activo.";
  case "training_plan_deactivated": return "Tu plan de entrenamiento fue desactivado.";
  case "training_professional_changed":
  case "training_professional_assigned": return assignedTrainerName ? `${assignedTrainerName} es tu profesional de entrenamiento.` : "Tu profesional de entrenamiento fue actualizado.";
  case "resource_available": return getResourceAreaMessage(notification, hasNutrition, hasTraining);
  case "nutrition_plan_assigned": return `${nutritionistLabel} te asignó un plan de nutrición.`;
  case "nutrition_plan_archived": return "Tu plan de nutrición se archivó en tu historial.";
  case "nutrition_plan_activated": return "Tu plan de nutrición está activo.";
  case "nutrition_plan_deactivated": return "Tu plan de nutrición fue desactivado.";
  case "nutrition_meal_plan_assigned": return `${nutritionistLabel} compartió un nuevo plan de alimentación.`;
  case "nutrition_meal_plan_updated": return "Tu plan de alimentación fue actualizado.";
  case "nutrition_meal_plan_deactivated": return "Tu plan de alimentación fue desactivado.";
  case "nutrition_educational_resource_created": return "Hay un nuevo recurso educativo en Recursos.";
  case "nutrition_educational_resource_updated": return "Se actualizó un recurso educativo en Recursos.";
  case "nutrition_habit_assigned": return `${nutritionistLabel} te asignó un nuevo hábito de nutrición.`;
  case "nutrition_habit_updated": return "Se actualizó un hábito de nutrición que tienes asignado.";
  case "nutrition_habit_removed": return "Un hábito de nutrición fue desactivado de tu plan.";
  case "nutrition_habit_progress_perfect": return "Completaste todos tus hábitos de hoy.";
  case "nutrition_professional_changed":
  case "nutrition_professional_assigned": return assignedNutritionistName ? `${assignedNutritionistName} es tu nutricionista.` : "Tu profesional de nutrición fue actualizado.";
  default:
   if (notification.event_type.startsWith("workout_") || notification.event_type.startsWith("routine_") || notification.event_type.startsWith("training_")) return "Tu entrenamiento fue actualizado.";
   return cleanNotificationMessage(notification.message);
 }
}

export function getNotificationMessage(notification: AppNotification, viewer: NotificationViewer, assignedNutritionistName: string | null, assignedTrainerName: string | null, hasNutrition: boolean, hasTraining: boolean) {
 return viewer === "client" ? getClientNotificationMessage(notification, assignedNutritionistName, assignedTrainerName, hasNutrition, hasTraining) : cleanNotificationMessage(notification.message);
}

export function getEmptyMessage(viewer: NotificationViewer, assignedNutritionistName: string | null, assignedTrainerName: string | null, hasNutrition: boolean, hasTraining: boolean) {
 if (viewer !== "client") return "No tienes notificaciones por ahora. La actividad reciente aparecerá aquí.";
 if (hasTraining && !hasNutrition) return `No tienes notificaciones por ahora. ${assignedTrainerName ?? "Tu profesional de entrenamiento"} te avisará aquí cuando haya cambios en tu entrenamiento o recursos nuevos.`;
 if (hasNutrition && !hasTraining) return `No tienes notificaciones por ahora. ${assignedNutritionistName ?? "Tu profesional de nutrición"} te avisará aquí cuando haya cambios en tu plan o recursos nuevos.`;
 return "No tienes notificaciones por ahora. Aquí verás avisos sobre tus planes, calendario y recursos.";
}

export function getFilterEmptyMessage(filter: NotificationFilter) {
 switch (filter) {
  case "unread": return "No tienes notificaciones sin leer.";
  case "nutrition": return "No hay notificaciones de nutrición en este momento.";
  case "training": return "No hay notificaciones de entrenamiento en este momento.";
  case "resources": return "No hay notificaciones de recursos en este momento.";
  case "calendar": return "No hay notificaciones de calendario en este momento.";
  case "messages": return "No hay notificaciones de mensajes en este momento.";
  default: return "No hay notificaciones para este filtro.";
 }
}

export function getNotificationCount(notifications: AppNotification[]) {
 return notifications.reduce((total, notification) => total + notification.groupCount, 0);
}

export function getUnreadCount(notifications: AppNotification[]) {
 return notifications.reduce((total, notification) => total + notification.groupUnreadCount, 0);
}

export function getTabs(notifications: AppNotification[]): NotificationTab[] {
 const counts = notifications.reduce((acc, notification) => {
  acc[getNotificationCategory(notification)] += notification.groupCount;
  return acc;
 }, { calendar: 0, general: 0, messages: 0, nutrition: 0, resources: 0, training: 0 } satisfies Record<NotificationCategory, number>);

 return [
  { id: "all", label: "Todas", count: getNotificationCount(notifications) },
  { id: "unread", label: "Sin leer", count: getUnreadCount(notifications) },
  { id: "nutrition", label: "Nutrición", count: counts.nutrition },
  { id: "training", label: "Entrenamiento", count: counts.training },
  { id: "resources", label: "Recursos", count: counts.resources },
  { id: "calendar", label: "Calendario", count: counts.calendar },
  ...(counts.messages > 0 ? [{ id: "messages" as const, label: "Mensajes", count: counts.messages }] : []),
 ];
}

export function filterNotifications(notifications: AppNotification[], filter: NotificationFilter) {
 if (filter === "all") return notifications;
 if (filter === "unread") return notifications.filter((notification) => notification.groupUnreadCount > 0);
 return notifications.filter((notification) => getNotificationCategory(notification) === filter);
}

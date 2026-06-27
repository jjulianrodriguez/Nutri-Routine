"use client";

import {
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  Dumbbell,
  HeartPulse,
  Leaf,
  LoaderCircle,
  MessageCircle,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { EmptyState } from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications";
import type { AppNotification } from "@/lib/notifications/data";
import { cn } from "@/lib/utils";

type EventPresentation = {
  icon: LucideIcon;
  label: string;
};

type NotificationViewer = "client" | "professional";

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

  if (eventType === "resource_available") {
    return { icon: Bell, label: "Recurso" };
  }

  return DEFAULT_PRESENTATION;
}

function getMetadataRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getMetadataString(
  notification: AppNotification,
  keys: string[],
) {
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
        ? `${trainerLabel} te asigno la plantilla "${title}".`
        : `${trainerLabel} te asigno una plantilla.`;
    case "workout_template_unassigned":
      return title
        ? `La plantilla "${title}" se archivo en tu historial.`
        : "Tu plantilla se archivo en tu historial.";
    case "workout_template_updated":
      return "Tu entrenamiento fue actualizado.";
    case "routine_assigned":
      return title
        ? `${trainerLabel} te asigno el entrenamiento "${title}".`
        : `${trainerLabel} te asigno un entrenamiento.`;
    case "routine_unassigned":
      return title
        ? `El entrenamiento "${title}" se archivo en tu historial.`
        : "Tu entrenamiento se archivo en tu historial.";
    case "training_plan_activated":
      return "Tu plan de entrenamiento esta activo.";
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
      return `${nutritionistLabel} compartio un nuevo plan de alimentacion.`;
    case "nutrition_meal_plan_updated":
      return "Tu plan de alimentacion fue actualizado.";
    case "nutrition_meal_plan_deactivated":
      return "Tu plan de alimentacion fue desactivado.";
    case "nutrition_educational_resource_created":
      return "Hay un nuevo recurso educativo en tu biblioteca.";
    case "nutrition_educational_resource_updated":
      return "Se actualizo un recurso educativo de tu biblioteca.";
    case "nutrition_habit_assigned":
      return `${nutritionistLabel} te asigno un nuevo habito de nutricion.`;
    case "nutrition_habit_updated":
      return "Se actualizo un habito de nutricion que tienes asignado.";
    case "nutrition_habit_removed":
      return "Un habito de nutricion fue desactivado de tu plan.";
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

      return notification.message;
  }
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter(
    (notification) => notification.read_at === null,
  ).length;

  function openNotification(notificationId: string) {
    setActiveId(notificationId);
    setFeedback(null);

    startTransition(async () => {
      const result = await markNotificationRead(notificationId);

      if (result.status === "error" || !result.destination) {
        setFeedback(result.message);
        setActiveId(null);
        return;
      }

      router.push(result.destination);
      router.refresh();
    });
  }

  function markAsRead(notificationId: string) {
    setActiveId(notificationId);
    setFeedback(null);

    startTransition(async () => {
      const result = await markNotificationRead(notificationId);
      setFeedback(result.status === "error" ? result.message : null);
      setActiveId(null);
      router.refresh();
    });
  }

  function markAllAsRead() {
    setActiveId("all");
    setFeedback(null);

    startTransition(async () => {
      const result = await markAllNotificationsRead();
      setFeedback(result.status === "error" ? result.message : null);
      setActiveId(null);
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return (
      <EmptyState>
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
            Marcar todas como leidas
          </Button>
        ) : null}
      </div>

      {feedback ? (
        <p
          className="rounded-control border border-danger/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive"
          role="alert"
        >
          {feedback}
        </p>
      ) : null}

      <div className="space-y-3" aria-label="Lista de notificaciones">
        {notifications.map((notification) => {
          const isUnread = notification.read_at === null;
          const presentation = getEventPresentation(notification.event_type);
          const Icon = presentation.icon;
          const isProcessing = isPending && activeId === notification.id;
          const displayMessage =
            viewer === "client"
              ? getClientNotificationMessage(
                  notification,
                  assignedNutritionistName,
                  assignedTrainerName,
                  hasNutrition,
                  hasTraining,
                )
              : notification.message;

          return (
            <article
              key={notification.id}
              className={cn(
                "flex min-w-0 flex-col gap-3 overflow-hidden rounded-[24px] border p-4 shadow-soft transition-colors sm:flex-row sm:items-center",
                isUnread
                  ? "border-primary/35 bg-primary-soft/65"
                  : "border-border bg-surface",
              )}
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-start gap-4 rounded-control text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-wait"
                onClick={() => openNotification(notification.id)}
                disabled={isPending}
                aria-label={`${presentation.label}: ${displayMessage}`}
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-full border",
                    isUnread
                      ? "border-primary/30 bg-primary text-charcoal"
                      : "border-border bg-background text-warm-brown",
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
                    <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                      {presentation.label}
                    </span>
                    {isUnread ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[0.68rem] font-extrabold text-charcoal">
                        Nueva
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-2 block break-words text-sm font-bold leading-6 text-charcoal sm:text-base">
                    {displayMessage}
                  </span>
                  <span className="mt-2 block text-xs font-semibold text-muted">
                    {notification.createdRelativeLabel} -{" "}
                    {notification.createdLabel}
                  </span>
                </span>
              </button>

              {isUnread ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => markAsRead(notification.id)}
                  disabled={isPending}
                  className="self-end sm:self-center"
                >
                  <Check className="size-4" aria-hidden="true" />
                  Marcar como leida
                </Button>
              ) : (
                <span className="self-end text-xs font-bold text-muted sm:self-center">
                  Leida
                </span>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

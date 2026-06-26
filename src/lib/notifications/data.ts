import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import {
  getUserSettings,
  notificationMatchesSettings,
} from "@/lib/user-settings/data";
import { formatAppDateTime } from "@/lib/user-settings/time";
import type { Tables } from "@/types/database";

export type AppNotification = Pick<
  Tables<"notifications">,
  | "created_at"
  | "destination_path"
  | "event_type"
  | "id"
  | "message"
  | "metadata"
  | "read_at"
> & {
  createdLabel: string;
  createdRelativeLabel: string;
};

export type NotificationListResult = {
  error?: string;
  items: AppNotification[];
};

function formatRelativeNotificationDate(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const absoluteMs = Math.abs(diffMs);
  const minutes = Math.round(absoluteMs / 60_000);
  const hours = Math.round(absoluteMs / 3_600_000);
  const days = Math.round(absoluteMs / 86_400_000);
  const weeks = Math.round(days / 7);

  if (minutes < 1) {
    return "Ahora";
  }

  if (minutes < 60) {
    return future
      ? `En ${minutes} min`
      : `Hace ${minutes} min`;
  }

  if (hours < 24) {
    return future
      ? `En ${hours} h`
      : `Hace ${hours} h`;
  }

  if (days < 14) {
    return future
      ? `En ${days} ${days === 1 ? "día" : "días"}`
      : `Hace ${days} ${days === 1 ? "día" : "días"}`;
  }

  return future
    ? `En ${weeks} ${weeks === 1 ? "semana" : "semanas"}`
    : `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
}

export const getNotifications = cache(
  async (userId: string): Promise<NotificationListResult> => {
    const supabase = await createClient();
    const [settings, notificationsResult] = await Promise.all([
      getUserSettings(userId),
      supabase
        .from("notifications")
        .select(
          "id, event_type, message, destination_path, metadata, read_at, created_at",
        )
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    const { data, error } = notificationsResult;

    if (error) {
      return {
        error: "No pudimos cargar tus notificaciones.",
        items: [],
      };
    }

    return {
      items: (data ?? [])
        .filter((notification) =>
          notificationMatchesSettings(notification.event_type, settings),
        )
        .map((notification) => ({
          ...notification,
          createdLabel: formatAppDateTime(
            notification.created_at,
            settings.timeFormat,
          ),
          createdRelativeLabel: formatRelativeNotificationDate(
            notification.created_at,
          ),
        })),
    };
  },
);

export const getUnreadNotificationCount = cache(async (userId: string) => {
  const supabase = await createClient();
  const [settings, unreadResult] = await Promise.all([
    getUserSettings(userId),
    supabase
      .from("notifications")
      .select("id, event_type")
      .eq("recipient_id", userId)
      .is("read_at", null),
  ]);
  const { data, error } = unreadResult;

  if (error) {
    return 0;
  }

  return (data ?? []).filter((notification) =>
    notificationMatchesSettings(notification.event_type, settings),
  ).length;
});

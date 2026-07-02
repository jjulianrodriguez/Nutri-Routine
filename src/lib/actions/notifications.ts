"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const NOTIFICATIONS_PATH = "/app/notificaciones";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type NotificationActionResult =
  | {
      destination?: string;
      message: string;
      status: "success";
    }
  | {
      message: string;
      status: "error";
    };

function revalidateNotificationPaths() {
  revalidatePath(NOTIFICATIONS_PATH);
  revalidatePath("/app", "layout");
}

function getUniqueNotificationIds(notificationIds: string[]) {
  return Array.from(
    new Set(
      notificationIds
        .map((notificationId) => notificationId.trim())
        .filter(Boolean),
    ),
  );
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: error ? null : user,
  };
}

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationActionResult> {
  if (!UUID_PATTERN.test(notificationId)) {
    return {
      message: "La notificación seleccionada no es válida.",
      status: "error",
    };
  }

  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return {
      message: "Debes iniciar sesión para gestionar tus notificaciones.",
      status: "error",
    };
  }

  const { data: destination, error } = await supabase.rpc(
    "mark_notification_read",
    {
      p_notification_id: notificationId,
    },
  );

  if (
    error ||
    typeof destination !== "string" ||
    !destination.startsWith("/app")
  ) {
    return {
      message: "No se pudo marcar la notificación como leída.",
      status: "error",
    };
  }

  revalidateNotificationPaths();

  return {
    destination,
    message: "Notificación marcada como leída.",
    status: "success",
  };
}

export async function markNotificationGroupRead(
  notificationIds: string[],
): Promise<NotificationActionResult> {
  const uniqueIds = getUniqueNotificationIds(notificationIds).slice(0, 20);
  const [primaryId, ...remainingIds] = uniqueIds;

  if (!primaryId || uniqueIds.some((id) => !UUID_PATTERN.test(id))) {
    return {
      message: "La notificación seleccionada no es válida.",
      status: "error",
    };
  }

  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return {
      message: "Debes iniciar sesión para gestionar tus notificaciones.",
      status: "error",
    };
  }

  const { data: destination, error } = await supabase.rpc(
    "mark_notification_read",
    {
      p_notification_id: primaryId,
    },
  );

  if (
    error ||
    typeof destination !== "string" ||
    !destination.startsWith("/app")
  ) {
    return {
      message: "No se pudo marcar la notificación como leída.",
      status: "error",
    };
  }

  if (remainingIds.length > 0) {
    const { error: groupError } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", user.id)
      .in("id", remainingIds)
      .is("read_at", null);

    if (groupError) {
      return {
        message: "No se pudo actualizar todo el grupo de notificaciones.",
        status: "error",
      };
    }
  }

  revalidateNotificationPaths();

  return {
    destination,
    message: "Notificación marcada como leída.",
    status: "success",
  };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return {
      message: "Debes iniciar sesión para gestionar tus notificaciones.",
      status: "error",
    };
  }

  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) {
    return {
      message: "No se pudieron marcar todas las notificaciones como leídas.",
      status: "error",
    };
  }

  revalidateNotificationPaths();

  return {
    message: "Todas las notificaciones quedaron marcadas como leídas.",
    status: "success",
  };
}

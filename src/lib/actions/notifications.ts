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
      message: "La notificacion seleccionada no es valida.",
      status: "error",
    };
  }

  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return {
      message: "Debes iniciar sesion para gestionar tus notificaciones.",
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
      message: "No se pudo marcar la notificacion como leida.",
      status: "error",
    };
  }

  revalidateNotificationPaths();

  return {
    destination,
    message: "Notificacion marcada como leida.",
    status: "success",
  };
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const { supabase, user } = await getAuthenticatedClient();

  if (!user) {
    return {
      message: "Debes iniciar sesion para gestionar tus notificaciones.",
      status: "error",
    };
  }

  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) {
    return {
      message: "No se pudieron marcar todas las notificaciones como leidas.",
      status: "error",
    };
  }

  revalidateNotificationPaths();

  return {
    message: "Todas las notificaciones quedaron marcadas como leidas.",
    status: "success",
  };
}

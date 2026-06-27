import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import {
  defaultUserSettings,
  normalizeUserSettingsRow,
  type UserSettingsValues,
} from "@/lib/user-settings/types";

const USER_SETTINGS_SELECT =
  "profile_id, allow_assigned_professionals_personal_info, allow_assigned_professionals_health_data, allow_assigned_professionals_sensitive_notes, notifications_enabled, notify_messages, notify_appointments, notify_plan_changes, notify_assignments, theme, text_size, reduced_motion, time_format, created_at, updated_at" as const;

export const getUserSettings = cache(
  async (profileId: string): Promise<UserSettingsValues> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_settings")
      .select(USER_SETTINGS_SELECT)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) {
      return defaultUserSettings;
    }

    return normalizeUserSettingsRow(data);
  },
);

export function notificationMatchesSettings(
  eventType: string,
  settings: UserSettingsValues,
) {
  if (!settings.notificationsEnabled) {
    return false;
  }

  if (eventType.startsWith("chat_")) {
    return settings.notifyMessages;
  }

  if (eventType.startsWith("appointment_") || eventType.includes("reminder")) {
    return settings.notifyAppointments;
  }

  if (
    eventType === "resource_available" ||
    eventType.endsWith("_assigned") ||
    eventType.includes("professional_") ||
    eventType.endsWith("_created")
  ) {
    return settings.notifyAssignments;
  }

  if (
    eventType.includes("plan_") ||
    eventType.endsWith("_updated") ||
    eventType.endsWith("_unassigned") ||
    eventType.endsWith("_deactivated") ||
    eventType.endsWith("_activated") ||
    eventType.endsWith("_archived") ||
    eventType.endsWith("_removed")
  ) {
    return settings.notifyPlanChanges;
  }

  return true;
}

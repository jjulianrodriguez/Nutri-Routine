import type { Tables } from "@/types/database";

export type AppThemePreference = "dark" | "light";
export type TextSizePreference = "large" | "normal";
export type TimeFormatPreference = "12h" | "24h";

export type UserSettingsValues = {
  allowAssignedProfessionalsHealthData: boolean;
  allowAssignedProfessionalsPersonalInfo: boolean;
  allowAssignedProfessionalsSensitiveNotes: boolean;
  notificationsEnabled: boolean;
  notifyAppointments: boolean;
  notifyAssignments: boolean;
  notifyMessages: boolean;
  notifyPlanChanges: boolean;
  reducedMotion: boolean;
  textSize: TextSizePreference;
  theme: AppThemePreference;
  timeFormat: TimeFormatPreference;
};

export const defaultUserSettings: UserSettingsValues = {
  allowAssignedProfessionalsHealthData: true,
  allowAssignedProfessionalsPersonalInfo: true,
  allowAssignedProfessionalsSensitiveNotes: true,
  notificationsEnabled: true,
  notifyAppointments: true,
  notifyAssignments: true,
  notifyMessages: true,
  notifyPlanChanges: true,
  reducedMotion: false,
  textSize: "normal",
  theme: "light",
  timeFormat: "24h",
};

export function isThemePreference(value: unknown): value is AppThemePreference {
  return value === "dark" || value === "light";
}

export function isTextSizePreference(
  value: unknown,
): value is TextSizePreference {
  return value === "large" || value === "normal";
}

export function isTimeFormatPreference(
  value: unknown,
): value is TimeFormatPreference {
  return value === "12h" || value === "24h";
}

export function normalizeUserSettingsRow(
  row: Tables<"user_settings"> | null | undefined,
): UserSettingsValues {
  if (!row) {
    return defaultUserSettings;
  }

  return {
    allowAssignedProfessionalsHealthData:
      row.allow_assigned_professionals_health_data,
    allowAssignedProfessionalsPersonalInfo:
      row.allow_assigned_professionals_personal_info,
    allowAssignedProfessionalsSensitiveNotes:
      row.allow_assigned_professionals_sensitive_notes,
    notificationsEnabled: row.notifications_enabled,
    notifyAppointments: row.notify_appointments,
    notifyAssignments: row.notify_assignments,
    notifyMessages: row.notify_messages,
    notifyPlanChanges: row.notify_plan_changes,
    reducedMotion: row.reduced_motion,
    textSize: isTextSizePreference(row.text_size)
      ? row.text_size
      : defaultUserSettings.textSize,
    theme: isThemePreference(row.theme) ? row.theme : defaultUserSettings.theme,
    timeFormat: isTimeFormatPreference(row.time_format)
      ? row.time_format
      : defaultUserSettings.timeFormat,
  };
}

export function userSettingsToRow(values: UserSettingsValues) {
  return {
    allow_assigned_professionals_health_data:
      values.allowAssignedProfessionalsHealthData,
    allow_assigned_professionals_personal_info:
      values.allowAssignedProfessionalsPersonalInfo,
    allow_assigned_professionals_sensitive_notes:
      values.allowAssignedProfessionalsSensitiveNotes,
    notifications_enabled: values.notificationsEnabled,
    notify_appointments: values.notifyAppointments,
    notify_assignments: values.notifyAssignments,
    notify_messages: values.notifyMessages,
    notify_plan_changes: values.notifyPlanChanges,
    reduced_motion: values.reducedMotion,
    text_size: values.textSize,
    theme: values.theme,
    time_format: values.timeFormat,
  };
}

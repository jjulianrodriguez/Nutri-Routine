import { z } from "zod";

export const userSettingsSchema = z.object({
  allowAssignedProfessionalsHealthData: z.boolean(),
  allowAssignedProfessionalsPersonalInfo: z.boolean(),
  allowAssignedProfessionalsSensitiveNotes: z.boolean(),
  notificationsEnabled: z.boolean(),
  notifyAppointments: z.boolean(),
  notifyAssignments: z.boolean(),
  notifyMessages: z.boolean(),
  notifyPlanChanges: z.boolean(),
  reducedMotion: z.boolean(),
  textSize: z.enum(["normal", "large"]),
  theme: z.enum(["light", "dark"]),
  timeFormat: z.enum(["24h", "12h"]),
});

export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

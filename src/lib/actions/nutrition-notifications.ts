import "server-only";

import {
 createAdminClient,
 hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import type { Json, TablesInsert } from "@/types/database";

type NutritionNotificationScope = {
 actorId: string;
 isAdmin: boolean;
};

type NotificationMetadata = Record<string, Json>;

type NutritionNotificationInput = {
 actorId: string;
 destinationPath: string;
 eventType: string;
 message: string;
 metadata?: NotificationMetadata;
};

type ClientProfileRecipient = {
 assigned_nutritionist_id: string | null;
 profile_id: string;
};

type NotificationRecipient = {
 recipient_id: string;
};

const RECENT_DEDUPE_WINDOW_MS = 5 * 60 * 1000;

function logNutritionNotificationError(label: string, error: unknown) {
 const e = error as Record<string, unknown> | null;

 console.error(label, {
 code: e?.code,
 details: e?.details,
 hint: e?.hint,
 message: e?.message,
 name: e?.name,
 });
}

function metadataValue(value: Json | undefined) {
 if (typeof value === "string") {
 return value;
 }

 if (typeof value === "number" || typeof value === "boolean") {
 return String(value);
 }

 return null;
}

export async function getNutritionClientNotificationRecipients({
 actorId,
 isAdmin,
}: NutritionNotificationScope) {
 if (!hasSupabaseAdminConfig()) {
 console.error("Nutrition notification recipients skipped: missing admin Supabase config.");
 return [];
 }

 const admin = createAdminClient();
 let query = admin
 .from("client_profiles")
 .select("profile_id, assigned_nutritionist_id")
 .not("assigned_nutritionist_id", "is", null);

 if (!isAdmin) {
 query = query.eq("assigned_nutritionist_id", actorId);
 }

 const { data, error } = await query;

 if (error) {
 logNutritionNotificationError(
 "Error loading nutrition notification recipients",
 error,
 );
 return [];
 }

 return Array.from(
 new Set(
 ((data ?? []) as ClientProfileRecipient[])
 .map((client) => client.profile_id)
 .filter((recipientId) => recipientId && recipientId !== actorId),
 ),
 );
}

export async function getAssignedHabitNotificationRecipients({
 actorId,
 habitId,
 isAdmin,
}: NutritionNotificationScope & {
 habitId: string;
}) {
 if (!hasSupabaseAdminConfig()) {
 console.error("Habit notification recipients skipped: missing admin Supabase config.");
 return [];
 }

 const admin = createAdminClient();
 const { data: assignments, error: assignmentsError } = await admin
 .from("habit_assignments")
 .select("client_id")
 .eq("habit_id", habitId)
 .eq("active", true);

 if (assignmentsError) {
 logNutritionNotificationError(
 "Error loading assigned habit notification recipients",
 assignmentsError,
 );
 return [];
 }

 const assignedClientIds = Array.from(
 new Set(
 (assignments ?? [])
 .map((assignment) => assignment.client_id)
 .filter((clientId) => clientId && clientId !== actorId),
 ),
 );

 if (assignedClientIds.length === 0 || isAdmin) {
 return assignedClientIds;
 }

 const { data: allowedClients, error: allowedClientsError } = await admin
 .from("client_profiles")
 .select("profile_id")
 .in("profile_id", assignedClientIds)
 .eq("assigned_nutritionist_id", actorId);

 if (allowedClientsError) {
 logNutritionNotificationError(
 "Error filtering assigned habit notification recipients",
 allowedClientsError,
 );
 return [];
 }

 return (allowedClients ?? []).map((client) => client.profile_id);
}

export async function createNutritionNotifications({
 actorId,
 destinationPath,
 eventType,
 message,
 metadata = {},
 recipientIds,
}: NutritionNotificationInput & {
 recipientIds: string[];
}) {
 const recipients = Array.from(
 new Set(recipientIds.filter((recipientId) => recipientId && recipientId !== actorId)),
 );

 if (recipients.length === 0) {
 return;
 }

 if (!hasSupabaseAdminConfig()) {
 console.error("Nutrition notifications skipped: missing admin Supabase config.", {
 eventType,
 recipients,
 });
 return;
 }

 const admin = createAdminClient();
 const since = new Date(Date.now() - RECENT_DEDUPE_WINDOW_MS).toISOString();
 let existingQuery = admin
 .from("notifications")
 .select("recipient_id")
 .eq("event_type", eventType)
 .in("recipient_id", recipients)
 .gte("created_at", since);

 for (const [key, value] of Object.entries(metadata)) {
 const normalizedValue = metadataValue(value);

 if (normalizedValue !== null) {
 existingQuery = existingQuery.eq(`metadata->>${key}`, normalizedValue);
 }
 }

 const { data: existingRows, error: existingError } = await existingQuery;

 if (existingError) {
 logNutritionNotificationError(
 "Error checking duplicate nutrition notifications",
 existingError,
 );
 }

 const existingRecipients = new Set(
 ((existingRows ?? []) as NotificationRecipient[]).map(
 (notification) => notification.recipient_id,
 ),
 );
 const rows: TablesInsert<"notifications">[] = recipients
 .filter((recipientId) => !existingRecipients.has(recipientId))
 .map((recipientId) => ({
 actor_id: actorId,
 destination_path: destinationPath,
 event_type: eventType,
 message,
 metadata,
 recipient_id: recipientId,
 }));

 if (rows.length === 0) {
 return;
 }

 const { error } = await admin.from("notifications").insert(rows);

 if (error) {
 logNutritionNotificationError("Error creating nutrition notifications", error);
 }
}

export async function createNutritionNotification({
 recipientId,
 ...input
}: NutritionNotificationInput & {
 recipientId: string | null | undefined;
}) {
 if (!recipientId) {
 return;
 }

 await createNutritionNotifications({
 ...input,
 recipientIds: [recipientId],
 });
}

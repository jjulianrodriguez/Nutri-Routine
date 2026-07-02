import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import {
 getUserSettings,
 notificationMatchesSettings,
} from "@/lib/user-settings/data";
import { formatAppDateTime } from "@/lib/user-settings/time";
import type { UserSettingsValues } from "@/lib/user-settings/types";
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
 groupCount: number;
 groupedIds: string[];
 groupUnreadCount: number;
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

const RECENT_GROUP_WINDOW_MS = 10 * 60 * 1000;
const GROUP_METADATA_KEYS = [
 "appointmentId",
 "assignmentId",
 "clientId",
 "conversationId",
 "date",
 "documentId",
 "habitId",
 "resourceId",
 "routineId",
 "templateId",
 "area",
] as const;

function getMetadataRecord(value: unknown) {
 if (!value || typeof value !== "object" || Array.isArray(value)) {
 return null;
 }

 return value as Record<string, unknown>;
}

function getNotificationGroupKey(
 notification: Pick<
 Tables<"notifications">,
 "destination_path" | "event_type" | "message" | "metadata"
 >,
) {
 const metadata = getMetadataRecord(notification.metadata);
 const metadataParts = GROUP_METADATA_KEYS.flatMap((key) => {
 const value = metadata?.[key];

 return typeof value === "string" && value.trim()
 ? [`${key}:${value.trim()}`]
 : [];
 });

 return [
 notification.event_type,
 notification.destination_path,
 metadataParts.length > 0
 ? metadataParts.join("|")
 : notification.message.toLowerCase(),
 ].join("::");
}

function groupRecentNotifications(
 notifications: AppNotification[],
): AppNotification[] {
 const groups: AppNotification[] = [];

 for (const notification of notifications) {
 const key = getNotificationGroupKey(notification);
 const createdAt = new Date(notification.created_at).getTime();
 const matchingGroup = groups.find((group) => {
 const groupCreatedAt = new Date(group.created_at).getTime();

 return (
 getNotificationGroupKey(group) === key &&
 Math.abs(groupCreatedAt - createdAt) <= RECENT_GROUP_WINDOW_MS
 );
 });

 if (!matchingGroup) {
 groups.push({
 ...notification,
 groupCount: 1,
 groupedIds: [notification.id],
 groupUnreadCount: notification.read_at === null ? 1 : 0,
 });
 continue;
 }

 matchingGroup.groupCount += 1;
 matchingGroup.groupedIds.push(notification.id);

 if (notification.read_at === null) {
 matchingGroup.groupUnreadCount += 1;
 }
 }

 return groups;
}

async function resolveCount(
 query: PromiseLike<{ count: number | null; error: unknown }>,
) {
 const { count, error } = await query;

 if (error) {
 return 0;
 }

 return count ?? 0;
}

function unreadNotificationCountQuery(
 supabase: Awaited<ReturnType<typeof createClient>>,
 userId: string,
) {
 return async (filters?: {
 exclude?: string[];
 or?: string[];
 }) => {
 let query = supabase
 .from("notifications")
 .select("id", { count: "exact", head: true })
 .eq("recipient_id", userId)
 .is("read_at", null);

 if (filters?.or?.length) {
 query = query.or(filters.or.join(","));
 }

 for (const pattern of filters?.exclude ?? []) {
 query = query.not("event_type", "like", pattern);
 }

 return resolveCount(query);
 };
}

async function getUnreadCountForSettings(
 userId: string,
 settings: UserSettingsValues,
) {
 if (!settings.notificationsEnabled) {
 return 0;
 }

 const supabase = await createClient();
 const countUnread = unreadNotificationCountQuery(supabase, userId);
 const total = await countUnread();

 if (
 settings.notifyAppointments &&
 settings.notifyAssignments &&
 settings.notifyMessages &&
 settings.notifyPlanChanges
 ) {
 return total;
 }

 const chatPatterns = ["chat_%"];
 const appointmentPatterns = ["appointment_%", "%reminder%"];
 const assignmentPatterns = [
 "resource_available",
 "%_assigned",
 "%professional_%",
 "%_created",
 ];
 const planPatterns = [
 "%plan_%",
 "%_updated",
 "%_unassigned",
 "%_deactivated",
 "%_activated",
 "%_archived",
 "%_removed",
 ];
 const hiddenCounts = await Promise.all([
 settings.notifyMessages
 ? Promise.resolve(0)
 : countUnread({
 or: chatPatterns.map((pattern) => `event_type.like.${pattern}`),
 }),
 settings.notifyAppointments
 ? Promise.resolve(0)
 : countUnread({
 exclude: chatPatterns,
 or: appointmentPatterns.map((pattern) => `event_type.like.${pattern}`),
 }),
 settings.notifyAssignments
 ? Promise.resolve(0)
 : countUnread({
 exclude: [...chatPatterns, ...appointmentPatterns],
 or: assignmentPatterns.map((pattern) =>
 pattern === "resource_available"
 ? "event_type.eq.resource_available"
 : `event_type.like.${pattern}`,
 ),
 }),
 settings.notifyPlanChanges
 ? Promise.resolve(0)
 : countUnread({
 exclude: [
 ...chatPatterns,
 ...appointmentPatterns,
 ...assignmentPatterns.filter(
 (pattern) => pattern !== "resource_available",
 ),
 ],
 or: planPatterns.map((pattern) => `event_type.like.${pattern}`),
 }),
 ]);

 return Math.max(
 total - hiddenCounts.reduce((sum, count) => sum + count, 0),
 0,
 );
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

 const visibleNotifications = (data ?? [])
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
 groupCount: 1,
 groupedIds: [notification.id],
 groupUnreadCount: notification.read_at === null ? 1 : 0,
 }));

 return {
 items: groupRecentNotifications(visibleNotifications),
 };
 },
);

export const getUnreadNotificationCount = cache(async (userId: string) => {
 const settings = await getUserSettings(userId);

 return getUnreadCountForSettings(userId, settings);
});

import "server-only";

import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import {
 getProfileDirectory,
 getProfileDisplayName,
 type ProfileDirectoryEntry,
} from "@/lib/auth/profile-directory";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/user-settings/data";
import { formatAppDateTime } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";
import type { Tables } from "@/types/database";

export type ChatArea = "nutrition" | "training";
export type ChatViewer = "admin" | "client" | "professional";

export type ChatTarget = {
 area: ChatArea;
 clientEmail: string | null;
 clientId: string;
 clientName: string;
 conversationId: string | null;
 key: string;
 lastMessageAt: string | null;
 lastMessagePreview: string | null;
 professionalId: string;
 professionalName: string;
 subtitle: string;
 title: string;
 unreadCount: number;
};

export type ChatMessageItem = {
 body: string;
 createdAt: string;
 createdLabel: string;
 deletedAt: string | null;
 deliveredAt: string;
 editedAt: string | null;
 id: string;
 isDeleted: boolean;
 isEdited: boolean;
 isOwn: boolean;
 readAt: string | null;
 senderId: string;
 updatedAt: string;
};

export type ChatConversationPayload = {
 area: ChatArea;
 areaLabel: string;
 clientEmail: string | null;
 clientId: string;
 clientName: string;
 conversationId: string;
 messages: ChatMessageItem[];
 professionalId: string;
 professionalName: string;
 subtitle: string;
 timeFormat: TimeFormatPreference;
 title: string;
};

export type ChatBootstrapResult =
 | {
 currentUserId: string;
 directTargetKey: string | null;
 emptyMessage: string;
 status: "success";
 targets: ChatTarget[];
 totalUnread: number;
 viewer: ChatViewer;
 }
 | {
 message: string;
 status: "error";
 };

export type ChatConversationResult =
 | {
 conversation: ChatConversationPayload;
 status: "success";
 }
 | {
 message: string;
 status: "error";
 };

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;
type ChatConversationRow = Pick<
 Tables<"chat_conversations">,
 | "area"
 | "client_id"
 | "created_at"
 | "id"
 | "last_message_at"
 | "last_message_preview"
 | "professional_id"
 | "updated_at"
>;
type ChatMessageRow = Pick<
 Tables<"chat_messages">,
 | "body"
 | "created_at"
 | "deleted_at"
 | "edited_at"
 | "id"
 | "read_at"
 | "sender_id"
 | "updated_at"
>;
type ClientAssignmentRow = Pick<
 Tables<"client_profiles">,
 "assigned_nutritionist_id" | "assigned_trainer_id" | "profile_id"
>;
type SupabaseChatError = {
 code?: string;
 details?: string | null;
 hint?: string | null;
 message?: string;
};

const UUID_PATTERN =
 /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const AREA_LABELS: Record<ChatArea, string> = {
 nutrition: "Nutrición",
 training: "Entrenamiento",
};

function isChatArea(value: unknown): value is ChatArea {
 return value === "nutrition" || value === "training";
}

function getAreaLabel(area: ChatArea) {
 return AREA_LABELS[area];
}

function targetKey({
 area,
 clientId,
 professionalId,
}: {
 area: ChatArea;
 clientId: string;
 professionalId: string;
}) {
 return `${area}:${clientId}:${professionalId}`;
}

function displayName(
 profileById: Map<string, ProfileDirectoryEntry>,
 id: string,
 fallback: string | null = null,
) {
 return getProfileDisplayName(profileById.get(id)) ?? fallback ?? "Perfil incompleto";
}

function formatMessageDate(value: string, timeFormat: TimeFormatPreference) {
 return formatAppDateTime(value, timeFormat);
}

function getConversationKey(conversation: ChatConversationRow) {
 return targetKey({
 area: conversation.area as ChatArea,
 clientId: conversation.client_id,
 professionalId: conversation.professional_id,
 });
}

function getChatErrorMessage(code?: string) {
 if (code === "42501") {
 return "No tienes permisos para acceder a esta conversación.";
 }

 if (code === "22023" || code === "23514") {
 return "Revisa el mensaje antes de enviarlo.";
 }

 if (code === "42P01" || code === "42883" || code === "42703") {
 return "El sistema de mensajes no está disponible porque falta aplicar migraciones.";
 }

 return "No pudimos completar la acción del chat. Inténtalo de nuevo.";
}

function logChatError(
 action: "conversation" | "delete" | "open" | "send" | "unread" | "update",
 error: SupabaseChatError | null | undefined,
) {
 if (!error) {
 return;
 }

 console.error(`[chat:${action}] Supabase request failed`, {
 code: error.code,
 details: error.details,
 hint: error.hint,
 message: error.message,
 });
}

async function getProfiles(profileIds: string[]) {
 const uniqueIds = Array.from(new Set(profileIds)).filter(Boolean);

 if (uniqueIds.length === 0) {
 return new Map<string, ProfileDirectoryEntry>();
 }

 return getProfileDirectory(uniqueIds, {
 includeEmails: true,
 includeProfessionalProfiles: true,
 });
}

async function getUnreadCounts(
 supabase: ServerSupabase,
 currentUserId: string,
 conversationIds: string[],
) {
 const uniqueIds = Array.from(new Set(conversationIds)).filter(Boolean);
 const counts = new Map<string, number>();

 if (uniqueIds.length === 0) {
 return counts;
 }

 const results = await Promise.all(
 uniqueIds.map(async (conversationId) => {
 const { count, error } = await supabase
 .from("chat_messages")
 .select("id", { count: "exact", head: true })
 .eq("conversation_id", conversationId)
 .neq("sender_id", currentUserId)
 .is("read_at", null);

 if (error) {
 logChatError("unread", error);
 return [conversationId, 0] as const;
 }

 return [conversationId, count ?? 0] as const;
 }),
 );

 for (const [conversationId, count] of results) {
 counts.set(conversationId, count);
 }

 return counts;
}

function sortTargets(targets: ChatTarget[]) {
 return [...targets].sort((left, right) => {
 const leftTime = left.lastMessageAt
 ? Date.parse(left.lastMessageAt)
 : Number.NaN;
 const rightTime = right.lastMessageAt
 ? Date.parse(right.lastMessageAt)
 : Number.NaN;

 if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) {
 return rightTime - leftTime;
 }

 if (Number.isFinite(leftTime)) {
 return -1;
 }

 if (Number.isFinite(rightTime)) {
 return 1;
 }

 return left.title.localeCompare(right.title, "es");
 });
}

async function listClientTargets(
 supabase: ServerSupabase,
 access: NonNullable<Awaited<ReturnType<typeof getCurrentUserAccess>>>,
): Promise<ChatTarget[]> {
 const plannedTargets: Array<{
 area: ChatArea;
 professionalId: string;
 }> = [];

 if (access.assignedTrainerId) {
 plannedTargets.push({
 area: "training",
 professionalId: access.assignedTrainerId,
 });
 }

 if (access.assignedNutritionistId) {
 plannedTargets.push({
 area: "nutrition",
 professionalId: access.assignedNutritionistId,
 });
 }

 if (plannedTargets.length === 0) {
 return [];
 }

 const [profileById, conversationsResult] = await Promise.all([
 getProfiles(
 plannedTargets.map((target) => target.professionalId),
 ),
 supabase
 .from("chat_conversations")
 .select(
 "id, client_id, professional_id, area, last_message_at, last_message_preview, created_at, updated_at",
 )
 .eq("client_id", access.userId),
 ]);
 const conversationByKey = new Map(
 ((conversationsResult.data ?? []) as ChatConversationRow[])
 .filter((conversation) => isChatArea(conversation.area))
 .map((conversation) => [getConversationKey(conversation), conversation]),
 );

 logChatError("conversation", conversationsResult.error);

 const unreadCounts = await getUnreadCounts(
 supabase,
 access.userId,
 Array.from(conversationByKey.values()).map((conversation) => conversation.id),
 );

 return plannedTargets.map((target) => {
 const key = targetKey({
 area: target.area,
 clientId: access.userId,
 professionalId: target.professionalId,
 });
 const conversation = conversationByKey.get(key);
 const professionalName = displayName(
 profileById,
 target.professionalId,
 target.area === "training"
 ? access.assignedTrainerName
 : access.assignedNutritionistName,
 );

 return {
 area: target.area,
 clientEmail: null,
 clientId: access.userId,
 clientName: access.displayName,
 conversationId: conversation?.id ?? null,
 key,
 lastMessageAt: conversation?.last_message_at ?? null,
 lastMessagePreview: conversation?.last_message_preview ?? null,
 professionalId: target.professionalId,
 professionalName,
 subtitle: getAreaLabel(target.area),
 title: professionalName,
 unreadCount: conversation ? unreadCounts.get(conversation.id) ?? 0 : 0,
 } satisfies ChatTarget;
 });
}

async function listProfessionalTargets(
 supabase: ServerSupabase,
 access: NonNullable<Awaited<ReturnType<typeof getCurrentUserAccess>>>,
): Promise<ChatTarget[]> {
 let assignmentsQuery = supabase
 .from("client_profiles")
 .select("profile_id, assigned_nutritionist_id, assigned_trainer_id");

 if (!access.isAdmin) {
 if (access.canManageNutrition && access.canManageTraining) {
 assignmentsQuery = assignmentsQuery.or(
 `assigned_nutritionist_id.eq.${access.userId},assigned_trainer_id.eq.${access.userId}`,
 );
 } else if (access.canManageNutrition) {
 assignmentsQuery = assignmentsQuery.eq(
 "assigned_nutritionist_id",
 access.userId,
 );
 } else if (access.canManageTraining) {
 assignmentsQuery = assignmentsQuery.eq(
 "assigned_trainer_id",
 access.userId,
 );
 } else {
 return [];
 }
 }

 const { data: assignments, error: assignmentsError } =
 await assignmentsQuery;

 if (assignmentsError) {
 logChatError("conversation", assignmentsError);
 return [];
 }

 const targetSeeds: Array<{
 area: ChatArea;
 clientId: string;
 professionalId: string;
 }> = [];

 for (const assignment of (assignments ?? []) as ClientAssignmentRow[]) {
 if (
 assignment.assigned_trainer_id &&
 (access.isAdmin || assignment.assigned_trainer_id === access.userId)
 ) {
 targetSeeds.push({
 area: "training",
 clientId: assignment.profile_id,
 professionalId: assignment.assigned_trainer_id,
 });
 }

 if (
 assignment.assigned_nutritionist_id &&
 (access.isAdmin || assignment.assigned_nutritionist_id === access.userId)
 ) {
 targetSeeds.push({
 area: "nutrition",
 clientId: assignment.profile_id,
 professionalId: assignment.assigned_nutritionist_id,
 });
 }
 }

 if (targetSeeds.length === 0) {
 return [];
 }

 const profileIds = targetSeeds.flatMap((target) => [
 target.clientId,
 target.professionalId,
 ]);
 const [profileById, conversationsResult] = await Promise.all([
 getProfiles(profileIds),
 access.isAdmin
 ? supabase
 .from("chat_conversations")
 .select(
 "id, client_id, professional_id, area, last_message_at, last_message_preview, created_at, updated_at",
 )
 : supabase
 .from("chat_conversations")
 .select(
 "id, client_id, professional_id, area, last_message_at, last_message_preview, created_at, updated_at",
 )
 .eq("professional_id", access.userId),
 ]);
 const conversationByKey = new Map(
 ((conversationsResult.data ?? []) as ChatConversationRow[])
 .filter((conversation) => isChatArea(conversation.area))
 .map((conversation) => [getConversationKey(conversation), conversation]),
 );

 logChatError("conversation", conversationsResult.error);

 const unreadCounts = access.isAdmin
 ? new Map<string, number>()
 : await getUnreadCounts(
 supabase,
 access.userId,
 Array.from(conversationByKey.values()).map(
 (conversation) => conversation.id,
 ),
 );

 return targetSeeds.map((target) => {
 const key = targetKey(target);
 const conversation = conversationByKey.get(key);
 const clientName = displayName(
 profileById,
 target.clientId,
 );
 const professionalName = displayName(
 profileById,
 target.professionalId,
 );

 return {
 area: target.area,
 clientEmail: profileById.get(target.clientId)?.email ?? null,
 clientId: target.clientId,
 clientName,
 conversationId: conversation?.id ?? null,
 key,
 lastMessageAt: conversation?.last_message_at ?? null,
 lastMessagePreview: conversation?.last_message_preview ?? null,
 professionalId: target.professionalId,
 professionalName,
 subtitle: getAreaLabel(target.area),
 title: clientName,
 unreadCount: conversation ? unreadCounts.get(conversation.id) ?? 0 : 0,
 } satisfies ChatTarget;
 });
}

export async function getChatBootstrap(): Promise<ChatBootstrapResult> {
 const access = await getCurrentUserAccess();

 if (!access) {
 return {
 message: "Debes iniciar sesión para abrir tus mensajes.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const viewer: ChatViewer = access.isClient
 ? "client"
 : access.isAdmin
 ? "admin"
 : "professional";
 const targets = access.isClient
 ? await listClientTargets(supabase, access)
 : await listProfessionalTargets(supabase, access);
 const sortedTargets = sortTargets(targets);
 const totalUnread = sortedTargets.reduce(
 (total, target) => total + target.unreadCount,
 0,
 );
 const emptyMessage = access.isClient
 ? "No tienes un profesional asignado o un plan activo para iniciar un chat."
 : "No hay clientes asignados disponibles para mensajes.";

 return {
 currentUserId: access.userId,
 directTargetKey:
 access.isClient && sortedTargets.length === 1
 ? sortedTargets[0].key
 : null,
 emptyMessage,
 status: "success",
 targets: sortedTargets,
 totalUnread,
 viewer,
 };
}

async function buildConversationPayload(
 supabase: ServerSupabase,
 conversationId: string,
 currentUserId: string,
): Promise<ChatConversationResult> {
 const { error: readError } = await supabase.rpc(
 "mark_chat_conversation_read",
 {
 p_conversation_id: conversationId,
 },
 );

 if (readError) {
 logChatError("conversation", readError);

 return {
 message: getChatErrorMessage(readError.code),
 status: "error",
 };
 }

 const { data: conversation, error: conversationError } = await supabase
 .from("chat_conversations")
 .select(
 "id, client_id, professional_id, area, last_message_at, last_message_preview, created_at, updated_at",
 )
 .eq("id", conversationId)
 .maybeSingle();

 if (
 conversationError ||
 !conversation ||
 !isChatArea(conversation.area)
 ) {
 logChatError("conversation", conversationError);

 return {
 message: "No pudimos cargar esta conversación.",
 status: "error",
 };
 }

 const [settings, profileById, messagesResult] = await Promise.all([
 getUserSettings(currentUserId),
 getProfiles([
 conversation.client_id,
 conversation.professional_id,
 ]),
 supabase
 .from("chat_messages")
 .select(
 "id, sender_id, body, read_at, created_at, edited_at, deleted_at, updated_at",
 )
 .eq("conversation_id", conversationId)
 .order("created_at", { ascending: false })
 .limit(200),
 ]);

 if (messagesResult.error) {
 logChatError("conversation", messagesResult.error);

 return {
 message: "No pudimos cargar el historial de mensajes.",
 status: "error",
 };
 }

 const clientName = displayName(
 profileById,
 conversation.client_id,
 );
 const professionalName = displayName(
 profileById,
 conversation.professional_id,
 );
 const messages = ((messagesResult.data ?? []) as ChatMessageRow[])
 .slice()
 .reverse()
 .map((message) => {
 const isDeleted = Boolean(message.deleted_at);

 return {
 body: isDeleted ? "Mensaje eliminado" : message.body,
 createdAt: message.created_at,
 createdLabel: formatMessageDate(message.created_at, settings.timeFormat),
 deletedAt: message.deleted_at,
 deliveredAt: message.created_at,
 editedAt: message.edited_at,
 id: message.id,
 isDeleted,
 isEdited: Boolean(message.edited_at) && !isDeleted,
 isOwn: message.sender_id === currentUserId,
 readAt: message.read_at,
 senderId: message.sender_id,
 updatedAt: message.updated_at,
 };
 });
 const viewingAsClient = currentUserId === conversation.client_id;

 return {
 conversation: {
 area: conversation.area,
 areaLabel: getAreaLabel(conversation.area),
 clientEmail: viewingAsClient
 ? null
 : profileById.get(conversation.client_id)?.email ?? null,
 clientId: conversation.client_id,
 clientName,
 conversationId: conversation.id,
 messages,
 professionalId: conversation.professional_id,
 professionalName,
 subtitle: getAreaLabel(conversation.area),
 timeFormat: settings.timeFormat,
 title: viewingAsClient ? professionalName : clientName,
 },
 status: "success",
 };
}

export async function openChatTarget({
 area,
 clientId,
 professionalId,
}: {
 area: ChatArea;
 clientId: string;
 professionalId: string;
}): Promise<ChatConversationResult> {
 const access = await getCurrentUserAccess();

 if (!access) {
 return {
 message: "Debes iniciar sesión para abrir tus mensajes.",
 status: "error",
 };
 }

 if (
 !isChatArea(area) ||
 !UUID_PATTERN.test(clientId) ||
 !UUID_PATTERN.test(professionalId)
 ) {
 return {
 message: "La conversación seleccionada no es válida.",
 status: "error",
 };
 }

 if (access.isClient && clientId !== access.userId) {
 return {
 message: "No puedes abrir conversaciones de otros clientes.",
 status: "error",
 };
 }

 if (access.isProfessional && professionalId !== access.userId) {
 return {
 message: "No puedes abrir conversaciones de otros profesionales.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const { data: conversationId, error } = await supabase.rpc(
 "ensure_chat_conversation",
 {
 p_area: area,
 p_client_id: clientId,
 p_professional_id: professionalId,
 },
 );

 if (error || typeof conversationId !== "string") {
 logChatError("open", error);

 return {
 message: getChatErrorMessage(error?.code),
 status: "error",
 };
 }

 return buildConversationPayload(supabase, conversationId, access.userId);
}

export async function getChatConversation(
 conversationId: string,
): Promise<ChatConversationResult> {
 const access = await getCurrentUserAccess();

 if (!access) {
 return {
 message: "Debes iniciar sesión para abrir tus mensajes.",
 status: "error",
 };
 }

 if (!UUID_PATTERN.test(conversationId)) {
 return {
 message: "La conversación seleccionada no es válida.",
 status: "error",
 };
 }

 const supabase = await createClient();
 return buildConversationPayload(supabase, conversationId, access.userId);
}

export async function sendChatMessage({
 body,
 conversationId,
}: {
 body: string;
 conversationId: string;
}): Promise<ChatConversationResult> {
 const access = await getCurrentUserAccess();
 const trimmedBody = body.trim();

 if (!access) {
 return {
 message: "Debes iniciar sesión para enviar mensajes.",
 status: "error",
 };
 }

 if (!UUID_PATTERN.test(conversationId)) {
 return {
 message: "La conversación seleccionada no es válida.",
 status: "error",
 };
 }

 if (trimmedBody.length === 0) {
 return {
 message: "Escribe un mensaje antes de enviarlo.",
 status: "error",
 };
 }

 if (trimmedBody.length > 4000) {
 return {
 message: "El mensaje no puede superar 4000 caracteres.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const { error } = await supabase.rpc("send_chat_message", {
 p_body: trimmedBody,
 p_conversation_id: conversationId,
 });

 if (error) {
 logChatError("send", error);

 return {
 message: getChatErrorMessage(error.code),
 status: "error",
 };
 }

 return buildConversationPayload(supabase, conversationId, access.userId);
}

export async function updateChatMessage({
 body,
 messageId,
}: {
 body: string;
 messageId: string;
}): Promise<ChatConversationResult> {
 const access = await getCurrentUserAccess();
 const trimmedBody = body.trim();

 if (!access) {
 return {
 message: "Debes iniciar sesión para editar mensajes.",
 status: "error",
 };
 }

 if (!UUID_PATTERN.test(messageId)) {
 return {
 message: "El mensaje seleccionado no es válido.",
 status: "error",
 };
 }

 if (trimmedBody.length === 0) {
 return {
 message: "No puedes guardar un mensaje vacío.",
 status: "error",
 };
 }

 if (trimmedBody.length > 4000) {
 return {
 message: "El mensaje no puede superar 4000 caracteres.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const { data: conversationId, error } = await supabase.rpc(
 "update_chat_message",
 {
 p_body: trimmedBody,
 p_message_id: messageId,
 },
 );

 if (error || typeof conversationId !== "string") {
 logChatError("update", error);

 return {
 message: getChatErrorMessage(error?.code),
 status: "error",
 };
 }

 return buildConversationPayload(supabase, conversationId, access.userId);
}

export async function deleteChatMessage(
 messageId: string,
): Promise<ChatConversationResult> {
 const access = await getCurrentUserAccess();

 if (!access) {
 return {
 message: "Debes iniciar sesión para eliminar mensajes.",
 status: "error",
 };
 }

 if (!UUID_PATTERN.test(messageId)) {
 return {
 message: "El mensaje seleccionado no es válido.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const { data: conversationId, error } = await supabase.rpc(
 "delete_chat_message",
 {
 p_message_id: messageId,
 },
 );

 if (error || typeof conversationId !== "string") {
 logChatError("delete", error);

 return {
 message: getChatErrorMessage(error?.code),
 status: "error",
 };
 }

 return buildConversationPayload(supabase, conversationId, access.userId);
}

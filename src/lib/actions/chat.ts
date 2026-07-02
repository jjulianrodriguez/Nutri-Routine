"use server";

import { revalidatePath } from "next/cache";

import {
 deleteChatMessage,
 getChatBootstrap,
 getChatConversation,
 openChatTarget,
 sendChatMessage,
 updateChatMessage,
 type ChatArea,
 type ChatBootstrapResult,
 type ChatConversationResult,
} from "@/lib/chat/data";

export type {
 ChatArea,
 ChatBootstrapResult,
 ChatConversationPayload,
 ChatConversationResult,
 ChatMessageItem,
 ChatTarget,
 ChatViewer,
} from "@/lib/chat/data";

export async function getChatBootstrapAction(): Promise<ChatBootstrapResult> {
 return getChatBootstrap();
}

export async function openChatTargetAction(input: {
 area: ChatArea;
 clientId: string;
 professionalId: string;
}): Promise<ChatConversationResult> {
 return openChatTarget(input);
}

export async function getChatConversationAction(
 conversationId: string,
): Promise<ChatConversationResult> {
 return getChatConversation(conversationId);
}

export async function sendChatMessageAction(input: {
 body: string;
 conversationId: string;
}): Promise<ChatConversationResult> {
 const result = await sendChatMessage(input);

 if (result.status === "success") {
 revalidatePath("/app", "layout");
 revalidatePath("/app/notificaciones");
 }

 return result;
}

export async function updateChatMessageAction(input: {
 body: string;
 messageId: string;
}): Promise<ChatConversationResult> {
 const result = await updateChatMessage(input);

 if (result.status === "success") {
 revalidatePath("/app", "layout");
 revalidatePath("/app/notificaciones");
 }

 return result;
}

export async function deleteChatMessageAction(
 messageId: string,
): Promise<ChatConversationResult> {
 const result = await deleteChatMessage(messageId);

 if (result.status === "success") {
 revalidatePath("/app", "layout");
 revalidatePath("/app/notificaciones");
 }

 return result;
}

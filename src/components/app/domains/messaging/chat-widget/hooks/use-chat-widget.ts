"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { type FormEvent, type RefObject, useCallback, useEffect, useMemo, useState } from "react";

import {
 deleteChatMessageAction,
 getChatBootstrapAction,
 getChatConversationAction,
 openChatTargetAction,
 sendChatMessageAction,
 updateChatMessageAction,
 type ChatConversationResult,
 type ChatMessageItem,
 type ChatTarget,
} from "@/lib/actions/chat";

import { CHAT_QUERY_KEY, UUID_PATTERN, getSuccessfulBootstrap, getSuccessfulConversation, isChatArea } from "../helpers";

export function useChatWidget(inputRef: RefObject<HTMLTextAreaElement | null>) {
 const queryClient = useQueryClient();
 const reduceMotion = useReducedMotion();
 const searchParams = useSearchParams();
 const [open, setOpen] = useState(false);
 const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
 const [activeTargetKey, setActiveTargetKey] = useState<string | null>(null);
 const [draft, setDraft] = useState("");
 const [deleteTarget, setDeleteTarget] = useState<ChatMessageItem | null>(null);
 const [editingMessage, setEditingMessage] = useState<ChatMessageItem | null>(null);
 const [feedback, setFeedback] = useState<string | null>(null);
 const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
 const bootstrapQuery = useQuery({ queryFn: getChatBootstrapAction, queryKey: [...CHAT_QUERY_KEY, "bootstrap"], refetchInterval: open ? 15_000 : 45_000, staleTime: 10_000 });
 const bootstrap = getSuccessfulBootstrap(bootstrapQuery.data);
 const totalUnread = bootstrap?.totalUnread ?? 0;
 const conversationQuery = useQuery({ enabled: open && Boolean(activeConversationId), queryFn: () => getChatConversationAction(activeConversationId ?? ""), queryKey: [...CHAT_QUERY_KEY, "conversation", activeConversationId], refetchInterval: open && activeConversationId ? 10_000 : false, staleTime: 5_000 });
 const conversation = getSuccessfulConversation(conversationQuery.data);
 const targetsByKey = useMemo(() => new Map((bootstrap?.targets ?? []).map((target) => [target.key, target])), [bootstrap?.targets]);
 const hasMultipleTargets = (bootstrap?.targets.length ?? 0) > 1;

 useEffect(() => {
  if (conversationQuery.data?.status !== "success") return;
  void queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "bootstrap"] });
 }, [conversationQuery.data, queryClient]);

 const cacheConversationResult = useCallback((result: ChatConversationResult) => {
  if (result.status === "error") {
   setFeedback(result.message);
   return false;
  }
  setFeedback(null);
  setActiveConversationId(result.conversation.conversationId);
  queryClient.setQueryData([...CHAT_QUERY_KEY, "conversation", result.conversation.conversationId], result);
  void queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "bootstrap"] });
  return true;
 }, [queryClient]);

 const openTargetMutation = useMutation({ mutationFn: openChatTargetAction, onSuccess: (result) => { cacheConversationResult(result); } });
 const shouldShowSelector = Boolean(bootstrap && bootstrap.targets.length > 0 && !activeConversationId && !conversation && !openTargetMutation.isPending);
 const sendMessageMutation = useMutation({ mutationFn: sendChatMessageAction, onSuccess: (result) => { if (cacheConversationResult(result)) setDraft(""); } });
 const updateMessageMutation = useMutation({
  mutationFn: updateChatMessageAction,
  onMutate: ({ messageId }) => setPendingMessageId(messageId),
  onSuccess: (result) => { if (cacheConversationResult(result)) { setDraft(""); setEditingMessage(null); } },
  onSettled: () => setPendingMessageId(null),
 });
 const deleteMessageMutation = useMutation({
  mutationFn: deleteChatMessageAction,
  onMutate: (messageId) => setPendingMessageId(messageId),
  onSuccess: (result, messageId) => {
   if (cacheConversationResult(result)) {
    setEditingMessage((current) => current?.id === messageId ? null : current);
    setDraft((currentDraft) => editingMessage?.id === messageId ? "" : currentDraft);
   }
  },
  onSettled: () => setPendingMessageId(null),
 });

 const selectTarget = useCallback((target: ChatTarget) => {
  setFeedback(null);
  setDeleteTarget(null);
  setDraft("");
  setEditingMessage(null);
  setPendingMessageId(null);
  setActiveTargetKey(target.key);
  if (target.conversationId) {
   setActiveConversationId(target.conversationId);
   return;
  }
  setActiveConversationId(null);
  openTargetMutation.mutate({ area: target.area, clientId: target.clientId, professionalId: target.professionalId });
 }, [openTargetMutation]);

 const startEditingMessage = useCallback((message: ChatMessageItem) => {
  if (message.isDeleted) return;
  setFeedback(null);
  setEditingMessage(message);
  setDraft(message.body);
  window.requestAnimationFrame(() => {
   inputRef.current?.focus();
   inputRef.current?.setSelectionRange(message.body.length, message.body.length);
  });
 }, [inputRef]);

 const cancelEditingMessage = useCallback(() => { setEditingMessage(null); setDraft(""); setFeedback(null); }, []);
 const requestDeleteMessage = useCallback((message: ChatMessageItem) => { if (!message.isDeleted) { setFeedback(null); setDeleteTarget(message); } }, []);

 function resetToSelector() {
  setActiveConversationId(null); setActiveTargetKey(null); setDraft(""); setDeleteTarget(null); setEditingMessage(null); setFeedback(null); setPendingMessageId(null);
 }
 function togglePanel() { setOpen((current) => !current); setFeedback(null); }
 function submitMessage(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  if (!conversation) return;
  if (!draft.trim()) {
   setFeedback(editingMessage ? "No puedes guardar un mensaje vacío." : "Escribe un mensaje antes de enviarlo.");
   return;
  }
  if (editingMessage) {
   updateMessageMutation.mutate({ body: draft, messageId: editingMessage.id });
   return;
  }
  sendMessageMutation.mutate({ body: draft, conversationId: conversation.conversationId });
 }

 useEffect(() => {
  const chatId = searchParams.get("chat");
  if (chatId && UUID_PATTERN.test(chatId)) {
   const frame = window.requestAnimationFrame(() => { setOpen(true); setActiveTargetKey(null); setDeleteTarget(null); setDraft(""); setEditingMessage(null); setPendingMessageId(null); setActiveConversationId(chatId); });
   return () => window.cancelAnimationFrame(frame);
  }
 }, [searchParams]);

 useEffect(() => {
  if (!open || !bootstrap?.directTargetKey || activeConversationId || activeTargetKey || openTargetMutation.isPending) return;
  const directTarget = targetsByKey.get(bootstrap.directTargetKey);
  if (directTarget) {
   const frame = window.requestAnimationFrame(() => selectTarget(directTarget));
   return () => window.cancelAnimationFrame(frame);
  }
 }, [activeConversationId, activeTargetKey, bootstrap?.directTargetKey, open, openTargetMutation.isPending, selectTarget, targetsByKey]);

 useEffect(() => {
  const requestedArea = searchParams.get("chatArea");
  const professionalId = searchParams.get("professional");
  if (!bootstrap || !isChatArea(requestedArea) || !professionalId || !UUID_PATTERN.test(professionalId) || openTargetMutation.isPending) return;
  const target = bootstrap.targets.find((item) => item.area === requestedArea && item.professionalId === professionalId);
  if (!target || activeTargetKey === target.key) return;
  const frame = window.requestAnimationFrame(() => { setOpen(true); selectTarget(target); });
  return () => window.cancelAnimationFrame(frame);
 }, [activeTargetKey, bootstrap, openTargetMutation.isPending, searchParams, selectTarget]);

 const title = conversation?.title ?? "Mensajes";
 const subtitle = conversation?.subtitle ?? (bootstrap?.viewer === "client" ? "Acompañamiento profesional" : "Conversaciones disponibles");
 const isComposerPending = sendMessageMutation.isPending || updateMessageMutation.isPending;

 return {
  activeTargetKey,
  bootstrap,
  bootstrapQuery,
  cancelEditingMessage,
  composerActionLabel: editingMessage ? "Guardar edición" : "Enviar mensaje",
  conversation,
  conversationQuery,
  deleteMessageMutation,
  deleteTarget,
  draft,
  editingMessage,
  feedback,
  hasMultipleTargets,
  isComposerPending,
  open,
  openTargetMutation,
  pendingMessageId,
  reduceMotion,
  requestDeleteMessage,
  resetToSelector,
  selectTarget,
  setDeleteTarget,
  setDraft,
  setOpen,
  shouldShowSelector,
  startEditingMessage,
  submitMessage,
  subtitle,
  title,
  togglePanel,
  totalUnread,
 };
}

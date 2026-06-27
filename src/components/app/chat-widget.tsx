"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Dumbbell,
  Leaf,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { DropdownMenu } from "radix-ui";

import { RelationshipBadge } from "@/components/app/relationship-badges";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  deleteChatMessageAction,
  getChatBootstrapAction,
  getChatConversationAction,
  openChatTargetAction,
  sendChatMessageAction,
  updateChatMessageAction,
  type ChatArea,
  type ChatBootstrapResult,
  type ChatConversationPayload,
  type ChatConversationResult,
  type ChatMessageItem,
  type ChatTarget,
} from "@/lib/actions/chat";
import { formatAppTime } from "@/lib/user-settings/time";
import type { TimeFormatPreference } from "@/lib/user-settings/types";
import { cn } from "@/lib/utils";

const CHAT_QUERY_KEY = ["chat"] as const;
const CHAT_TIME_ZONE = "America/Costa_Rica";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("es-CR", {
  day: "2-digit",
  month: "short",
  timeZone: CHAT_TIME_ZONE,
  year: "numeric",
});
const DAY_PARTS_FORMATTER = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "2-digit",
  timeZone: CHAT_TIME_ZONE,
  year: "numeric",
});
const AREA_META: Record<
  ChatArea,
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  nutrition: {
    icon: Leaf,
    label: "Nutrición",
  },
  training: {
    icon: Dumbbell,
    label: "Entrenamiento",
  },
};

function isChatArea(value: string | null): value is ChatArea {
  return value === "nutrition" || value === "training";
}

function getSuccessfulBootstrap(data: ChatBootstrapResult | undefined) {
  return data?.status === "success" ? data : null;
}

function getSuccessfulConversation(data: ChatConversationResult | undefined) {
  return data?.status === "success" ? data.conversation : null;
}

function getDateParts(value: Date | string) {
  const parts = DAY_PARTS_FORMATTER.formatToParts(new Date(value));
  const partByType = new Map(parts.map((part) => [part.type, part.value]));

  return {
    day: partByType.get("day") ?? "01",
    month: partByType.get("month") ?? "01",
    year: partByType.get("year") ?? "1970",
  };
}

function getDayKey(value: Date | string) {
  const parts = getDateParts(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getUtcDay(parts: ReturnType<typeof getDateParts>) {
  return Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
  );
}

function formatDaySeparator(value: string) {
  const messageParts = getDateParts(value);
  const todayParts = getDateParts(new Date());
  const diffDays = Math.round(
    (getUtcDay(todayParts) - getUtcDay(messageParts)) / 86_400_000,
  );

  if (diffDays === 0) {
    return "Hoy";
  }

  if (diffDays === 1) {
    return "Ayer";
  }

  return DAY_LABEL_FORMATTER.format(new Date(value)).replace(/\./g, "");
}

function formatMessageTime(value: string, timeFormat: TimeFormatPreference) {
  return formatAppTime(value, timeFormat);
}

function ChatStatus({
  children,
  tone = "muted",
}: {
  children: string;
  tone?: "danger" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border px-4 py-3 text-sm font-semibold leading-6",
        tone === "danger"
          ? "border-danger/20 bg-danger/5 text-danger"
          : "border-dashed border-border bg-background/70 text-muted",
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      {children}
    </div>
  );
}

function ChatLoadingState() {
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="h-14 animate-pulse rounded-[18px] border border-border bg-surface-secondary" />
      <div className="h-14 animate-pulse rounded-[18px] border border-border bg-surface-secondary" />
      <div className="h-14 animate-pulse rounded-[18px] border border-border bg-surface-secondary" />
    </div>
  );
}

function ChatTargetButton({
  onSelect,
  target,
}: {
  onSelect: (target: ChatTarget) => void;
  target: ChatTarget;
}) {
  const meta = AREA_META[target.area];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(target)}
      className="group flex w-full min-w-0 items-start gap-3 rounded-[18px] border border-border bg-background/72 p-3 text-left shadow-soft transition hover:border-primary/35 hover:bg-primary-soft/55 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-primary/20 bg-surface text-warm-brown group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-sm font-extrabold text-charcoal">
            {target.title}
          </span>
          {target.unreadCount > 0 ? (
            <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-accent px-1.5 py-0.5 text-[0.65rem] font-extrabold leading-none text-charcoal">
              {target.unreadCount > 99 ? "99+" : target.unreadCount}
            </span>
          ) : null}
        </span>
        {target.clientEmail ? (
          <span className="mt-1 block truncate text-xs font-semibold text-muted">
            {target.clientEmail}
          </span>
        ) : null}
        <span className="mt-2 flex flex-wrap gap-2">
          <RelationshipBadge className="px-2 py-0.5 text-[0.65rem]" tone="primary">
            {target.subtitle}
          </RelationshipBadge>
        </span>
        <span className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-warm-brown">
          {target.lastMessagePreview ?? "Abrir conversación"}
        </span>
      </span>
    </button>
  );
}

function MessageActionsMenu({
  disabled,
  onDelete,
  onEdit,
}: {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Acciones del mensaje"
          disabled={disabled}
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-primary/15 bg-surface/82 text-warm-brown shadow-soft transition hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-[120] min-w-44 rounded-[18px] border border-border bg-surface/90 p-1.5 shadow-premium backdrop-blur-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DropdownMenu.Item
            disabled={disabled}
            onSelect={onEdit}
            className="flex min-h-10 cursor-default select-none items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-charcoal outline-none transition-colors focus:bg-primary-soft focus:text-charcoal data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Pencil className="size-4" aria-hidden="true" />
            <span>Editar mensaje</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={disabled}
            onSelect={onDelete}
            className="flex min-h-10 cursor-default select-none items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-danger outline-none transition-colors focus:bg-danger/10 focus:text-danger data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            <span>Eliminar mensaje</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ChatMessages({
  conversation,
  editingMessageId,
  onDeleteMessage,
  onEditMessage,
  pendingMessageId,
}: {
  conversation: ChatConversationPayload;
  editingMessageId: string | null;
  onDeleteMessage: (message: ChatMessageItem) => void;
  onEditMessage: (message: ChatMessageItem) => void;
  pendingMessageId: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      behavior: "smooth",
      top: scrollRef.current.scrollHeight,
    });
  }, [conversation.conversationId, conversation.messages.length]);

  if (conversation.messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-end px-4 py-4">
        <ChatStatus>
          Todavía no hay mensajes. Escribe el primero para iniciar la conversación.
        </ChatStatus>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
      aria-label="Historial de mensajes"
    >
      {conversation.messages.map((message, index) => {
        const dayKey = getDayKey(message.createdAt);
        const previousMessage = conversation.messages[index - 1];
        const showDaySeparator =
          !previousMessage || getDayKey(previousMessage.createdAt) !== dayKey;
        const deliveryIndicator = message.isOwn
          ? message.readAt
            ? "✓✓"
            : message.deliveredAt
              ? "✓"
              : null
          : null;

        return (
          <Fragment key={message.id}>
            {showDaySeparator ? (
              <div className="flex justify-center py-1">
                <span className="rounded-full border border-border bg-surface/88 px-3 py-1 text-[0.68rem] font-extrabold text-muted shadow-soft backdrop-blur">
                  {formatDaySeparator(message.createdAt)}
                </span>
              </div>
            ) : null}
            <article
              className={cn(
                "group flex items-start gap-1.5",
                message.isOwn ? "justify-end" : "justify-start",
              )}
            >
              {message.isOwn && !message.isDeleted ? (
                <MessageActionsMenu
                  disabled={Boolean(pendingMessageId)}
                  onDelete={() => onDeleteMessage(message)}
                  onEdit={() => onEditMessage(message)}
                />
              ) : null}
              <div
                className={cn(
                  "min-w-[7.5rem] max-w-[82%] rounded-[18px] border px-3.5 py-2 shadow-soft transition",
                  message.isOwn
                    ? "border-primary/20 bg-primary text-primary-foreground"
                    : "border-border bg-background text-charcoal",
                  message.isDeleted && "opacity-75",
                  editingMessageId === message.id && "ring-3 ring-primary/25",
                  pendingMessageId === message.id && "opacity-60",
                )}
              >
                <p
                  className={cn(
                    "whitespace-pre-wrap break-words text-sm font-semibold leading-5",
                    message.isDeleted && "italic",
                  )}
                >
                  {message.body}
                </p>
                <div
                  className={cn(
                    "mt-0.5 flex items-center gap-1.5 text-[0.68rem] font-bold",
                    message.isOwn
                      ? "justify-end text-primary-foreground/72"
                      : "justify-start text-muted",
                  )}
                >
                  <span className="min-w-0 truncate">
                    {formatMessageTime(
                      message.createdAt,
                      conversation.timeFormat,
                    )}
                    {message.isEdited ? " · editado" : ""}
                  </span>
                  {deliveryIndicator ? (
                    <span
                      aria-label={message.readAt ? "Visto" : "Entregado"}
                      title={message.readAt ? "Visto" : "Entregado"}
                      className="shrink-0 text-[0.72rem] leading-none text-primary-foreground/78"
                    >
                      {deliveryIndicator}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          </Fragment>
        );
      })}
    </div>
  );
}

export function ChatWidget() {
  const queryClient = useQueryClient();
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeTargetKey, setActiveTargetKey] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ChatMessageItem | null>(
    null,
  );
  const [editingMessage, setEditingMessage] =
    useState<ChatMessageItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const bootstrapQuery = useQuery({
    queryFn: getChatBootstrapAction,
    queryKey: [...CHAT_QUERY_KEY, "bootstrap"],
    refetchInterval: open ? 15_000 : 45_000,
    staleTime: 10_000,
  });
  const bootstrap = getSuccessfulBootstrap(bootstrapQuery.data);
  const totalUnread = bootstrap?.totalUnread ?? 0;
  const conversationQuery = useQuery({
    enabled: open && Boolean(activeConversationId),
    queryFn: () => getChatConversationAction(activeConversationId ?? ""),
    queryKey: [...CHAT_QUERY_KEY, "conversation", activeConversationId],
    refetchInterval: open && activeConversationId ? 10_000 : false,
    staleTime: 5_000,
  });
  const conversation = getSuccessfulConversation(conversationQuery.data);
  const targetsByKey = useMemo(() => {
    return new Map(
      (bootstrap?.targets ?? []).map((target) => [target.key, target]),
    );
  }, [bootstrap?.targets]);
  const hasMultipleTargets = (bootstrap?.targets.length ?? 0) > 1;

  useEffect(() => {
    if (conversationQuery.data?.status !== "success") {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: [...CHAT_QUERY_KEY, "bootstrap"],
    });
  }, [conversationQuery.data, queryClient]);

  const cacheConversationResult = useCallback(
    (result: ChatConversationResult) => {
      if (result.status === "error") {
        setFeedback(result.message);
        return false;
      }

      setFeedback(null);
      setActiveConversationId(result.conversation.conversationId);
      queryClient.setQueryData(
        [
          ...CHAT_QUERY_KEY,
          "conversation",
          result.conversation.conversationId,
        ],
        result,
      );
      void queryClient.invalidateQueries({
        queryKey: [...CHAT_QUERY_KEY, "bootstrap"],
      });

      return true;
    },
    [queryClient],
  );

  const openTargetMutation = useMutation({
    mutationFn: openChatTargetAction,
    onSuccess: (result) => {
      cacheConversationResult(result);
    },
  });
  const shouldShowSelector = Boolean(
    bootstrap &&
      bootstrap.targets.length > 0 &&
      !activeConversationId &&
      !conversation &&
      !openTargetMutation.isPending,
  );

  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessageAction,
    onSuccess: (result) => {
      if (cacheConversationResult(result)) {
        setDraft("");
      }
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: updateChatMessageAction,
    onMutate: ({ messageId }) => {
      setPendingMessageId(messageId);
    },
    onSuccess: (result) => {
      if (cacheConversationResult(result)) {
        setDraft("");
        setEditingMessage(null);
      }
    },
    onSettled: () => {
      setPendingMessageId(null);
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: deleteChatMessageAction,
    onMutate: (messageId) => {
      setPendingMessageId(messageId);
    },
    onSuccess: (result, messageId) => {
      if (cacheConversationResult(result)) {
        setEditingMessage((current) =>
          current?.id === messageId ? null : current,
        );
        setDraft((currentDraft) =>
          editingMessage?.id === messageId ? "" : currentDraft,
        );
      }
    },
    onSettled: () => {
      setPendingMessageId(null);
    },
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
    openTargetMutation.mutate({
      area: target.area,
      clientId: target.clientId,
      professionalId: target.professionalId,
    });
  }, [openTargetMutation]);

  const startEditingMessage = useCallback((message: ChatMessageItem) => {
    if (message.isDeleted) {
      return;
    }

    setFeedback(null);
    setEditingMessage(message);
    setDraft(message.body);

    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(message.body.length, message.body.length);
    });
  }, []);

  const cancelEditingMessage = useCallback(() => {
    setEditingMessage(null);
    setDraft("");
    setFeedback(null);
  }, []);

  const requestDeleteMessage = useCallback((message: ChatMessageItem) => {
    if (message.isDeleted) {
      return;
    }

    setFeedback(null);
    setDeleteTarget(message);
  }, []);

  function resetToSelector() {
    setActiveConversationId(null);
    setActiveTargetKey(null);
    setDraft("");
    setDeleteTarget(null);
    setEditingMessage(null);
    setFeedback(null);
    setPendingMessageId(null);
  }

  function togglePanel() {
    setOpen((current) => !current);
    setFeedback(null);
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversation) {
      return;
    }

    if (!draft.trim()) {
      setFeedback(
        editingMessage
          ? "No puedes guardar un mensaje vacío."
          : "Escribe un mensaje antes de enviarlo.",
      );
      return;
    }

    if (editingMessage) {
      updateMessageMutation.mutate({
        body: draft,
        messageId: editingMessage.id,
      });
      return;
    }

    sendMessageMutation.mutate({
      body: draft,
      conversationId: conversation.conversationId,
    });
  }

  useEffect(() => {
    const chatId = searchParams.get("chat");

    if (chatId && UUID_PATTERN.test(chatId)) {
      const frame = window.requestAnimationFrame(() => {
        setOpen(true);
        setActiveTargetKey(null);
        setDeleteTarget(null);
        setDraft("");
        setEditingMessage(null);
        setPendingMessageId(null);
        setActiveConversationId(chatId);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      !open ||
      !bootstrap?.directTargetKey ||
      activeConversationId ||
      activeTargetKey ||
      openTargetMutation.isPending
    ) {
      return;
    }

    const directTarget = targetsByKey.get(bootstrap.directTargetKey);

    if (directTarget) {
      const frame = window.requestAnimationFrame(() => {
        selectTarget(directTarget);
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [
    activeConversationId,
    activeTargetKey,
    bootstrap?.directTargetKey,
    open,
    openTargetMutation.isPending,
    selectTarget,
      targetsByKey,
  ]);

  useEffect(() => {
    const requestedArea = searchParams.get("chatArea");
    const professionalId = searchParams.get("professional");

    if (
      !bootstrap ||
      !isChatArea(requestedArea) ||
      !professionalId ||
      !UUID_PATTERN.test(professionalId) ||
      openTargetMutation.isPending
    ) {
      return;
    }

    const target = bootstrap.targets.find(
      (item) =>
        item.area === requestedArea && item.professionalId === professionalId,
    );

    if (!target || activeTargetKey === target.key) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setOpen(true);
      selectTarget(target);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    activeTargetKey,
    bootstrap,
    openTargetMutation.isPending,
    searchParams,
    selectTarget,
  ]);

  const title = conversation?.title ?? "Mensajes";
  const subtitle =
    conversation?.subtitle ??
    (bootstrap?.viewer === "client"
      ? "Acompañamiento profesional"
      : "Clientes asignados");
  const isComposerPending =
    sendMessageMutation.isPending || updateMessageMutation.isPending;
  const composerActionLabel = editingMessage
    ? "Guardar edición"
    : "Enviar mensaje";

  return (
    <>
      <button
        type="button"
        className="fixed bottom-20 right-5 z-30 grid size-11 place-items-center rounded-full border border-border bg-surface/82 text-warm-brown shadow-pop backdrop-blur-lg transition-[background-color,color,box-shadow,transform] hover:bg-primary hover:text-charcoal hover:shadow-glow focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
        onClick={togglePanel}
        aria-expanded={open}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        {open ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-4" aria-hidden="true" />
        )}
        {totalUnread > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-surface bg-accent px-1.5 py-0.5 text-[0.65rem] font-extrabold leading-none text-charcoal">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.section
            role="dialog"
            aria-label="Panel de mensajes"
            aria-modal="false"
            className="fixed bottom-4 left-3 right-3 top-20 z-50 flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-border bg-surface/92 shadow-premium backdrop-blur-2xl sm:left-auto sm:bottom-20 sm:right-5 sm:top-auto sm:h-[min(38rem,calc(100dvh-7rem))] sm:w-[25rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 0.72, 0.18, 1] }}
          >
            <header className="flex shrink-0 items-center gap-3 border-b border-border bg-surface/72 px-4 py-3">
              {hasMultipleTargets && conversation ? (
                <button
                  type="button"
                  onClick={resetToSelector}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-warm-brown shadow-soft hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
                  aria-label="Volver a conversaciones"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                </button>
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary-soft text-warm-brown">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-extrabold text-charcoal">
                  {title}
                </h2>
                <p className="mt-0.5 truncate text-xs font-bold text-muted">
                  {conversation?.clientEmail ?? subtitle}
                </p>
                {conversation?.clientEmail ? (
                  <p className="mt-0.5 truncate text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-background text-warm-brown shadow-soft hover:bg-primary-soft hover:text-charcoal focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25"
                aria-label="Cerrar chat"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-hidden">
              {bootstrapQuery.isLoading ? (
                <ChatLoadingState />
              ) : bootstrapQuery.data?.status === "error" ? (
                <div className="px-4 py-4">
                  <ChatStatus tone="danger">
                    {bootstrapQuery.data.message}
                  </ChatStatus>
                </div>
              ) : bootstrap && bootstrap.targets.length === 0 ? (
                <div className="px-4 py-4">
                  <ChatStatus>{bootstrap.emptyMessage}</ChatStatus>
                </div>
              ) : shouldShowSelector ? (
                <div className="min-h-0 space-y-3 overflow-y-auto px-4 py-4">
                  {bootstrap?.targets.map((target) => (
                    <ChatTargetButton
                      key={target.key}
                      target={target}
                      onSelect={selectTarget}
                    />
                  ))}
                </div>
              ) : openTargetMutation.isPending || conversationQuery.isLoading ? (
                <div className="flex h-full items-center justify-center p-6">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold text-muted shadow-soft">
                    <LoaderCircle
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                    Cargando chat...
                  </div>
                </div>
              ) : conversationQuery.data?.status === "error" ? (
                <div className="px-4 py-4">
                  <ChatStatus tone="danger">
                    {conversationQuery.data.message}
                  </ChatStatus>
                </div>
              ) : conversation ? (
                <ChatMessages
                  conversation={conversation}
                  editingMessageId={editingMessage?.id ?? null}
                  onDeleteMessage={requestDeleteMessage}
                  onEditMessage={startEditingMessage}
                  pendingMessageId={pendingMessageId}
                />
              ) : null}
            </div>

            {feedback ? (
              <p
                className="mx-4 mb-3 rounded-[16px] border border-danger/20 bg-danger/5 px-3 py-2 text-xs font-bold text-danger"
                role="alert"
              >
                {feedback}
              </p>
            ) : null}

            <form
              onSubmit={submitMessage}
              className="shrink-0 space-y-2 border-t border-border bg-surface/72 p-3"
            >
              {editingMessage ? (
                <div className="flex items-center justify-between gap-3 rounded-[16px] border border-primary/20 bg-primary-soft/65 px-3 py-2 text-xs font-bold text-warm-brown">
                  <span>Editando mensaje</span>
                  <button
                    type="button"
                    onClick={cancelEditingMessage}
                    disabled={isComposerPending}
                    className="rounded-full px-2 py-1 text-charcoal transition hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              ) : null}
              <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="chat-message-input">
                Mensaje
              </label>
              <textarea
                ref={inputRef}
                id="chat-message-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!conversation || isComposerPending}
                rows={1}
                maxLength={4000}
                placeholder={
                  conversation ? "Escribe un mensaje..." : "Selecciona un chat"
                }
                className="max-h-28 min-h-11 flex-1 rounded-[18px] border border-input bg-surface/90 px-3.5 py-2.5 text-sm font-semibold leading-6 text-charcoal shadow-soft outline-none placeholder:text-muted focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-55"
              />
              <Button
                type="submit"
                size="icon"
                disabled={
                  !conversation ||
                  isComposerPending ||
                  draft.trim().length === 0
                }
                aria-label={composerActionLabel}
              >
                {isComposerPending ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
              </Button>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteTarget(null);
          }
        }}
        title="Eliminar mensaje"
        description='Se mostrará "Mensaje eliminado" en el historial de la conversación.'
        confirmLabel="Eliminar"
        pendingLabel="Eliminando..."
        tone="destructive"
        onConfirm={async () => {
          if (!deleteTarget) {
            return;
          }

          await deleteMessageMutation.mutateAsync(deleteTarget.id);
        }}
      />
    </>
  );
}

"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Fragment, useEffect, useRef, type ReactNode } from "react";

import { RelationshipBadge } from "@/components/app/shared/relationship-badges";
import {
 AppDropdownMenu,
 AppDropdownMenuContent,
 AppDropdownMenuItem,
 AppDropdownMenuPortal,
 AppDropdownMenuTrigger,
} from "@/components/ui/overlays/app-dropdown-menu";
import type { ChatConversationPayload, ChatMessageItem, ChatTarget } from "@/lib/actions/chat";
import { cn } from "@/lib/utils";

import { formatDaySeparator, formatMessageTime, getChatInitials, getDayKey } from "./helpers";

export function ChatStatus({ children, tone = "muted" }: { children: ReactNode; tone?: "danger" | "muted" }) {
 return <div className={cn("rounded-[18px] px-4 py-3 text-sm font-semibold leading-6", tone === "danger" ? "border-danger/20 bg-danger/5 text-danger" : " bg-background/70 text-muted")} role={tone === "danger" ? "alert" : undefined}>{children}</div>;
}

export function ChatTargetButton({ isSelected, onSelect, target }: { isSelected?: boolean; onSelect: (target: ChatTarget) => void; target: ChatTarget }) {
 const isDeleted = target.lastMessagePreview === "Mensaje eliminado";
 const hasNoMessages = !target.lastMessagePreview;
 let timeLabel = "";
 if (target.lastMessageAt) {
  const date = new Date(target.lastMessageAt);
  const today = new Date();
  timeLabel = date.toDateString() === today.toDateString()
   ? date.toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit", hour12: true })
   : date.toLocaleDateString("es-CR", { day: "2-digit", month: "short" });
 }

 return (
  <button type="button" onClick={() => onSelect(target)} className={cn("group relative flex w-full min-w-0 items-center gap-3.5 overflow-hidden rounded-[20px] p-3 text-left transition-[background-color,border-color,box-shadow,color,transform] duration-300 ease-out focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 border", isSelected ? "bg-primary/5 border-primary/15 shadow-sm" : "bg-background border-transparent shadow-[0_2px_8px_rgb(0,0,0,0.04)] hover:border-primary/10 hover:bg-surface hover:shadow-md")}>
   <div className={cn("absolute bottom-3 left-0 top-3 w-1 rounded-r-full transition-[background-color,border-color,box-shadow,color,transform] duration-300 ease-out", isSelected ? "bg-primary" : "bg-transparent")} />
   <div className={cn("grid size-12 shrink-0 place-items-center rounded-full font-extrabold text-[15px] tracking-wide transition-[background-color,border-color,box-shadow,color,transform] duration-300", isSelected ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-background text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20")}>{getChatInitials(target.title)}</div>
   <div className="min-w-0 flex-1 py-0.5">
    <div className="flex items-center justify-between gap-2"><span className={cn("truncate font-extrabold tracking-tight transition-colors duration-300", isSelected ? "text-primary" : "text-foreground group-hover:text-primary/90", "text-[15px]")}>{target.title}</span>{timeLabel ? <span className={cn("shrink-0 text-[0.68rem] font-bold transition-colors duration-300", isSelected ? "text-primary/70" : target.unreadCount > 0 ? "text-primary" : "text-muted")}>{timeLabel}</span> : null}</div>
    {target.clientEmail ? <span className="mt-0.5 block truncate text-[0.7rem] font-semibold text-muted/80">{target.clientEmail}</span> : null}
    <div className="mt-1.5 flex items-center gap-2">
     <RelationshipBadge className="h-[1.125rem] shrink-0 rounded-full border-none px-2 text-[0.6rem] font-extrabold uppercase tracking-widest" tone="primary">{target.subtitle}</RelationshipBadge>
     <span className={cn("block min-w-0 flex-1 truncate text-[0.75rem] transition-colors duration-300", hasNoMessages ? "font-bold italic text-primary/70" : isDeleted ? "font-semibold italic text-muted/60" : isSelected ? "font-bold text-foreground/80" : target.unreadCount > 0 ? "font-extrabold text-foreground" : "font-semibold text-muted-foreground")}>{hasNoMessages ? "Iniciar conversación" : target.lastMessagePreview}</span>
     {target.unreadCount > 0 ? <span className="grid min-w-[1.25rem] shrink-0 place-items-center rounded-full bg-secondary px-1 py-0.5 text-[0.6rem] font-extrabold leading-none text-foreground shadow-sm">{target.unreadCount > 99 ? "99+" : target.unreadCount}</span> : null}
    </div>
   </div>
  </button>
 );
}

function MessageActionsMenu({ disabled, onDelete, onEdit }: { disabled: boolean; onDelete: () => void; onEdit: () => void }) {
 return (
  <AppDropdownMenu modal={false}>
   <AppDropdownMenuTrigger asChild><button type="button" aria-label="Acciones del mensaje" disabled={disabled} className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border-primary/15 bg-surface/82 text-muted-foreground transition hover:bg-primary-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"><MoreHorizontal className="size-4" aria-hidden="true" /></button></AppDropdownMenuTrigger>
   <AppDropdownMenuPortal><AppDropdownMenuContent data-slot="card-actions-menu" align="end" sideOffset={6} collisionPadding={12} className="z-[120] min-w-44 rounded-[18px] bg-surface/90 p-1.5 backdrop-blur-xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
    <AppDropdownMenuItem disabled={disabled} onSelect={onEdit} className="flex min-h-10 cursor-default select-none items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-foreground outline-none transition-colors focus:bg-primary-soft focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"><Pencil className="size-4" aria-hidden="true" /><span>Editar mensaje</span></AppDropdownMenuItem>
    <AppDropdownMenuItem disabled={disabled} onSelect={onDelete} className="flex min-h-10 cursor-default select-none items-center gap-3 rounded-[12px] px-3 py-2 text-sm font-bold text-danger outline-none transition-colors focus:bg-danger/10 focus:text-danger data-[disabled]:pointer-events-none data-[disabled]:opacity-50"><Trash2 className="size-4" aria-hidden="true" /><span>Eliminar mensaje</span></AppDropdownMenuItem>
   </AppDropdownMenuContent></AppDropdownMenuPortal>
  </AppDropdownMenu>
 );
}

export function ChatMessages({ conversation, editingMessageId, onDeleteMessage, onEditMessage, pendingMessageId }: { conversation: ChatConversationPayload; editingMessageId: string | null; onDeleteMessage: (message: ChatMessageItem) => void; onEditMessage: (message: ChatMessageItem) => void; pendingMessageId: string | null }) {
 const scrollRef = useRef<HTMLDivElement | null>(null);
 useEffect(() => { scrollRef.current?.scrollTo({ behavior: "smooth", top: scrollRef.current.scrollHeight }); }, [conversation.conversationId, conversation.messages.length]);

 if (conversation.messages.length === 0) return <div className="flex min-h-0 flex-1 items-end px-4 py-4"><ChatStatus>Todavía no hay mensajes. Escribe el primero para iniciar la conversación.</ChatStatus></div>;

 return (
  <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-label="Historial de mensajes">
   {conversation.messages.map((message, index) => {
    const dayKey = getDayKey(message.createdAt);
    const previousMessage = conversation.messages[index - 1];
    const showDaySeparator = !previousMessage || getDayKey(previousMessage.createdAt) !== dayKey;
    const deliveryIndicator = message.isOwn ? message.readAt ? "✓✓" : message.deliveredAt ? "✓" : null : null;
    return (
     <Fragment key={message.id}>
      {showDaySeparator ? <div className="flex justify-center py-1"><span className="rounded-full bg-surface/88 px-3 py-1 text-[0.68rem] font-extrabold text-muted backdrop-blur">{formatDaySeparator(message.createdAt)}</span></div> : null}
      <article className={cn("group flex items-start gap-1.5", message.isOwn ? "justify-end" : "justify-start")}>
       {message.isOwn && !message.isDeleted ? <MessageActionsMenu disabled={Boolean(pendingMessageId)} onDelete={() => onDeleteMessage(message)} onEdit={() => onEditMessage(message)} /> : null}
       <div className={cn("min-w-[7.5rem] max-w-[82%] rounded-[18px] px-3.5 py-2 transition", message.isOwn ? "border-primary/20 bg-primary text-primary-foreground" : " bg-background text-foreground", message.isDeleted && "opacity-75", editingMessageId === message.id && "ring-3 ring-primary/25", pendingMessageId === message.id && "opacity-60")}>
        <p className={cn("whitespace-pre-wrap break-words text-sm font-semibold leading-5", message.isDeleted && "italic")}>{message.body}</p>
        <div className={cn("mt-0.5 flex items-center gap-1.5 text-[0.68rem] font-bold", message.isOwn ? "justify-end text-primary-foreground/72" : "justify-start text-muted")}>
         <span className="min-w-0 truncate">{formatMessageTime(message.createdAt, conversation.timeFormat)}{message.isEdited ? " · editado" : ""}</span>
         {deliveryIndicator ? <span aria-label={message.readAt ? "Visto" : "Entregado"} title={message.readAt ? "Visto" : "Entregado"} className="shrink-0 text-[0.72rem] leading-none text-primary-foreground/78">{deliveryIndicator}</span> : null}
        </div>
       </div>
      </article>
     </Fragment>
    );
   })}
  </div>
 );
}

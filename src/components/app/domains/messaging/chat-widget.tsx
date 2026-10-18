"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/actions/button";
import { SkeletonBlock } from "@/components/ui/feedback/skeleton";
import { FieldLabel } from "@/components/ui/forms/form-field";
import { Textarea } from "@/components/ui/forms/textarea";
import { ConfirmationDialog } from "@/components/ui/overlays/confirmation-dialog";
import { cn } from "@/lib/utils";

import { ChatMessages, ChatStatus, ChatTargetButton } from "./chat-widget/chat-components";
import { CHAT_LOADING_ROWS } from "./chat-widget/helpers";
import { useChatWidget } from "./chat-widget/hooks/use-chat-widget";

export function ChatWidget() {
 const inputRef = useRef<HTMLTextAreaElement | null>(null);
 const chat = useChatWidget(inputRef);

 return (
  <>
   {!chat.open ? (
    <button type="button" className="fixed bottom-20 right-5 z-30 grid size-11 place-items-center rounded-full bg-surface/82 text-muted-foreground backdrop-blur-lg transition-[background-color,color,box-shadow,transform] hover:bg-primary hover:text-primary-foreground hover:shadow-soft focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25" onClick={chat.togglePanel} aria-expanded={false} aria-label="Abrir chat">
     <MessageCircle className="size-4" aria-hidden="true" />
     {chat.totalUnread > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-surface bg-secondary px-1.5 py-0.5 text-[0.65rem] font-extrabold leading-none text-foreground">{chat.totalUnread > 99 ? "99+" : chat.totalUnread}</span> : null}
    </button>
   ) : null}

   <AnimatePresence>
    {chat.open ? (
     <motion.section role="region" aria-label="Panel de mensajes" className="fixed bottom-4 left-3 right-3 top-20 z-50 flex min-h-0 flex-col overflow-hidden rounded-[28px] bg-surface sm:left-auto sm:bottom-20 sm:right-5 sm:top-auto sm:h-[min(38rem,calc(100dvh-7rem))] sm:w-[25rem]" initial={chat.reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }} transition={{ duration: 0.22, ease: [0.22, 0.72, 0.18, 1] }}>
      <header className="flex shrink-0 items-center gap-3 border-b bg-surface/72 px-4 py-3">
       {chat.hasMultipleTargets && chat.conversation ? <button type="button" onClick={chat.resetToSelector} className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground hover:bg-primary-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25" aria-label="Volver a conversaciones"><ArrowLeft className="size-4" aria-hidden="true" /></button> : <span className="grid size-9 shrink-0 place-items-center rounded-full border-primary/20 bg-primary-soft text-muted-foreground"><MessageCircle className="size-4" aria-hidden="true" /></span>}
       <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-extrabold text-foreground">{chat.title}</h2>
        <p className="mt-0.5 truncate text-xs font-bold text-muted">{chat.conversation?.clientEmail ?? chat.subtitle}</p>
        {chat.conversation?.clientEmail ? <p className="mt-0.5 truncate text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted">{chat.subtitle}</p> : null}
       </div>
       <button type="button" onClick={() => chat.setOpen(false)} className="grid size-9 shrink-0 place-items-center rounded-full bg-background text-muted-foreground hover:bg-primary-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25" aria-label="Cerrar chat"><X className="size-4" aria-hidden="true" /></button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
       {chat.bootstrapQuery.isLoading ? (
        <div className="space-y-3 px-4 py-4" aria-busy="true">{CHAT_LOADING_ROWS.map(([titleWidth, descriptionWidth], index) => <div key={index} className="rounded-card bg-background p-3"><div className="flex items-center gap-3"><SkeletonBlock shape="avatar" className="size-11" /><div className="min-w-0 flex-1"><SkeletonBlock shape="text" className={cn("h-4", titleWidth)} /><SkeletonBlock shape="text" className={cn("mt-2 h-3", descriptionWidth)} /></div></div></div>)}</div>
       ) : chat.bootstrapQuery.data?.status === "error" ? <div className="px-4 py-4"><ChatStatus tone="danger">{chat.bootstrapQuery.data.message}</ChatStatus></div>
        : chat.bootstrap && chat.bootstrap.targets.length === 0 ? <div className="px-4 py-4"><ChatStatus>{chat.bootstrap.emptyMessage}</ChatStatus></div>
        : chat.shouldShowSelector ? <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">{chat.bootstrap?.targets.map((target) => <ChatTargetButton key={target.key} target={target} isSelected={chat.activeTargetKey === target.key} onSelect={chat.selectTarget} />)}</div>
        : chat.openTargetMutation.isPending || chat.conversationQuery.isLoading ? <div className="flex h-full items-center justify-center p-6"><div className="flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-bold text-muted "><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Cargando chat...</div></div>
        : chat.conversationQuery.data?.status === "error" ? <div className="px-4 py-4"><ChatStatus tone="danger">{chat.conversationQuery.data.message}</ChatStatus></div>
        : chat.conversation ? <ChatMessages conversation={chat.conversation} editingMessageId={chat.editingMessage?.id ?? null} onDeleteMessage={chat.requestDeleteMessage} onEditMessage={chat.startEditingMessage} pendingMessageId={chat.pendingMessageId} /> : null}
      </div>

      {chat.feedback ? <p className="mx-4 mb-3 rounded-[16px] border-danger/20 bg-danger/5 px-3 py-2 text-xs font-bold text-danger" role="alert">{chat.feedback}</p> : null}
      <form onSubmit={chat.submitMessage} className="shrink-0 space-y-2 border-t bg-surface/72 p-3">
       {chat.editingMessage ? <div className="flex items-center justify-between gap-3 rounded-[16px] border-primary/20 bg-primary-tint/65 px-3 py-2 text-xs font-bold text-muted-foreground"><span>Editando mensaje</span><button type="button" onClick={chat.cancelEditingMessage} disabled={chat.isComposerPending} className="rounded-full px-2 py-1 text-foreground transition hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50">Cancelar</button></div> : null}
       <div className="flex items-end gap-2">
        <FieldLabel className="sr-only" htmlFor="chat-message-input">Mensaje</FieldLabel>
        <Textarea ref={inputRef} id="chat-message-input" value={chat.draft} onChange={(event) => chat.setDraft(event.target.value)} disabled={!chat.conversation || chat.isComposerPending} rows={1} maxLength={4000} placeholder={chat.conversation ? "Escribe un mensaje..." : "Selecciona un chat"} className="max-h-28 min-h-11 flex-1 rounded-[18px] px-3.5 py-2.5 font-semibold" resize="none" size="sm" variant="outline" />
        <Button type="submit" size="icon" disabled={!chat.conversation || chat.isComposerPending || chat.draft.trim().length === 0} aria-label={chat.composerActionLabel}>{chat.isComposerPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}</Button>
       </div>
      </form>
     </motion.section>
    ) : null}
   </AnimatePresence>

   <ConfirmationDialog open={Boolean(chat.deleteTarget)} onOpenChange={(nextOpen) => { if (!nextOpen) chat.setDeleteTarget(null); }} title="Eliminar mensaje" description={'Se mostrará "Mensaje eliminado" en el historial de la conversación.'} confirmLabel="Eliminar" pendingLabel="Eliminando..." tone="destructive" onConfirm={async () => { if (chat.deleteTarget) await chat.deleteMessageMutation.mutateAsync(chat.deleteTarget.id); }} />
  </>
 );
}

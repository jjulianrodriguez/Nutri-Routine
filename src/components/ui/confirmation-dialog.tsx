"use client";

import { CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmationDialogProps = {
 cancelLabel?: string;
 confirmLabel?: string;
 description: string;
 onConfirm: () => Promise<void> | void;
 onOpenChange: (open: boolean) => void;
 open: boolean;
 pendingLabel?: string;
 title: string;
 tone?: "default" | "destructive";
};

export function ConfirmationDialog({
 cancelLabel = "Cancelar",
 confirmLabel = "Confirmar",
 description,
 onConfirm,
 onOpenChange,
 open,
 pendingLabel = "Procesando…",
 title,
 tone = "default",
}: ConfirmationDialogProps) {
 const [isPending, setIsPending] = useState(false);
 const isDestructive = tone === "destructive";
 const Icon = isDestructive ? TriangleAlert : CircleCheck;

 function handleOpenChange(nextOpen: boolean) {
 if (!isPending) {
 onOpenChange(nextOpen);
 }
 }

 async function handleConfirm() {
 if (isPending) {
 return;
 }

 setIsPending(true);

 try {
 await onConfirm();
 } finally {
 setIsPending(false);
 onOpenChange(false);
 }
 }

 return (
 <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
 <AlertDialogPrimitive.Portal>
 <AlertDialogPrimitive.Overlay
 className={cn(
 "fixed inset-0 z-[140] bg-charcoal/55",
 "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
 "data-[state=open]:animate-in data-[state=open]:fade-in-0",
 )}
 />
 <AlertDialogPrimitive.Content
 className={cn(
 "fixed left-1/2 top-1/2 z-[150] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-card bg-surface-elevated p-5 focus-visible:outline-none sm:p-6",
 "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
 "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
 )}
 aria-busy={isPending}
 >
 <div
 className={cn(
 "grid size-12 place-items-center rounded-full",
 isDestructive
 ? "bg-danger/10 text-danger"
 : "bg-primary-soft text-primary-hover",
 )}
 >
 <Icon className="size-5" aria-hidden="true" />
 </div>

 <AlertDialogPrimitive.Title className="mt-5 break-words text-2xl font-extrabold text-foreground">
 {title}
 </AlertDialogPrimitive.Title>
 <AlertDialogPrimitive.Description className="mt-3 text-pretty text-sm leading-6 text-muted">
 {description}
 </AlertDialogPrimitive.Description>

 <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
 <AlertDialogPrimitive.Cancel asChild>
 <Button
 type="button"
 variant="outline"
 disabled={isPending}
 className="w-full sm:w-auto"
 >
 {cancelLabel}
 </Button>
 </AlertDialogPrimitive.Cancel>
 <Button
 type="button"
 variant={isDestructive ? "destructive" : "default"}
 disabled={isPending}
 onClick={handleConfirm}
 className="w-full sm:w-auto"
 >
 {isPending ? (
 <Loader2
 className="size-4 animate-spin"
 aria-hidden="true"
 />
 ) : null}
 {isPending ? pendingLabel : confirmLabel}
 </Button>
 </div>
 </AlertDialogPrimitive.Content>
 </AlertDialogPrimitive.Portal>
 </AlertDialogPrimitive.Root>
 );
}

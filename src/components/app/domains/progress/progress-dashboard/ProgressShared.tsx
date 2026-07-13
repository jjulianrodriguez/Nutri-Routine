import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { formatDate } from "./utils";

export function getProgressStatusLabel(status: string) {
 return status.trim().toLocaleLowerCase("es") === "active" ? "Activo" : status;
}

export function ProgressStatusPill({
 children,
 tone = "neutral",
}: {
 children: ReactNode;
 tone?: "good" | "neutral" | "warn";
}) {
 return (
 <span
 className={cn(
 "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold",
 tone === "good" && "bg-primary-soft text-foreground",
 tone === "neutral" && "bg-muted/10 text-muted",
 tone === "warn" && "bg-warning-soft text-warning",
 )}
 >
 {children}
 </span>
 );
}

export function ProgressPlanMeta({
 createdAt,
 description,
 status,
 title,
}: {
 createdAt: string;
 description?: string | null;
 status: string;
 title: string;
}) {
 return (
 <div className="h-fit self-start rounded-[20px] bg-background p-4">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Plan actual
 </p>
 <h3 className="mt-1 text-lg font-black text-foreground">{title}</h3>
 </div>
 <ProgressStatusPill tone={status === "active" ? "good" : "neutral"}>
 {getProgressStatusLabel(status)}
 </ProgressStatusPill>
 </div>
 {description ? (
 <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
 ) : null}
 <p className="mt-3 text-xs font-bold text-muted-foreground">
 Ultimo movimiento: {formatDate(createdAt)}
 </p>
 </div>
 );
}

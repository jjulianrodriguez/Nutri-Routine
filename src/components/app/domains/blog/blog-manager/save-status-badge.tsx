import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import type { BlogSaveStatus } from "./types";

export function SaveStatusBadge({ status }: { status: BlogSaveStatus }) {
 const config = {
  dirty: { className: "border-warning/30 bg-warning-soft text-muted-foreground", icon: AlertCircle, label: "Cambios sin guardar" },
  error: { className: "border-danger/30 bg-danger/10 text-danger", icon: AlertCircle, label: "Error al guardar" },
  idle: { className: " bg-background text-muted", icon: CheckCircle2, label: "Sin cambios pendientes" },
  saved: { className: "border-success/30 bg-success/10 text-success", icon: CheckCircle2, label: "Guardado" },
  saving: { className: "border-primary/30 bg-primary-soft text-foreground", icon: Loader2, label: "Guardando..." },
 } satisfies Record<BlogSaveStatus, { className: string; icon: typeof AlertCircle; label: string }>;
 const current = config[status];
 const Icon = current.icon;

 return (
  <span className={["inline-flex min-h-9 items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold", current.className].join(" ")} aria-live="polite">
   <Icon className={["size-3.5", status === "saving" ? "animate-spin" : ""].filter(Boolean).join(" ")} aria-hidden="true" />
   {current.label}
  </span>
 );
}

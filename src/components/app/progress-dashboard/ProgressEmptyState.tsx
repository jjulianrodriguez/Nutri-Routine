import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

export function BlockError({ message }: { message: string }) {
 return (
 <div className="flex items-start gap-3 rounded-[18px] border-warning/30 bg-warning-soft p-4 text-sm font-semibold leading-6 text-warning">
 <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
 <span>{message}</span>
 </div>
 );
}

export function ProgressEmptyState({
 action,
 description,
 title,
}: {
 action?: ReactNode;
 description: string;
 title: string;
}) {
 return (
 <div className="h-fit self-start rounded-card bg-surface-muted/60 p-5">
 <p className="font-extrabold text-foreground">{title}</p>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
 {action ? <div className="mt-4">{action}</div> : null}
 </div>
 );
}

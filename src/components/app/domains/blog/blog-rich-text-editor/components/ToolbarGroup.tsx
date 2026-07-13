import type { ReactNode } from "react";

export function ToolbarGroup({
 children,
 label,
}: {
 children: ReactNode;
 label: string;
}) {
 return (
 <div
 role="group"
 aria-label={label}
 className="inline-flex shrink-0 items-center gap-1.5 rounded-[18px] border border-border/70 bg-background p-1.5"
 >
 <span className="hidden px-1.5 text-[0.64rem] font-extrabold uppercase text-muted sm:inline">
 {label}
 </span>
 {children}
 </div>
 );
}

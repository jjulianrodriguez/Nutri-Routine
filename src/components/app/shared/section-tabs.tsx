import type { ElementType } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type SectionTabItem<TId extends string = string> = {
 count?: number;
 href?: string;
 icon?: ElementType;
 id: TId;
 label: string;
 onClick?: () => void;
};

export function SectionTabs<TId extends string = string>({
 activeId,
 ariaLabel,
 className,
 interaction = "navigation",
 items,
 size = "default",
}: {
 activeId?: TId;
 ariaLabel: string;
 className?: string;
 interaction?: "filters" | "navigation" | "tabs";
 items: SectionTabItem<TId>[];
 size?: "default" | "sm";
}) {
 const isTabInteraction = interaction === "tabs";

 return (
 <nav
 aria-label={ariaLabel}
 className={cn("flex flex-wrap gap-2", className)}
 role={isTabInteraction ? "tablist" : undefined}
 >
 {items.map((item) => {
 const Icon = item.icon;
 const isActive = activeId === item.id;
 const content = (
 <>
 {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
 <span>{item.label}</span>
 {typeof item.count === "number" ? (
 <span
 className={cn(
 "rounded-full px-2 py-0.5 text-xs",
 isActive ? "bg-surface/70 text-foreground" : "bg-surface text-muted",
 )}
 >
 {item.count}
 </span>
 ) : null}
 </>
 );
 const tabClassName = cn(
 "inline-flex shrink-0 items-center justify-center gap-2 rounded-control text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25",
 size === "default" ? "min-h-11 px-4" : "min-h-10 px-3",
 isActive
 ? "bg-primary text-primary-foreground"
 : "text-muted-foreground hover:bg-primary-soft hover:text-foreground",
 );

 if (item.href) {
 return (
 <Link
 key={item.id}
 href={item.href}
 aria-current={isActive ? "page" : undefined}
 className={tabClassName}
 >
 {content}
 </Link>
 );
 }

 return (
 <button
 key={item.id}
 type="button"
 role={isTabInteraction ? "tab" : undefined}
 aria-selected={isTabInteraction ? isActive : undefined}
 aria-pressed={interaction === "filters" ? isActive : undefined}
 className={tabClassName}
 onClick={item.onClick}
 >
 {content}
 </button>
 );
 })}
 </nav>
 );
}

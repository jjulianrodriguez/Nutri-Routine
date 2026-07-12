"use client";

import {
 Tooltip,
 TooltipContent,
 TooltipTrigger,
} from "@/components/ui/overlays/tooltip";
import { cn } from "@/lib/utils";

import type { ToolbarButtonProps } from "../types";

export function ToolbarButton({
 active = false,
 ariaExpanded,
 buttonRef,
 disabled = false,
 icon: Icon,
 label,
 onClick,
}: ToolbarButtonProps) {
 return (
 <Tooltip>
 <TooltipTrigger asChild>
 <button
 ref={buttonRef}
 type="button"
 aria-label={label}
 aria-expanded={ariaExpanded}
 aria-pressed={active}
 disabled={disabled}
 title={label}
 onMouseDown={(event) => {
 event.preventDefault();
 onClick();
 }}
 className={cn(
 "inline-flex size-10 shrink-0 items-center justify-center rounded-[14px] text-foreground transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-45",
 active
 ? "border-secondary/35 bg-primary text-primary-foreground "
 : " bg-surface text-muted hover:border-primary/40 hover:bg-primary-soft hover:text-foreground",
 )}
 >
 <Icon className="size-4" aria-hidden="true" />
 </button>
 </TooltipTrigger>
 <TooltipContent>{label}</TooltipContent>
 </Tooltip>
 );
}
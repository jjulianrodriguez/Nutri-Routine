"use client";

import { useRef } from "react";
import { Type } from "lucide-react";

import { cn } from "@/lib/utils";

import { ToolbarPopover } from "./ToolbarPopover";

const sizes = [
 { label: "10px", value: "10px" },
 { label: "12px", value: "12px" },
 { label: "14px", value: "14px" },
 { label: "16px (Normal)", value: "16px" },
 { label: "18px", value: "18px" },
 { label: "20px", value: "20px" },
 { label: "22px", value: "22px" },
 { label: "24px", value: "24px" },
 { label: "28px", value: "28px" },
 { label: "32px", value: "32px" },
 { label: "36px", value: "36px" },
 { label: "40px", value: "40px" },
 { label: "48px", value: "48px" },
 { label: "56px", value: "56px" },
 { label: "64px", value: "64px" },
];

export function SizeDropdown({
 disabled = false,
 value,
 onChange,
 isOpen,
 onOpenChange,
}: {
 disabled?: boolean;
 value: string;
 onChange: (value: string) => void;
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
}) {
 const triggerRef = useRef<HTMLButtonElement>(null);
 const currentLabel =
 sizes.find((s) => s.value === value)?.label || value || "16px (Normal)";

 return (
 <>
 <button
 ref={triggerRef}
 type="button"
 disabled={disabled}
 aria-expanded={isOpen}
 aria-haspopup="menu"
 onMouseDown={(event) => {
 event.preventDefault();
 onOpenChange(!isOpen);
 }}
 className={cn(
 "inline-flex h-10 items-center justify-between gap-1.5 rounded-[14px] bg-surface px-3 text-xs font-bold text-foreground transition-[background-color,border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft",
 disabled && "pointer-events-none opacity-45",
 )}
 >
 <Type className="size-4 text-muted" />
 <span>{currentLabel}</span>
 </button>

 <ToolbarPopover
 triggerRef={triggerRef}
 isOpen={isOpen}
 onOpenChange={onOpenChange}
 width={150}
 className="p-1.5"
 >
 {sizes.map((size) => (
 <button
 key={size.value}
 type="button"
 onMouseDown={(event) => {
 event.preventDefault();
 onChange(size.value);
 onOpenChange(false);
 }}
 className={cn(
 "flex min-h-9 w-full items-center rounded-[10px] px-3 py-1.5 text-xs font-bold transition-colors hover:bg-primary-soft hover:text-foreground",
 value === size.value || (size.value === "16px" && !value)
 ? "bg-primary-soft text-text-secondary"
 : "text-muted",
 )}
 >
 {size.label}
 </button>
 ))}
 </ToolbarPopover>
 </>
 );
}
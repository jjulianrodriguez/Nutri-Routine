"use client";

import { useRef } from "react";
import { Highlighter, Palette, X } from "lucide-react";

import { Input } from "@/components/ui/forms/input";
import { cn } from "@/lib/utils";

import { ToolbarPopover } from "./ToolbarPopover";

const textPresetColors = [
 { label: "Auto", value: "default", class: "" },
 { label: "Cereza", value: "#D93A3E", class: "bg-[#D93A3E]" },
 { label: "Cereza fuerte", value: "#A32629", class: "bg-[#A32629]" },
 { label: "Tinta", value: "#292929", class: "bg-[#292929]" },
 { label: "Pizarra", value: "#3A3A3A", class: "bg-[#3A3A3A]" },
 { label: "Neutro", value: "#5F5F5F", class: "bg-[#5F5F5F]" },
];

const highlightPresetColors = [
 { label: "Sin resaltado", value: "default", class: "" },
 { label: "Cereza", value: "#D93A3E", class: "bg-[#D93A3E]" },
 { label: "Cereza suave", value: "#F5C9CA", class: "bg-[#F5C9CA]" },
 { label: "Pizarra", value: "#3A3A3A", class: "bg-[#3A3A3A]" },
 { label: "Neblina", value: "#D8E1E8", class: "bg-[#D8E1E8]" },
 { label: "Superficie", value: "#F1F5F7", class: "bg-[#F1F5F7]" },
 { label: "Blanco", value: "#FFFFFF", class: "bg-[#FFFFFF]" },
];

export function ColorPicker({
 disabled = false,
 kind,
 value,
 onChange,
 isOpen,
 onOpenChange,
}: {
 disabled?: boolean;
 kind: "text" | "highlight";
 value: string;
 onChange: (value: string) => void;
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
}) {
 const triggerRef = useRef<HTMLButtonElement>(null);
 const hexInputValue = value && value !== "default" ? value : "";
 const isHighlight = kind === "highlight";
 const Icon = isHighlight ? Highlighter : Palette;
 const presetColors = isHighlight ? highlightPresetColors : textPresetColors;
 const fallbackColor = isHighlight ? "#F5C9CA" : "#D93A3E";
 const currentSwatchStyle =
 value && value !== "default" ? { backgroundColor: value } : undefined;

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
 "inline-flex h-10 items-center gap-1.5 rounded-[14px] bg-surface px-3 text-xs font-bold text-foreground transition-[background-color,border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft",
 disabled && "pointer-events-none opacity-45",
 )}
 >
 <Icon className="size-4 text-muted" />
 {currentSwatchStyle ? (
 <span
 className="size-3.5 rounded-full border-foreground/10"
 style={currentSwatchStyle}
 />
 ) : (
 <span className="text-[10px] font-extrabold text-muted">
 {isHighlight ? "Ninguno" : "Auto"}
 </span>
 )}
 </button>

 <ToolbarPopover
 triggerRef={triggerRef}
 isOpen={isOpen}
 onOpenChange={onOpenChange}
 width={232}
 className="p-3"
 >
 <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
 {isHighlight ? "Color de resaltado" : "Paleta de colores"}
 </p>
 <div className="grid grid-cols-5 gap-2">
 {presetColors.map((color) => (
 <button
 key={color.value}
 type="button"
 title={color.label}
 onMouseDown={(event) => {
 event.preventDefault();
 onChange(color.value);
 onOpenChange(false);
 }}
 className={cn(
 "relative flex size-6 shrink-0 items-center justify-center rounded-full transition-[border-color,box-shadow,transform] hover:border-primary/35 hover:shadow-soft active:scale-95",
 value === color.value ||
 (color.value === "default" && (!value || value === "default"))
 ? "ring-2 ring-teal ring-offset-1"
 : "",
 )}
 >
 {color.value === "default" ? (
 isHighlight ? (
 <X className="size-3 text-foreground" aria-hidden="true" />
 ) : (
 <span className="text-[9px] font-bold text-foreground">A</span>
 )
 ) : (
 <span className={cn("size-full rounded-full", color.class)} />
 )}
 </button>
 ))}
 </div>

 <div className="mt-3 border-t pt-3">
 <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
 {isHighlight ? "Resaltado personalizado" : "Color personalizado"}
 </p>
 <div className="flex items-center gap-2">
 <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-background transition-colors hover:bg-surface-hover">
 <Input
 type="color"
 value={
 value && value !== "default" && value.startsWith("#")
 ? value
 : fallbackColor
 }
 onChange={(event) => {
 onChange(event.target.value);
 }}
 className="sr-only"
 />
 <span
 className="size-5 rounded-[4px] border-foreground/10"
 style={{
 backgroundColor:
 value && value !== "default" ? value : fallbackColor,
 }}
 />
 </label>
 <Input
 type="text"
 placeholder="#HEX"
 defaultValue={hexInputValue}
 key={hexInputValue}
 onChange={(event) => {
 const nextValue = event.target.value;
 if (
 /^#[0-9A-F]{6}$/i.test(nextValue) ||
 /^#[0-9A-F]{3}$/i.test(nextValue)
 ) {
 onChange(nextValue);
 }
 }}
 className="h-8 w-full rounded-[8px] bg-background px-2 text-xs font-bold uppercase"
 size="sm"
 />
 </div>
 </div>
 </ToolbarPopover>
 </>
 );
}

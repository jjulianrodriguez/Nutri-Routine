"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { Extension, Mark, mergeAttributes, type Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
 AlignCenter,
 AlignLeft,
 AlignRight,
 Bold,
 Eraser,
 Heading1,
 Heading2,
 Heading3,
 Highlighter,
 Italic,
 LinkIcon,
 List,
 ListOrdered,
 Minus,
 Palette,
 Pilcrow,
 Quote,
 Redo2,
 Type,
 Underline,
 Undo2,
 Unlink,
 X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
 forwardRef,
 useEffect,
 useRef,
 useState,
 type CSSProperties,
 type ReactNode,
 type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { Button } from "@/components/ui/button";
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type BlogRichTextEditorProps = {
 describedBy?: string;
 disabled?: boolean;
 error?: boolean;
 id: string;
 onBlur?: () => void;
 onChange: (value: string) => void;
 value: string;
};

type ToolbarButtonProps = {
 active?: boolean;
 ariaExpanded?: boolean;
 buttonRef?: RefObject<HTMLButtonElement | null>;
 disabled?: boolean;
 icon: LucideIcon;
 label: string;
 onClick: () => void;
};

const BLOG_TEXT_ALIGNMENTS = ["left", "center", "right"] as const;
const POPOVER_COLLISION_PADDING = 12;

type BlogTextAlign = (typeof BLOG_TEXT_ALIGNMENTS)[number];

declare module "@tiptap/core" {
 interface Commands<ReturnType> {
 blogHighlight: {
 toggleBlogHighlight: () => ReturnType;
 setBlogHighlight: (color: string) => ReturnType;
 unsetBlogHighlight: () => ReturnType;
 };
 blogTextAlign: {
 setBlogTextAlign: (alignment: BlogTextAlign) => ReturnType;
 unsetBlogTextAlign: () => ReturnType;
 };
 blogTextColor: {
 setBlogTextColor: (color: string) => ReturnType;
 unsetBlogTextColor: () => ReturnType;
 };
 blogTextSize: {
 setBlogTextSize: (size: string) => ReturnType;
 unsetBlogTextSize: () => ReturnType;
 };
 }
}

function isBlogTextAlign(value: unknown): value is BlogTextAlign {
 return (
 typeof value === "string" &&
 BLOG_TEXT_ALIGNMENTS.includes(value as BlogTextAlign)
 );
}

function getClassMatch(
 element: HTMLElement,
 prefix: string,
) {
 const className = Array.from(element.classList).find((item) =>
 item.startsWith(prefix),
 );
 return className?.replace(prefix, "") || null;
}

function parseTextAlign(element: HTMLElement) {
 const classValue = getClassMatch(
 element,
 "blog-align-",
 );
 const styleValue = element.style.textAlign;

 if (isBlogTextAlign(classValue)) {
 return classValue;
 }

 return isBlogTextAlign(styleValue) ? styleValue : null;
}

const BlogTextAlignExtension = Extension.create({
 name: "blogTextAlign",

 addGlobalAttributes() {
 return [
 {
 attributes: {
 textAlign: {
 default: null,
 parseHTML: (element) => parseTextAlign(element as HTMLElement),
 renderHTML: (attributes) => {
 const textAlign = attributes.textAlign;

 return isBlogTextAlign(textAlign)
 ? { class: `blog-align-${textAlign}` }
 : {};
 },
 },
 },
 types: ["heading", "paragraph"],
 },
 ];
 },

 addCommands() {
 return {
 setBlogTextAlign:
 (alignment) =>
 ({ commands }) => {
 if (!isBlogTextAlign(alignment)) {
 return false;
 }

 return ["heading", "paragraph"]
 .map((type) =>
 commands.updateAttributes(type, { textAlign: alignment }),
 )
 .every(Boolean);
 },
 unsetBlogTextAlign:
 () =>
 ({ commands }) =>
 ["heading", "paragraph"]
 .map((type) => commands.updateAttributes(type, { textAlign: null }))
 .every(Boolean),
 };
 },
});

const BlogTextSizeExtension = Mark.create({
 name: "blogTextSize",

 addAttributes() {
 return {
 size: {
 default: null,
 parseHTML: (element) => {
 const el = element as HTMLElement;
 const styleSize = el.style.fontSize;
 if (styleSize) {
 return styleSize;
 }
 if (el.classList.contains("blog-text-large")) {
 return "20px";
 }
 if (el.classList.contains("blog-text-small")) {
 return "12px";
 }
 return null;
 },
 renderHTML: (attributes) => {
 if (!attributes.size) {
 return {};
 }
 return {
 style: `font-size: ${attributes.size}`,
 };
 },
 },
 };
 },

 parseHTML() {
 return [
 {
 tag: "span",
 getAttrs: (element) => {
 const el = element as HTMLElement;
 const hasFontSize =
 el.style.fontSize ||
 el.classList.contains("blog-text-large") ||
 el.classList.contains("blog-text-small");
 return hasFontSize ? {} : false;
 },
 },
 ];
 },

 renderHTML({ HTMLAttributes }) {
 return ["span", mergeAttributes(HTMLAttributes), 0];
 },

 addCommands() {
 return {
 setBlogTextSize:
 (size) =>
 ({ commands }) => {
 if (!size || size === "16px" || size === "default") {
 return commands.unsetMark(this.name);
 }

 return commands.setMark(this.name, { size });
 },
 unsetBlogTextSize:
 () =>
 ({ commands }) =>
 commands.unsetMark(this.name),
 };
 },
});

const BlogTextColorExtension = Mark.create({
 name: "blogTextColor",

 addAttributes() {
 return {
 color: {
 default: null,
 parseHTML: (element) => {
 const el = element as HTMLElement;
 const styleColor = el.style.color;
 if (styleColor) {
 return styleColor;
 }
 if (el.classList.contains("blog-color-teal")) {
 return "#2F5F66";
 }
 if (el.classList.contains("blog-color-accent")) {
 return "#B82D52";
 }
 if (el.classList.contains("blog-color-charcoal")) {
 return "#171417";
 }
 if (el.classList.contains("blog-color-warm")) {
 return "#6F6870";
 }
 return null;
 },
 renderHTML: (attributes) => {
 if (!attributes.color) {
 return {};
 }
 return {
 style: `color: ${attributes.color}`,
 };
 },
 },
 };
 },

 parseHTML() {
 return [
 {
 tag: "span",
 getAttrs: (element) => {
 const el = element as HTMLElement;
 const hasColor =
 el.style.color ||
 el.classList.contains("blog-color-teal") ||
 el.classList.contains("blog-color-accent") ||
 el.classList.contains("blog-color-charcoal") ||
 el.classList.contains("blog-color-warm");
 return hasColor ? {} : false;
 },
 },
 ];
 },

 renderHTML({ HTMLAttributes }) {
 return ["span", mergeAttributes(HTMLAttributes), 0];
 },

 addCommands() {
 return {
 setBlogTextColor:
 (color) =>
 ({ commands }) => {
 if (!color || color === "default") {
 return commands.unsetMark(this.name);
 }

 return commands.setMark(this.name, { color });
 },
 unsetBlogTextColor:
 () =>
 ({ commands }) =>
 commands.unsetMark(this.name),
 };
 },
});

const BlogHighlightExtension = Mark.create({
 name: "blogHighlight",

 addAttributes() {
 return {
 color: {
 default: null,
 parseHTML: (element) => {
 const el = element as HTMLElement;
 const styleBgColor = el.style.backgroundColor;
 if (styleBgColor) {
 return styleBgColor;
 }
 return null;
 },
 renderHTML: (attributes) => {
 if (!attributes.color) {
 return {};
 }
 return {
 style: `background-color: ${attributes.color}`,
 };
 },
 },
 };
 },

 parseHTML() {
 return [
 {
 tag: "span",
 getAttrs: (element) => {
 const el = element as HTMLElement;
 const hasHighlight =
 el.classList.contains("blog-highlight") ||
 el.style.backgroundColor;
 return hasHighlight ? {} : false;
 },
 },
 ];
 },

 renderHTML({ HTMLAttributes }) {
 return [
 "span",
 mergeAttributes(HTMLAttributes, { class: "blog-highlight" }),
 0,
 ];
 },

 addCommands() {
 return {
 setBlogHighlight:
 (color) =>
 ({ commands }) => {
 if (!color || color === "default") {
 return commands.unsetMark(this.name);
 }
 return commands.setMark(this.name, { color });
 },
 unsetBlogHighlight:
 () =>
 ({ commands }) =>
 commands.unsetMark(this.name),
 toggleBlogHighlight:
 () =>
 ({ commands }) =>
 commands.toggleMark(this.name),
 };
 },
});

function isAllowedEditorUrl(value: string) {
 const url = value.trim();

 return (
 /^https?:\/\//i.test(url) ||
 /^mailto:/i.test(url) ||
 /^tel:/i.test(url) ||
 (url.startsWith("/") && !url.startsWith("//")) ||
 url.startsWith("#")
 );
}

function normalizeEditorUrl(value: string) {
 const url = value.trim();

 if (!url) {
 return "";
 }

 if (isAllowedEditorUrl(url)) {
 return url;
 }

 if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(url)) {
 return `https://${url}`;
 }

 return "";
}

function ToolbarButton({
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

function getPopoverStyle(
 trigger: HTMLElement,
 width: number,
): CSSProperties {
 const rect = trigger.getBoundingClientRect();
 const viewportWidth = window.innerWidth;
 const viewportHeight = window.innerHeight;
 const popoverWidth = Math.min(
 width,
 viewportWidth - POPOVER_COLLISION_PADDING * 2,
 );
 const left = Math.min(
 Math.max(rect.left, POPOVER_COLLISION_PADDING),
 viewportWidth - popoverWidth - POPOVER_COLLISION_PADDING,
 );
 const hasRoomBelow = rect.bottom + 10 + 260 < viewportHeight;
 const top = hasRoomBelow
 ? rect.bottom + 8
 : Math.max(POPOVER_COLLISION_PADDING, rect.top - 268);

 return {
 left,
 top,
 width: popoverWidth,
 };
}

function ToolbarPopover({
 children,
 className,
 isOpen,
 onOpenChange,
 triggerRef,
 width,
}: {
 children: ReactNode;
 className?: string;
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
 triggerRef: RefObject<HTMLElement | null>;
 width: number;
}) {
 const contentRef = useRef<HTMLDivElement>(null);
 const [style, setStyle] = useState<CSSProperties | null>(null);

 useEffect(() => {
 if (!isOpen) {
 return;
 }

 const updatePosition = () => {
 const trigger = triggerRef.current;
 if (!trigger) {
 onOpenChange(false);
 return;
 }

 setStyle(getPopoverStyle(trigger, width));
 };

 updatePosition();
 window.addEventListener("resize", updatePosition);
 window.addEventListener("scroll", updatePosition, true);

 return () => {
 window.removeEventListener("resize", updatePosition);
 window.removeEventListener("scroll", updatePosition, true);
 };
 }, [isOpen, onOpenChange, triggerRef, width]);

 useEffect(() => {
 if (!isOpen) {
 return;
 }

 const handlePointerDown = (event: PointerEvent) => {
 const target = event.target;
 if (!(target instanceof Node)) {
 return;
 }

 if (
 contentRef.current?.contains(target) ||
 triggerRef.current?.contains(target)
 ) {
 return;
 }

 onOpenChange(false);
 };
 const handleKeyDown = (event: KeyboardEvent) => {
 if (event.key === "Escape") {
 onOpenChange(false);
 }
 };

 document.addEventListener("pointerdown", handlePointerDown, true);
 document.addEventListener("keydown", handleKeyDown);

 return () => {
 document.removeEventListener("pointerdown", handlePointerDown, true);
 document.removeEventListener("keydown", handleKeyDown);
 };
 }, [isOpen, onOpenChange, triggerRef]);

 if (!isOpen || !style) {
 return null;
 }

 return createPortal(
 <div
 ref={contentRef}
 className={cn(
 "fixed z-[160] max-h-[min(20rem,calc(100dvh-1.5rem))] overflow-y-auto rounded-[18px] bg-surface p-2 outline-none",
 className,
 )}
 style={style}
 >
 {children}
 </div>,
 document.body,
 );
}

function ToolbarGroup({
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
 className="inline-flex shrink-0 items-center gap-1.5 rounded-[18px] border-border/70 bg-surface/70 p-1.5 shadow-[inset_0_1px_0_rgb(var(--bone-rgb)/0.55)]"
 >
 <span className="hidden px-1.5 text-[0.64rem] font-extrabold uppercase text-muted sm:inline">
 {label}
 </span>
 {children}
 </div>
 );
}

function SizeDropdown({
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

 const currentLabel = sizes.find((s) => s.value === value)?.label || value || "16px (Normal)";

 return (
 <>
 <button
 ref={triggerRef}
 type="button"
 disabled={disabled}
 aria-expanded={isOpen}
 aria-haspopup="menu"
 onMouseDown={(e) => {
 e.preventDefault();
 onOpenChange(!isOpen);
 }}
 className={cn(
 "inline-flex h-10 items-center justify-between gap-1.5 rounded-[14px] bg-surface px-3 text-xs font-bold text-foreground transition-[background-color,border-color,box-shadow,color] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 hover:border-primary/40 hover:bg-primary-soft",
 disabled && "pointer-events-none opacity-45"
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
 ? "bg-primary-soft text-secondary"
 : "text-muted"
 )}
 >
 {size.label}
 </button>
 ))}
 </ToolbarPopover>
 </>
 );
}

function ColorDropdown({
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
 const hexInputValue = value && value !== "default" ? value : "";

 const presetColors = [
 { label: "Auto", value: "default", class: "" },
 { label: "Raspberry", value: "#B82D52", class: "bg-[#B82D52]" },
 { label: "Raspberry suave", value: "#F7E4EA", class: "bg-[#F7E4EA]" },
 { label: "Mineral", value: "#2F5F66", class: "bg-[#2F5F66]" },
 { label: "Mineral suave", value: "#E6F0F1", class: "bg-[#E6F0F1]" },
 { label: "Tinta", value: "#171417", class: "bg-[#171417]" },
 { label: "Neutro", value: "#6F6870", class: "bg-[#6F6870]" },
 ];

 const currentSwatchStyle = value && value !== "default" ? { backgroundColor: value } : undefined;

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
 disabled && "pointer-events-none opacity-45"
 )}
 >
 <Palette className="size-4 text-muted" />
 {currentSwatchStyle ? (
 <span
 className="size-3.5 rounded-full border-foreground/10"
 style={currentSwatchStyle}
 />
 ) : (
 <span className="text-[10px] font-extrabold text-muted">Auto</span>
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
 Paleta de colores
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
 value === color.value || (color.value === "default" && (!value || value === "default"))
 ? "ring-2 ring-teal ring-offset-1"
 : ""
 )}
 >
 {color.value === "default" ? (
 <span className="text-[9px] font-bold text-foreground">A</span>
 ) : (
 <span className={cn("size-full rounded-full", color.class)} />
 )}
 </button>
 ))}
 </div>

 <div className="mt-3 border-t pt-3">
 <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
 Color personalizado
 </p>
 <div className="flex items-center gap-2">
 <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-background transition-colors hover:bg-surface-hover">
 <input
 type="color"
 value={value && value !== "default" && value.startsWith("#") ? value : "#2F5F66"}
 onChange={(e) => {
 onChange(e.target.value);
 }}
 className="sr-only"
 />
 <span
 className="size-5 rounded-[4px] border-foreground/10"
 style={{ backgroundColor: value && value !== "default" ? value : "#2F5F66" }}
 />
 </label>
 <input
 type="text"
 placeholder="#HEX"
 defaultValue={hexInputValue}
 key={hexInputValue}
 onChange={(e) => {
 const val = e.target.value;
 if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
 onChange(val);
 }
 }}
 className="h-8 w-full rounded-[8px] bg-background px-2 text-xs font-bold uppercase text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-ring"
 />
 </div>
 </div>
 </ToolbarPopover>
 </>
 );
}

function HighlightDropdown({
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
 const hexInputValue = value && value !== "default" ? value : "";

 const presetColors = [
 { label: "Sin resaltado", value: "default", class: "" },
 { label: "Raspberry", value: "#B82D52", class: "bg-[#B82D52]" },
 { label: "Raspberry suave", value: "#F7E4EA", class: "bg-[#F7E4EA]" },
 { label: "Mineral", value: "#2F5F66", class: "bg-[#2F5F66]" },
 { label: "Mineral suave", value: "#E6F0F1", class: "bg-[#E6F0F1]" },
 { label: "Superficie", value: "#F4F1EF", class: "bg-[#F4F1EF]" },
 { label: "Blanco", value: "#FFFFFF", class: "bg-[#FFFFFF]" },
 ];

 const currentSwatchStyle = value && value !== "default" ? { backgroundColor: value } : undefined;

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
 disabled && "pointer-events-none opacity-45"
 )}
 >
 <Highlighter className="size-4 text-muted" />
 {currentSwatchStyle ? (
 <span
 className="size-3.5 rounded-full border-foreground/10"
 style={currentSwatchStyle}
 />
 ) : (
 <span className="text-[10px] font-extrabold text-muted">Ninguno</span>
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
 Color de resaltado
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
 value === color.value || (color.value === "default" && (!value || value === "default"))
 ? "ring-2 ring-teal ring-offset-1"
 : ""
 )}
 >
 {color.value === "default" ? (
 <X className="size-3 text-foreground" aria-hidden="true" />
 ) : (
 <span className={cn("size-full rounded-full", color.class)} />
 )}
 </button>
 ))}
 </div>

 <div className="mt-3 border-t pt-3">
 <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-muted">
 Resaltado personalizado
 </p>
 <div className="flex items-center gap-2">
 <label className="relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] bg-background transition-colors hover:bg-surface-hover">
 <input
 type="color"
 value={value && value !== "default" && value.startsWith("#") ? value : "#F7E4EA"}
 onChange={(e) => {
 onChange(e.target.value);
 }}
 className="sr-only"
 />
 <span
 className="size-5 rounded-[4px] border-foreground/10"
 style={{ backgroundColor: value && value !== "default" ? value : "#F7E4EA" }}
 />
 </label>
 <input
 type="text"
 placeholder="#HEX"
 defaultValue={hexInputValue}
 key={hexInputValue}
 onChange={(e) => {
 const val = e.target.value;
 if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
 onChange(val);
 }
 }}
 className="h-8 w-full rounded-[8px] bg-background px-2 text-xs font-bold uppercase text-foreground outline-none focus:border-primary/40 focus:ring-1 focus:ring-ring"
 />
 </div>
 </div>
 </ToolbarPopover>
 </>
 );
}

function LinkDropdown({
 disabled = false,
 editor,
 isOpen,
 onOpenChange,
}: {
 disabled?: boolean;
 editor: Editor | null;
 isOpen: boolean;
 onOpenChange: (open: boolean) => void;
}) {
 const triggerRef = useRef<HTMLButtonElement>(null);
 const [hrefValue, setHrefValue] = useState("");

 const applyLink = () => {
 if (!editor) {
 return;
 }

 const href = normalizeEditorUrl(hrefValue);

 if (!href) {
 toast.error("Usa una URL http(s), mailto:, tel: o una ruta interna.");
 return;
 }

 editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
 onOpenChange(false);
 };

 return (
 <>
 <ToolbarButton
 active={editor?.isActive("link")}
 ariaExpanded={isOpen}
 buttonRef={triggerRef}
 disabled={disabled}
 icon={LinkIcon}
 label="Agregar enlace"
 onClick={() => {
 setHrefValue(String(editor?.getAttributes("link").href ?? ""));
 onOpenChange(!isOpen);
 }}
 />

 <ToolbarPopover
 triggerRef={triggerRef}
 isOpen={isOpen}
 onOpenChange={onOpenChange}
 width={280}
 className="p-3"
 >
 <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
 URL del enlace
 </label>
 <input
 type="url"
 value={hrefValue}
 onChange={(event) => setHrefValue(event.target.value)}
 onKeyDown={(event) => {
 if (event.key === "Enter") {
 event.preventDefault();
 applyLink();
 }
 }}
 placeholder="https://..."
 className="mt-2 h-10 w-full rounded-[10px] bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
 />
 <div className="mt-3 flex items-center justify-end gap-2">
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onMouseDown={(event) => {
 event.preventDefault();
 onOpenChange(false);
 }}
 >
 Cancelar
 </Button>
 <Button
 type="button"
 size="sm"
 onMouseDown={(event) => {
 event.preventDefault();
 applyLink();
 }}
 >
 Aplicar
 </Button>
 </div>
 </ToolbarPopover>
 </>
 );
}

function unsetEditorLink(editor: Editor) {
 editor.chain().focus().extendMarkRange("link").unsetLink().run();
}

function getEditorHtml(editor: Editor) {
 return editor.isEmpty ? "" : editor.getHTML();
}

function getEditorStats(editor: Editor | null) {
 const text = editor?.getText().replace(/\s+/g, " ").trim() ?? "";

 return {
 textLength: text.length,
 wordCount: text ? text.split(/\s+/).length : 0,
 };
}

function getActiveTextAlign(editor: Editor | null): BlogTextAlign {
 if (!editor) {
 return "left";
 }

 if (
 editor.isActive("paragraph", { textAlign: "center" }) ||
 editor.isActive("heading", { textAlign: "center" })
 ) {
 return "center";
 }

 if (
 editor.isActive("paragraph", { textAlign: "right" }) ||
 editor.isActive("heading", { textAlign: "right" })
 ) {
 return "right";
 }

 return "left";
}

function getActiveTextSize(editor: Editor | null): string {
 if (!editor) {
 return "16px";
 }
 return editor.getAttributes("blogTextSize").size || "16px";
}

function getActiveTextColor(editor: Editor | null): string {
 if (!editor) {
 return "default";
 }
 return editor.getAttributes("blogTextColor").color || "default";
}

function getActiveHighlightColor(editor: Editor | null): string {
 if (!editor) {
 return "default";
 }
 return editor.getAttributes("blogHighlight").color || "default";
}

const editorContentClasses = [
 "relative overflow-hidden rounded-b-[22px] border-x border-b border-input bg-surface/90 ",
 "[&_.ProseMirror]:min-h-[20rem] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-4 [&_.ProseMirror]:text-base [&_.ProseMirror]:leading-7 [&_.ProseMirror]:text-foreground [&_.ProseMirror]:outline-none sm:[&_.ProseMirror]:px-5",
 "[&_.ProseMirror_a]:font-bold [&_.ProseMirror_a]:text-secondary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4",
 "[&_.ProseMirror_.blog-align-center]:text-center [&_.ProseMirror_.blog-align-left]:text-left [&_.ProseMirror_.blog-align-right]:text-right",
 "[&_.ProseMirror_.blog-color-accent]:text-primary [&_.ProseMirror_.blog-color-charcoal]:text-foreground [&_.ProseMirror_.blog-color-teal]:text-secondary [&_.ProseMirror_.blog-color-warm]:text-muted-foreground",
 "[&_.ProseMirror_.blog-highlight]:rounded-[8px] [&_.ProseMirror_.blog-highlight]:bg-secondary-soft [&_.ProseMirror_.blog-highlight]:px-1.5 [&_.ProseMirror_.blog-highlight]:py-0.5",
 "[&_.ProseMirror_.blog-text-large]:text-xl [&_.ProseMirror_.blog-text-large]:leading-9 [&_.ProseMirror_.blog-text-small]:text-sm [&_.ProseMirror_.blog-text-small]:leading-6",
 "[&_.ProseMirror_blockquote]:my-5 [&_.ProseMirror_blockquote]:rounded-card [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary [&_.ProseMirror_blockquote]:bg-primary-soft [&_.ProseMirror_blockquote]:px-4 [&_.ProseMirror_blockquote]:py-3 [&_.ProseMirror_blockquote]:font-semibold [&_.ProseMirror_blockquote]:text-foreground",
 "[&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:font-heading [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:leading-tight [&_.ProseMirror_h1]:text-foreground sm:[&_.ProseMirror_h1]:text-4xl",
 "[&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:mt-7 [&_.ProseMirror_h2]:font-heading [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:leading-tight [&_.ProseMirror_h2]:text-foreground",
 "[&_.ProseMirror_h3]:mb-3 [&_.ProseMirror_h3]:mt-6 [&_.ProseMirror_h3]:font-heading [&_.ProseMirror_h3]:text-2xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:leading-tight [&_.ProseMirror_h3]:text-foreground",
 "[&_.ProseMirror_hr]:my-8 [&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-border",
 "[&_.ProseMirror_li]:my-1.5 [&_.ProseMirror_li]:pl-1 [&_.ProseMirror_ol]:my-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_p]:my-4 [&_.ProseMirror_u]:underline [&_.ProseMirror_ul]:my-5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6",
 "[&_.ProseMirror>*:first-child]:mt-0 [&_.ProseMirror>*:last-child]:mb-0",
].join(" ");

interface BlogEditorToolbarProps {
 editor: Editor | null;
 disabled?: boolean;
 className?: string;
 error?: boolean;
 toolbarId: string;
 activeMenuId: string | null;
 setActiveMenuId: (id: string | null) => void;
}

export const BlogEditorToolbar = forwardRef<HTMLDivElement, BlogEditorToolbarProps>(
 ({ editor, disabled = false, className, error = false, toolbarId, activeMenuId, setActiveMenuId }, ref) => {
 const toolbarDisabled = disabled || !editor;
 const activeTextAlign = getActiveTextAlign(editor);
 const activeTextColor = getActiveTextColor(editor);
 const activeHighlightColor = getActiveHighlightColor(editor);
 const activeTextSize = getActiveTextSize(editor);
 const runToolbarAction = (action: () => void) => {
 setActiveMenuId(null);
 action();
 };

 return (
 <TooltipProvider>
 <div
 ref={ref}
 className={cn(
 "relative z-30 flex items-center gap-2 overflow-x-auto bg-background/95 p-2 backdrop-blur-md sm:flex-wrap",
 error && "border-danger/40",
 className
 )}
 aria-label="Herramientas de formato del blog"
 role="toolbar"
 >
 <ToolbarGroup label="Texto">
 <ToolbarButton active={editor?.isActive("bold")} disabled={toolbarDisabled} icon={Bold} label="Negrita" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleBold().run())} />
 <ToolbarButton active={editor?.isActive("italic")} disabled={toolbarDisabled} icon={Italic} label="Cursiva" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleItalic().run())} />
 <ToolbarButton active={editor?.isActive("underline")} disabled={toolbarDisabled} icon={Underline} label="Subrayado" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleUnderline().run())} />
 <SizeDropdown disabled={toolbarDisabled} value={activeTextSize} onChange={(nextSize) => editor?.chain().focus().setBlogTextSize(nextSize).run()} isOpen={activeMenuId === `${toolbarId}-size`} onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-size` : null)} />
 </ToolbarGroup>

 <ToolbarGroup label="Estructura">
 <ToolbarButton active={editor?.isActive("paragraph")} disabled={toolbarDisabled} icon={Pilcrow} label="Parrafo" onClick={() => runToolbarAction(() => editor?.chain().focus().setParagraph().run())} />
 <ToolbarButton active={editor?.isActive("heading", { level: 1 })} disabled={toolbarDisabled} icon={Heading1} label="Titulo H1" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())} />
 <ToolbarButton active={editor?.isActive("heading", { level: 2 })} disabled={toolbarDisabled} icon={Heading2} label="Titulo H2" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())} />
 <ToolbarButton active={editor?.isActive("heading", { level: 3 })} disabled={toolbarDisabled} icon={Heading3} label="Titulo H3" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())} />
 </ToolbarGroup>

 <ToolbarGroup label="Color">
 <ColorDropdown disabled={toolbarDisabled} value={activeTextColor} onChange={(color) => editor?.chain().focus().setBlogTextColor(color).run()} isOpen={activeMenuId === `${toolbarId}-color`} onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-color` : null)} />
 <HighlightDropdown disabled={toolbarDisabled} value={activeHighlightColor} onChange={(color) => editor?.chain().focus().setBlogHighlight(color).run()} isOpen={activeMenuId === `${toolbarId}-highlight`} onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-highlight` : null)} />
 </ToolbarGroup>

 <ToolbarGroup label="Alineacion">
 <ToolbarButton active={activeTextAlign === "left"} disabled={toolbarDisabled} icon={AlignLeft} label="Alinear izquierda" onClick={() => runToolbarAction(() => editor?.chain().focus().setBlogTextAlign("left").run())} />
 <ToolbarButton active={activeTextAlign === "center"} disabled={toolbarDisabled} icon={AlignCenter} label="Alinear centro" onClick={() => runToolbarAction(() => editor?.chain().focus().setBlogTextAlign("center").run())} />
 <ToolbarButton active={activeTextAlign === "right"} disabled={toolbarDisabled} icon={AlignRight} label="Alinear derecha" onClick={() => runToolbarAction(() => editor?.chain().focus().setBlogTextAlign("right").run())} />
 <ToolbarButton active={editor?.isActive("bulletList")} disabled={toolbarDisabled} icon={List} label="Lista con vinetas" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleBulletList().run())} />
 <ToolbarButton active={editor?.isActive("orderedList")} disabled={toolbarDisabled} icon={ListOrdered} label="Lista numerada" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleOrderedList().run())} />
 </ToolbarGroup>

 <ToolbarGroup label="Enlaces">
 <LinkDropdown editor={editor} disabled={toolbarDisabled} isOpen={activeMenuId === `${toolbarId}-link`} onOpenChange={(open) => setActiveMenuId(open ? `${toolbarId}-link` : null)} />
 <ToolbarButton disabled={toolbarDisabled || !editor?.isActive("link")} icon={Unlink} label="Quitar enlace" onClick={() => runToolbarAction(() => editor && unsetEditorLink(editor))} />
 </ToolbarGroup>

 <ToolbarGroup label="Herramientas">
 <ToolbarButton active={editor?.isActive("blockquote")} disabled={toolbarDisabled} icon={Quote} label="Cita" onClick={() => runToolbarAction(() => editor?.chain().focus().toggleBlockquote().run())} />
 <ToolbarButton disabled={toolbarDisabled} icon={Minus} label="Separador" onClick={() => runToolbarAction(() => editor?.chain().focus().setHorizontalRule().run())} />
 <ToolbarButton disabled={toolbarDisabled} icon={Eraser} label="Limpiar formato" onClick={() => runToolbarAction(() => editor?.chain().focus().unsetAllMarks().unsetBlogTextAlign().clearNodes().run())} />
 <ToolbarButton disabled={toolbarDisabled || !editor?.can().undo()} icon={Undo2} label="Deshacer" onClick={() => runToolbarAction(() => editor?.chain().focus().undo().run())} />
 <ToolbarButton disabled={toolbarDisabled || !editor?.can().redo()} icon={Redo2} label="Rehacer" onClick={() => runToolbarAction(() => editor?.chain().focus().redo().run())} />
 </ToolbarGroup>
 </div>
 </TooltipProvider>
 );
 }
);

BlogEditorToolbar.displayName = "BlogEditorToolbar";

export function BlogRichTextEditor({
 describedBy,
 disabled = false,
 error = false,
 id,
 onBlur,
 onChange,
 value,
}: BlogRichTextEditorProps) {
 const [showPreview, setShowPreview] = useState(false);
 const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
 const [toolbarState, setToolbarState] = useState({
 textLength: 0,
 version: 0,
 wordCount: 0,
 });
 const containerRef = useRef<HTMLDivElement>(null);
 const floatingVisibleRef = useRef(false);
 const mainToolbarRef = useRef<HTMLDivElement>(null);
 const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
 const [floatingStyle, setFloatingStyle] = useState<CSSProperties>({});
 const isEmpty = !value.trim();
 const editor = useEditor({
 editable: !disabled,
 editorProps: {
 attributes: {
 "aria-describedby": describedBy ?? "",
 "aria-invalid": error ? "true" : "false",
 "aria-label": "Contenido del blog",
 "aria-multiline": "true",
 class:
 "min-h-[20rem] px-4 py-4 text-base leading-7 text-foreground outline-none sm:px-5",
 id,
 role: "textbox",
 },
 },
 extensions: [
 BlogTextAlignExtension,
 BlogTextColorExtension,
 BlogTextSizeExtension,
 BlogHighlightExtension,
 StarterKit.configure({
 code: false,
 codeBlock: false,
 heading: {
 levels: [1, 2, 3],
 },
 link: {
 HTMLAttributes: {
 rel: "noopener noreferrer",
 target: "_blank",
 },
 autolink: true,
 defaultProtocol: "https",
 isAllowedUri: (url, context) =>
 !url.trim().startsWith("//") &&
 (isAllowedEditorUrl(url) || context.defaultValidate(url)),
 openOnClick: false,
 protocols: ["http", "https", "mailto", "tel"],
 },
 strike: false,
 }),
 Placeholder.configure({
 placeholder: "Escribe el contenido del blog...",
 }),
 ],
 immediatelyRender: false,
 onBlur: () => {
 onBlur?.();
 },
 onUpdate: ({ editor: currentEditor }) => {
 const stats = getEditorStats(currentEditor);

 setToolbarState((current) => ({
 ...stats,
 version: current.version + 1,
 }));
 onChange(getEditorHtml(currentEditor));
 },
 });

 useEffect(() => {
 if (!editor) {
 return;
 }

 const refreshToolbarState = () => {
 const stats = getEditorStats(editor);

 setToolbarState((current) => ({
 ...stats,
 version: current.version + 1,
 }));
 };

 refreshToolbarState();
 editor.on("selectionUpdate", refreshToolbarState);
 editor.on("transaction", refreshToolbarState);

 return () => {
 editor.off("selectionUpdate", refreshToolbarState);
 editor.off("transaction", refreshToolbarState);
 };
 }, [editor]);

 useEffect(() => {
 if (!editor) {
 return;
 }

 const currentHtml = getEditorHtml(editor);

 if (value !== currentHtml) {
 editor.commands.setContent(value || "", { emitUpdate: false });
 }

 const statsTimer = window.setTimeout(() => {
 setToolbarState((current) => ({
 ...getEditorStats(editor),
 version: current.version + 1,
 }));
 }, 0);

 return () => window.clearTimeout(statsTimer);
 }, [editor, value]);

 useEffect(() => {
 editor?.setEditable(!disabled);
 }, [disabled, editor]);

 useEffect(() => {
 const mainToolbar = mainToolbarRef.current;
 const container = containerRef.current;
 if (!mainToolbar || !container) return;

 let isMainToolbarIntersecting = true;
 let isContainerIntersecting = false;

 const updateVisibility = () => {
 const nextVisible = isContainerIntersecting && !isMainToolbarIntersecting;

 if (floatingVisibleRef.current !== nextVisible) {
 floatingVisibleRef.current = nextVisible;
 setActiveMenuId(null);
 }

 setShowFloatingToolbar(nextVisible);
 };

 const observer = new IntersectionObserver(
 (entries) => {
 entries.forEach((entry) => {
 if (entry.target === mainToolbar) {
 isMainToolbarIntersecting = entry.isIntersecting;
 }
 if (entry.target === container) {
 isContainerIntersecting = entry.isIntersecting;
 }
 });
 updateVisibility();
 },
 {
 threshold: 0,
 rootMargin: "-64px 0px 0px 0px",
 }
 );

 observer.observe(mainToolbar);
 observer.observe(container);

 return () => observer.disconnect();
 }, []);

 useEffect(() => {
 if (!showFloatingToolbar) return;

 const updatePosition = () => {
 const container = containerRef.current;
 if (!container) return;

 const rect = container.getBoundingClientRect();
 setFloatingStyle({
 width: `${rect.width}px`,
 left: `${rect.left}px`,
 });
 };

 updatePosition();
 window.addEventListener("scroll", updatePosition, { passive: true });
 window.addEventListener("resize", updatePosition);
 return () => {
 window.removeEventListener("scroll", updatePosition);
 window.removeEventListener("resize", updatePosition);
 };
 }, [showFloatingToolbar]);

 const contentLength = value.trim().length;
 const isNearContentLimit = contentLength >= 45000;

 return (
 <div ref={containerRef}>
 <BlogEditorToolbar
 ref={mainToolbarRef}
 editor={editor}
 disabled={disabled}
 error={error}
 toolbarId="main"
 activeMenuId={activeMenuId}
 setActiveMenuId={setActiveMenuId}
 className="rounded-t-[22px] border border-input "
 />

 {showFloatingToolbar && (
 <div
 style={floatingStyle}
 className="fixed top-3 z-[160] max-h-[45dvh] overflow-y-auto transition-[left,top,opacity,transform] lg:top-4"
 >
 <BlogEditorToolbar
 editor={editor}
 disabled={disabled}
 error={error}
 toolbarId="floating"
 activeMenuId={activeMenuId}
 setActiveMenuId={setActiveMenuId}
 className="rounded-[22px] border border-input "
 />
 </div>
 )}

 <div className={cn(editorContentClasses, error && "border-danger/40")}>
 <EditorContent editor={editor} />
 {isEmpty ? (
 <span className="pointer-events-none absolute left-4 top-4 text-base leading-7 text-muted sm:left-5">
 Escribe el contenido del blog...
 </span>
 ) : null}
 </div>

 <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
 <div className="text-xs font-semibold leading-5 text-muted">
 <p>
 Formato permitido: titulos, listas, enlaces seguros, citas,
 alineacion, color de paleta y resaltado.
 </p>
 <p
 className={cn(
 "mt-1",
 isNearContentLimit && "font-extrabold text-danger",
 )}
 >
 {toolbarState.wordCount} palabras / {toolbarState.textLength}{" "}
 caracteres de texto / {contentLength.toLocaleString("es-CR")} de
 50 000 caracteres guardables.
 </p>
 </div>
 <Button
 type="button"
 variant={showPreview ? "secondary" : "outline"}
 size="sm"
 onClick={() => setShowPreview((current) => !current)}
 >
 {showPreview ? "Ocultar vista previa" : "Vista previa"}
 </Button>
 </div>

 {showPreview ? (
 <div className="mt-4 rounded-[22px] bg-background p-4 sm:p-5">
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Vista previa
 </p>
 <BlogContentRenderer
 className="mt-4"
 content={value}
 emptyMessage="La vista previa aparecerá cuando escribas contenido."
 />
 </div>
 ) : null}
 </div>
 );
}

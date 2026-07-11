"use client";

import {
 useEffect,
 useRef,
 useState,
 type CSSProperties,
 type ReactNode,
 type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const POPOVER_COLLISION_PADDING = 12;

function getPopoverStyle(trigger: HTMLElement, width: number): CSSProperties {
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

export function ToolbarPopover({
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

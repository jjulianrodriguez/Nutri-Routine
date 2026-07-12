"use client";

import {
 useEffect,
 useRef,
 useState,
 type CSSProperties,
 type RefObject,
} from "react";

export function useFloatingToolbar(
 onVisibilityBoundaryChange: () => void,
): {
 containerRef: RefObject<HTMLDivElement | null>;
 floatingStyle: CSSProperties;
 mainToolbarRef: RefObject<HTMLDivElement | null>;
 showFloatingToolbar: boolean;
} {
 const containerRef = useRef<HTMLDivElement>(null);
 const floatingVisibleRef = useRef(false);
 const mainToolbarRef = useRef<HTMLDivElement>(null);
 const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
 const [floatingStyle, setFloatingStyle] = useState<CSSProperties>({});

 useEffect(() => {
 const mainToolbar = mainToolbarRef.current;
 const container = containerRef.current;
 if (!mainToolbar || !container) {
 return;
 }

 let isMainToolbarIntersecting = true;
 let isContainerIntersecting = false;

 const updateVisibility = () => {
 const nextVisible = isContainerIntersecting && !isMainToolbarIntersecting;

 if (floatingVisibleRef.current !== nextVisible) {
 floatingVisibleRef.current = nextVisible;
 onVisibilityBoundaryChange();
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
 },
 );

 observer.observe(mainToolbar);
 observer.observe(container);

 return () => observer.disconnect();
 }, [onVisibilityBoundaryChange]);

 useEffect(() => {
 if (!showFloatingToolbar) {
 return;
 }

 const updatePosition = () => {
 const container = containerRef.current;
 if (!container) {
 return;
 }

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

 return {
 containerRef,
 floatingStyle,
 mainToolbarRef,
 showFloatingToolbar,
 };
}
"use client";

import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

type SmoothScrollProps = {
 children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
 const reduceMotion = useReducedMotion();

 useEffect(() => {
 if (reduceMotion) {
 return;
 }

 const lenis = new Lenis({
 duration: 1.18,
 easing: (time) => 1 - Math.pow(1 - time, 4),
 lerp: 0.08,
 smoothWheel: true,
 syncTouch: false,
 wheelMultiplier: 0.86,
 });

 let frameId = 0;

 function raf(time: number) {
 lenis.raf(time);
 frameId = requestAnimationFrame(raf);
 }

 frameId = requestAnimationFrame(raf);

 return () => {
 cancelAnimationFrame(frameId);
 lenis.destroy();
 };
 }, [reduceMotion]);

 return <>{children}</>;
}

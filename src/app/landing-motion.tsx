"use client";

import {
 motion,
 MotionConfig,
 type HTMLMotionProps,
} from "framer-motion";
import type { PropsWithChildren } from "react";

const entranceEase = [0.16, 1, 0.3, 1] as const;

type RevealDirection = "down" | "left" | "none" | "right" | "up";

type LandingRevealProps = PropsWithChildren<{
 amount?: number;
 className?: string;
 delay?: number;
 direction?: RevealDirection;
 distance?: number;
 duration?: number;
}>;

function getOffset(direction: RevealDirection, distance: number) {
 switch (direction) {
 case "down":
 return { x: 0, y: -distance };
 case "left":
 return { x: -distance, y: 0 };
 case "none":
 return { x: 0, y: 0 };
 case "right":
 return { x: distance, y: 0 };
 case "up":
 default:
 return { x: 0, y: distance };
 }
}

export function LandingMotionProvider({ children }: PropsWithChildren) {
 return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function LandingReveal({
 amount = 0.22,
 children,
 className,
 delay = 0,
 direction = "up",
 distance = 24,
 duration = 1.05,
}: LandingRevealProps) {
 const offset = getOffset(direction, distance);

 return (
 <motion.div
 className={className}
 initial={{ opacity: 0, ...offset }}
 whileInView={{ opacity: 1, x: 0, y: 0 }}
 viewport={{ amount, once: true }}
 transition={{ delay, duration, ease: entranceEase }}
 >
 {children}
 </motion.div>
 );
}

export function LandingCard({
 children,
 className,
 delay = 0,
 ...props
}: HTMLMotionProps<"article"> & { delay?: number }) {
 return (
 <motion.article
 {...props}
 className={className}
 initial={{ opacity: 0, scale: 0.985, y: 26 }}
 whileInView={{ opacity: 1, scale: 1, y: 0 }}
 viewport={{ amount: 0.2, once: true }}
 transition={{ delay, duration: 1.1, ease: entranceEase }}
 >
 {children}
 </motion.article>
 );
}

export function LandingCta({
 children,
 className,
 delay = 0,
 ...props
}: HTMLMotionProps<"a"> & { delay?: number }) {
 return (
 <motion.a
 {...props}
 className={className}
 initial={{ opacity: 0, scale: 0.97, y: 18 }}
 whileInView={{ opacity: 1, scale: 1, y: 0 }}
 viewport={{ amount: 0.65, once: true }}
 transition={{ delay, duration: 0.98, ease: entranceEase }}
 whileHover={{
 scale: 1.015,
 y: -2,
 transition: { delay: 0, duration: 0.26, ease: "easeOut" },
 }}
 whileTap={{
 scale: 0.985,
 transition: { delay: 0, duration: 0.16, ease: "easeOut" },
 }}
 >
 {children}
 </motion.a>
 );
}

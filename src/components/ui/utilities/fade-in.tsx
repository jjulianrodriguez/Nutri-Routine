"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
 children: ReactNode;
 className?: string;
 delay?: number;
 y?: number;
};

export function FadeIn({ children, className, delay = 0, y = 18 }: FadeInProps) {
 const reduceMotion = useReducedMotion();

 return (
 <motion.div
 initial={reduceMotion ? false : { opacity: 0, y }}
 animate={{ opacity: 1, y: 0 }}
 transition={{
 delay,
 duration: 0.6,
 ease: [0.22, 0.72, 0.18, 1],
 }}
 className={className}
 >
 {children}
 </motion.div>
 );
}


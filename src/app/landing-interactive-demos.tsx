"use client";

import {
 animate as animateValue,
 motion,
 useInView,
 useReducedMotion,
 type Variants,
} from "framer-motion";
import {
 Activity,
 BarChart3,
 Bell,
 BookOpen,
 CalendarClock,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 Dumbbell,
 Home,
 Leaf,
 Menu,
 MessageCircle,
 Send,
 UserRound,
 type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const demoEase = [0.16, 1, 0.3, 1] as const;
const demoViewport = { amount: 0.32, once: true } as const;

const demoCanvasVariants: Variants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { delayChildren: 0.16, staggerChildren: 0.16 },
 },
};

const demoShellVariants: Variants = {
 hidden: { opacity: 0, scale: 0.94, y: 22 },
 visible: {
 opacity: 1,
 scale: 1,
 y: 0,
 transition: { duration: 0.96, ease: demoEase },
 },
};

const demoGroupVariants: Variants = {
 hidden: {},
 visible: {
 transition: { delayChildren: 0.14, staggerChildren: 0.12 },
 },
};

const demoCalendarGridVariants: Variants = {
 hidden: {},
 visible: {
 transition: { delayChildren: 0.24 },
 },
};

const demoItemVariants: Variants = {
 hidden: { opacity: 0, y: 14 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.68, ease: demoEase },
 },
};

const demoSidebarVariants: Variants = {
 hidden: { opacity: 0, x: -28 },
 visible: {
 opacity: 1,
 x: 0,
 transition: {
 delayChildren: 0.22,
 duration: 0.86,
 ease: demoEase,
 staggerChildren: 0.08,
 },
 },
};

const demoMetricVariants: Variants = {
 hidden: { opacity: 0, scale: 0.86, y: 18 },
 visible: {
 opacity: 1,
 scale: [1, 1.035, 1],
 y: 0,
 transition: { duration: 0.82, ease: demoEase },
 },
};

const demoBubbleRightVariants: Variants = {
 hidden: { opacity: 0, scale: 0.9, x: 24, y: 8 },
 visible: {
 opacity: 1,
 scale: 1,
 x: 0,
 y: 0,
 transition: { duration: 0.76, ease: demoEase },
 },
};

const demoBubbleLeftVariants: Variants = {
 hidden: { opacity: 0, scale: 0.9, x: -24, y: 8 },
 visible: {
 opacity: 1,
 scale: 1,
 x: 0,
 y: 0,
 transition: { duration: 0.76, ease: demoEase },
 },
};

const demoDayVariants: Variants = {
 hidden: { opacity: 0, scale: 0.55, y: 7 },
 visible: (step = 0) => ({
 opacity: 1,
 scale: [0.55, 1.08, 1],
 y: 0,
 transition: {
 delay: step * 0.055,
 duration: 0.46,
 ease: demoEase,
 },
 }),
};

function AnimatedCount({
 className,
 delay = 0,
 denominator,
 duration = 1.7,
 suffix = "",
 target,
}: {
 className?: string;
 delay?: number;
 denominator?: number;
 duration?: number;
 suffix?: string;
 target: number;
}) {
 const countRef = useRef<HTMLSpanElement>(null);
 const isInView = useInView(countRef, { amount: 0.7, once: true });
 const shouldReduceMotion = useReducedMotion();
 const [displayValue, setDisplayValue] = useState(0);

 useEffect(() => {
 if (!isInView) return;

 if (shouldReduceMotion) {
 setDisplayValue(target);
 return;
 }

 const controls = animateValue(0, target, {
 delay,
 duration,
 ease: demoEase,
 onUpdate: (latest) => setDisplayValue(Math.round(latest)),
 });

 return () => controls.stop();
 }, [delay, duration, isInView, shouldReduceMotion, target]);

 const completeValue = denominator
 ? `${target}/${denominator}${suffix}`
 : `${target}${suffix}`;

 return (
 <span
 ref={countRef}
 className={["inline-block tabular-nums", className].filter(Boolean).join(" ")}
 style={{ minWidth: `${completeValue.length}ch` }}
 aria-label={completeValue}
 >
 <span aria-hidden="true">
 {displayValue}
 {denominator ? `/${denominator}` : null}
 {suffix}
 </span>
 </span>
 );
}

function TypedMessage({
 delay,
 speed = 34,
 text,
}: {
 delay: number;
 speed?: number;
 text: string;
}) {
 const messageRef = useRef<HTMLSpanElement>(null);
 const isInView = useInView(messageRef, { amount: 0.65, once: true });
 const shouldReduceMotion = useReducedMotion();
 const [displayedText, setDisplayedText] = useState("");
 const [isComplete, setIsComplete] = useState(false);

 useEffect(() => {
 if (!isInView) return;

 if (shouldReduceMotion) {
 setDisplayedText(text);
 setIsComplete(true);
 return;
 }

 let characterIndex = 0;
 let timeoutId: number | undefined;

 const typeNextCharacter = () => {
 characterIndex += 1;
 setDisplayedText(text.slice(0, characterIndex));

 if (characterIndex >= text.length) {
 setIsComplete(true);
 return;
 }

 const typedCharacter = text[characterIndex - 1];
 const nextDelay = /[,.?]/.test(typedCharacter) ? speed * 2.4 : speed;
 timeoutId = window.setTimeout(typeNextCharacter, nextDelay);
 };

 timeoutId = window.setTimeout(typeNextCharacter, delay * 1000);

 return () => {
 if (timeoutId !== undefined) window.clearTimeout(timeoutId);
 };
 }, [delay, isInView, shouldReduceMotion, speed, text]);

 return (
 <span ref={messageRef} className="relative block" aria-label={text}>
 <span className="invisible block" aria-hidden="true">
 {text}
 </span>
 <span className="absolute inset-0" aria-hidden="true">
 {displayedText}
 {!isComplete && isInView ? (
 <motion.span
 className="ml-0.5 inline-block h-[0.72rem] w-px translate-y-[0.08rem] bg-current"
 animate={{ opacity: [1, 0.15, 1] }}
 transition={{ duration: 0.78, ease: "easeInOut", repeat: Infinity }}
 />
 ) : null}
 </span>
 </span>
 );
}

const darkDemoControl =
 "transition-[background-color,color,transform,box-shadow] duration-200 hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sidebar-ring)] active:scale-[0.96] active:bg-[var(--sidebar-accent-hover)] motion-reduce:transform-none";

const lightDemoControl =
 "transition-[background-color,border-color,color,transform,box-shadow] duration-200 hover:border-primary hover:bg-primary-tint/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.96] active:bg-primary-soft motion-reduce:transform-none";

const heroDashboardNavItems: Array<{
 active?: boolean;
 icon: LucideIcon;
 label: string;
}> = [
 { active: true, icon: Home, label: "Dashboard" },
 { icon: UserRound, label: "Mi perfil" },
 { icon: Activity, label: "Mi progreso" },
 { icon: Leaf, label: "Nutrición" },
 { icon: Dumbbell, label: "Entrenamiento" },
];

const heroDashboardSupportItems: Array<{
 badge?: string;
 icon: LucideIcon;
 label: string;
}> = [
 { badge: "1", icon: Bell, label: "Notificaciones" },
 { icon: BookOpen, label: "Recursos" },
 { icon: CalendarClock, label: "Calendario" },
];

const heroDashboardStats = [
 { detail: "6 de 7 completados", label: "Hábitos esta semana", suffix: "%", target: 86 },
 { detail: "Mediciones disponibles", label: "Progreso registrado", target: 12 },
 { detail: "Citas programadas", label: "Próximos eventos", target: 2 },
 { detail: "Requiere tu atención", label: "Avisos sin leer", target: 1 },
];

export function HeroDashboardPreview() {
 return (
 <div className="w-full min-w-0">
 <motion.div
 className="relative h-[31rem] overflow-hidden rounded-[22px] border border-[var(--border-soft)] bg-[var(--background)] shadow-[0_28px_70px_-34px_rgba(0,0,0,0.55)] sm:h-[26rem] sm:rounded-[26px] lg:h-[23rem]"
 role="group"
 aria-label="Vista estática interactiva del dashboard de VitalFlow"
 data-demo-static="dashboard"
 variants={demoCanvasVariants}
 initial="hidden"
 whileInView="visible"
 viewport={demoViewport}
 >
 <div className="flex h-full min-w-0 flex-col sm:flex-row">
 <motion.header
 className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--sidebar-border)] bg-[var(--sidebar)] px-3 text-[var(--sidebar-foreground)] sm:hidden"
 variants={demoSidebarVariants}
 >
 <button
 type="button"
 aria-label="Menú del dashboard de demostración"
 className={
 "grid size-8 place-items-center rounded-full border border-[var(--sidebar-border)] bg-[var(--sidebar-accent)] text-[var(--sidebar-link-muted)] " +
 darkDemoControl
 }
 >
 <Menu className="size-3.5" aria-hidden="true" />
 </button>
 <div className="text-center">
 <p className="text-[0.6rem] font-extrabold leading-none">
 Nutrición Con Enfoque
 </p>
 <p className="mt-1 text-[0.38rem] font-extrabold uppercase tracking-[0.16em] text-[var(--sidebar-link-muted-subtle)]">
 Cliente
 </p>
 </div>
 <span className="grid size-8 place-items-center rounded-full bg-white text-[0.5rem] font-extrabold text-[var(--on-white)]">
 SV
 </span>
 </motion.header>

 <motion.aside
 className="hidden w-[8.25rem] shrink-0 flex-col bg-[var(--sidebar)] p-3 text-[var(--sidebar-foreground)] sm:flex lg:w-[9.75rem]"
 variants={demoSidebarVariants}
 >
 <motion.div
 className="flex items-center gap-2 rounded-[16px] border border-[var(--sidebar-border)] bg-[var(--sidebar-accent)] p-2.5"
 variants={demoItemVariants}
 >
 <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--sidebar-primary)] text-[0.62rem] font-extrabold text-[var(--sidebar-primary-foreground)]">
 SV
 </span>
 <div className="min-w-0">
 <p className="text-[0.4rem] font-extrabold uppercase tracking-[0.14em] text-[var(--sidebar-foreground)]/65">
 Perfil activo
 </p>
 <p className="truncate text-[0.56rem] font-extrabold text-[var(--sidebar-foreground)]">
 Sofía Vargas
 </p>
 <p className="text-[0.44rem] font-semibold text-[var(--sidebar-foreground)]/60">
 Cliente
 </p>
 </div>
 </motion.div>

 <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden py-4">
 <motion.div className="flex flex-col gap-1" variants={demoGroupVariants}>
 <p className="px-2 text-[0.38rem] font-extrabold uppercase tracking-[0.16em] text-[var(--sidebar-link-muted-subtle)]">
 Mi bienestar
 </p>
 {heroDashboardNavItems.map(({ active, icon: Icon, label }) => (
 <motion.button
 key={label}
 type="button"
 aria-pressed={active || undefined}
 variants={demoItemVariants}
 className={[
 "relative flex h-7 w-full items-center gap-2 rounded-[10px] px-2 text-left text-[0.5rem] font-semibold",
 darkDemoControl,
 active
 ? "bg-[var(--sidebar-accent)] font-extrabold text-[var(--sidebar-foreground)] before:absolute before:-left-3 before:inset-y-1 before:w-0.5 before:rounded-r-full before:bg-[var(--sidebar-foreground)]"
 : "text-[var(--sidebar-link-muted)]",
 ].join(" ")}
 >
 <Icon className="size-3 shrink-0" aria-hidden="true" />
 <span
 className={[
 "truncate text-[0.5rem]",
 active ? "font-extrabold" : "font-semibold",
 ].join(" ")}
 >
 {label}
 </span>
 </motion.button>
 ))}
 </motion.div>

 <motion.div className="flex flex-col gap-1" variants={demoGroupVariants}>
 <p className="px-2 text-[0.38rem] font-extrabold uppercase tracking-[0.16em] text-[var(--sidebar-link-muted-subtle)]">
 Acompañamiento
 </p>
 {heroDashboardSupportItems.map(({ badge, icon: Icon, label }) => (
 <motion.button
 key={label}
 type="button"
 variants={demoItemVariants}
 className={
 "flex h-7 w-full items-center gap-2 rounded-[10px] px-2 text-left text-[0.5rem] font-semibold text-[var(--sidebar-link-muted)] " +
 darkDemoControl
 }
 >
 <Icon className="size-3 shrink-0" aria-hidden="true" />
 <span className="truncate text-[0.5rem] font-semibold">{label}</span>
 {badge ? (
 <span className="ml-auto grid min-w-4 place-items-center rounded-full bg-white px-1 py-0.5 text-[0.38rem] font-extrabold leading-none text-[var(--on-white)]">
 <AnimatedCount target={Number(badge)} delay={1.55} duration={0.9} />
 </span>
 ) : null}
 </motion.button>
 ))}
 </motion.div>
 </div>

 <motion.button
 type="button"
 variants={demoItemVariants}
 className={
 "flex items-center gap-2 border-t border-[var(--sidebar-border)] pt-3 text-left text-[0.46rem] font-bold text-[var(--sidebar-link-muted-subtle)] " +
 darkDemoControl
 }
 >
 <span className="grid size-6 place-items-center rounded-full bg-[var(--sidebar-accent)]">
 <ChevronLeft className="size-2.5" aria-hidden="true" />
 </span>
 <span className="text-[0.46rem] font-bold">Sidebar abierto</span>
 </motion.button>
 </motion.aside>

 <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 bg-[var(--background)] p-3 sm:gap-3 sm:p-4">
 <motion.div className="flex flex-col gap-1 sm:px-1" variants={demoItemVariants}>
 <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.14em] text-[var(--primary)]">
 Tu resumen
 </p>
 <p className="text-lg font-bold leading-tight text-[var(--foreground)]">
 Hola, Sofía
 </p>
 <p className="max-w-sm text-[0.58rem] font-semibold leading-4 text-[var(--muted-foreground)]">
 Revisa tus planes, tu progreso y tus próximas actividades.
 </p>
 </motion.div>

 <motion.div className="grid grid-cols-2 gap-2" variants={demoGroupVariants}>
 {heroDashboardStats.map(({ detail, label, suffix, target }, index) => (
 <motion.article
 key={label}
 variants={demoMetricVariants}
 className="flex min-h-[4.35rem] min-w-0 flex-col justify-between gap-1 rounded-[14px] bg-[var(--surface)] p-2 sm:min-h-[4.65rem] sm:rounded-[16px] sm:p-2.5"
 >
 <p className="truncate text-[0.46rem] font-bold leading-tight text-[var(--muted-foreground)] sm:text-[0.48rem]">
 {label}
 </p>
 <p className="truncate text-base font-bold leading-none text-[var(--foreground)] sm:text-lg">
 <AnimatedCount
 target={target}
 suffix={suffix}
 delay={0.72 + index * 0.16}
 />
 </p>
 <p className="truncate text-[0.42rem] font-semibold text-[var(--muted-foreground)] sm:text-[0.45rem]">
 {detail}
 </p>
 </motion.article>
 ))}
 </motion.div>

 <motion.section
 className="flex min-h-0 flex-1 flex-col gap-2 rounded-[16px] bg-[var(--primary-soft)] p-2.5 sm:rounded-[18px] sm:p-3"
 variants={demoItemVariants}
 >
 <div className="flex flex-col gap-0.5">
 <p className="text-[0.7rem] font-extrabold text-[var(--foreground)]">
 Tus planes actuales
 </p>
 <p className="truncate text-[0.48rem] font-semibold text-[var(--muted-foreground)]">
 Todo lo asignado por Mariana y Camila en un mismo lugar.
 </p>
 </div>
 <motion.div
 className="grid min-h-0 flex-1 grid-cols-2 gap-2"
 variants={demoGroupVariants}
 >
 <motion.button
 type="button"
 variants={demoMetricVariants}
 className={
 "flex min-w-0 items-center gap-1.5 rounded-[12px] border border-transparent bg-[var(--background)] p-1.5 text-left sm:gap-2 sm:rounded-[14px] sm:p-2 " +
 lightDemoControl
 }
 >
 <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--secondary-soft)] text-[var(--chip-foreground)] sm:size-7">
 <Leaf className="size-3 sm:size-3.5" aria-hidden="true" />
 </span>
 <span className="min-w-0">
 <span className="block truncate text-[0.4rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
 Nutrición
 </span>
 <span className="block truncate text-[0.5rem] font-bold text-[var(--foreground)]">
 Plan personalizado
 </span>
 </span>
 </motion.button>
 <motion.button
 type="button"
 variants={demoMetricVariants}
 className={
 "flex min-w-0 items-center gap-1.5 rounded-[12px] border border-transparent bg-[var(--background)] p-1.5 text-left sm:gap-2 sm:rounded-[14px] sm:p-2 " +
 lightDemoControl
 }
 >
 <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--chip-primary)] sm:size-7">
 <Dumbbell className="size-3 sm:size-3.5" aria-hidden="true" />
 </span>
 <span className="min-w-0">
 <span className="block truncate text-[0.4rem] font-extrabold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
 Entrenamiento
 </span>
 <span className="block truncate text-[0.5rem] font-bold text-[var(--foreground)]">
 Rutina de fuerza
 </span>
 </span>
 </motion.button>
 </motion.div>
 </motion.section>
 </div>
 </div>
 </motion.div>
 </div>
 );
}

export function MessagingArtwork() {
 return (
 <motion.div
 className="relative grid aspect-square place-items-center overflow-hidden bg-[var(--primary-soft)] p-4 sm:p-6"
 data-demo-static="messages"
 variants={demoCanvasVariants}
 initial="hidden"
 whileInView="visible"
 viewport={demoViewport}
 >
 <motion.div
 className="flex h-full max-h-[20rem] w-full max-w-[18rem] flex-col overflow-hidden rounded-[28px] bg-surface shadow-xl"
 variants={demoShellVariants}
 >
 <motion.div
 className="flex items-center gap-3 border-b border-border-soft bg-surface/72 px-4 py-3"
 variants={demoItemVariants}
 >
 <span className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary-soft text-muted-foreground">
 <MessageCircle className="size-4" aria-hidden="true" />
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-extrabold text-foreground">
 Tu acompañamiento
 </p>
 <p className="truncate text-[0.6rem] font-bold text-muted">
 Mariana y Camila
 </p>
 </div>
 </motion.div>

 <motion.div
 className="min-h-0 flex-1 space-y-3 px-4 py-3"
 variants={demoGroupVariants}
 >
 <motion.div className="flex justify-center" variants={demoItemVariants}>
 <span className="rounded-full bg-surface/88 px-3 py-1 text-[0.56rem] font-extrabold text-muted shadow-sm">
 Hoy
 </span>
 </motion.div>
 <motion.div
 className="ml-auto max-w-[82%] rounded-[18px] border border-primary/20 bg-primary px-3.5 py-2 text-[0.6rem] font-semibold leading-4 text-primary-foreground"
 variants={demoBubbleRightVariants}
 >
 <TypedMessage
 text="Completé la rutina. ¿Puedo cambiar el último ejercicio?"
 delay={0.95}
 />
 <p className="mt-1 text-right text-[0.52rem] font-bold text-primary-foreground/70">
 10:24 ✓✓
 </p>
 </motion.div>
 <motion.div
 className="max-w-[82%] rounded-[18px] bg-background px-3.5 py-2 text-[0.6rem] font-semibold leading-4 text-foreground"
 variants={demoBubbleLeftVariants}
 >
 <TypedMessage
 text="Claro. Ya te dejé una alternativa que se adapta mejor a hoy."
 delay={3.35}
 speed={31}
 />
 <p className="mt-1 text-[0.52rem] font-bold text-muted">10:31</p>
 </motion.div>
 </motion.div>

 <motion.div
 className="flex items-center gap-2 border-t border-border-soft bg-surface/72 p-3"
 variants={demoItemVariants}
 >
 <button
 type="button"
 className={
 "flex min-h-10 min-w-0 flex-1 items-center rounded-[18px] border border-transparent bg-background px-3 text-left text-[0.58rem] font-semibold text-muted " +
 lightDemoControl
 }
 >
 <span className="text-[0.58rem] font-semibold">Escribe un mensaje...</span>
 </button>
 <motion.button
 type="button"
 aria-label="Enviar mensaje de demostración"
 variants={demoMetricVariants}
 className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-[background-color,transform,box-shadow] hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 active:scale-[0.9] motion-reduce:transform-none"
 >
 <Send className="size-4" aria-hidden="true" />
 </motion.button>
 </motion.div>
 </motion.div>
 </motion.div>
 );
}

export function CalendarArtwork() {
 const days = [
 { day: 29, outside: true },
 { day: 30, outside: true },
 ...Array.from({ length: 31 }, (_, index) => ({
 day: index + 1,
 outside: false,
 })),
 { day: 1, outside: true },
 { day: 2, outside: true },
 ];

 return (
 <motion.div
 className="relative grid aspect-square place-items-center overflow-hidden bg-[var(--secondary-soft)] p-4 sm:p-6"
 data-demo-static="calendar"
 variants={demoCanvasVariants}
 initial="hidden"
 whileInView="visible"
 viewport={demoViewport}
 >
 <motion.div
 className="w-full max-w-[18rem] rounded-[28px] bg-surface p-3 shadow-xl"
 variants={demoShellVariants}
 >
 <motion.div
 className="flex items-end justify-between gap-3 px-1"
 variants={demoItemVariants}
 >
 <div>
 <p className="text-[0.46rem] font-extrabold uppercase tracking-[0.14em] text-muted">
 Vista mensual
 </p>
 <p className="mt-1 text-sm font-bold capitalize text-foreground">
 julio 2026
 </p>
 </div>
 <div className="flex gap-1">
 <button
 type="button"
 aria-label="Mes anterior de demostración"
 className={
 "grid size-8 place-items-center rounded-control border border-border-soft bg-background text-muted-foreground " +
 lightDemoControl
 }
 >
 <ChevronLeft className="size-3.5" aria-hidden="true" />
 </button>
 <button
 type="button"
 aria-label="Mes siguiente de demostración"
 className={
 "grid size-8 place-items-center rounded-control border border-border-soft bg-background text-muted-foreground " +
 lightDemoControl
 }
 >
 <ChevronRight className="size-3.5" aria-hidden="true" />
 </button>
 </div>
 </motion.div>

 <motion.div
 className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.42rem] font-extrabold uppercase tracking-[0.08em] text-muted"
 variants={demoItemVariants}
 >
 {["L", "M", "X", "J", "V", "S", "D"].map((weekday, index) => (
 <span key={weekday + index}>{weekday}</span>
 ))}
 </motion.div>

 <motion.div
 className="mt-1.5 grid grid-cols-7 gap-1"
 variants={demoCalendarGridVariants}
 >
 {days.map(({ day, outside }, index) => {
 const isAppointment = !outside && (day === 14 || day === 18);
 const isSelected = !outside && day === 18;

 return (
 <motion.button
 type="button"
 key={day + "-" + index}
 aria-pressed={isSelected || undefined}
 disabled={outside}
 custom={outside ? 0 : Math.min(day, 30)}
 variants={demoDayVariants}
 className={[
 "flex min-h-7 flex-col items-center justify-center rounded-[10px] bg-background p-0.5 text-[0.48rem] font-extrabold text-foreground transition-[background-color,box-shadow,transform]",
 outside
 ? "cursor-default opacity-40"
 : "hover:bg-primary-tint/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.88] active:bg-primary-soft",
 isAppointment ? "bg-primary-tint/60" : "",
 isSelected ? "ring-2 ring-primary/25" : "",
 ].join(" ")}
 >
 <span
 className={[
 "grid size-4 place-items-center rounded-full text-[0.48rem]",
 isSelected ? "bg-primary text-primary-foreground" : "",
 day === 14 && !outside
 ? "bg-secondary text-secondary-foreground"
 : "",
 ].join(" ")}
 >
 {day}
 </span>
 {isAppointment ? <span className="mt-0.5 size-1 rounded-full bg-primary" /> : null}
 </motion.button>
 );
 })}
 </motion.div>

 <motion.button
 type="button"
 variants={demoBubbleLeftVariants}
 className={
 "mt-2 flex w-full items-center gap-2 rounded-[18px] border border-transparent bg-primary-tint/70 px-3 py-2 text-left " +
 lightDemoControl
 }
 >
 <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface text-text-secondary">
 <CalendarClock className="size-3.5" aria-hidden="true" />
 </span>
 <span className="min-w-0">
 <span className="block truncate text-[0.52rem] font-extrabold text-foreground">
 Próxima consulta nutricional
 </span>
 <span className="mt-0.5 block text-[0.44rem] font-bold text-muted">
 18 jul · 10:00 a. m.
 </span>
 </span>
 </motion.button>
 </motion.div>
 </motion.div>
 );
}

export function ProgressArtwork() {
 const metrics = [
 {
 detail: "Hábitos semanales",
 icon: BarChart3,
 label: "Cumplimiento",
 suffix: "%",
 target: 86,
 },
 {
 denominator: 7,
 detail: "Completados esta semana",
 icon: CheckCircle2,
 label: "Hábitos",
 target: 6,
 },
 {
 detail: "Sesiones completadas",
 icon: Dumbbell,
 label: "Entrenamiento",
 target: 3,
 },
 {
 detail: "Próxima cita",
 icon: CalendarClock,
 label: "Consulta",
 suffix: " jul",
 target: 18,
 },
 ];

 return (
 <motion.div
 className="relative grid aspect-square place-items-center overflow-hidden bg-[var(--primary-soft)] p-4 sm:p-6"
 data-demo-static="progress"
 variants={demoCanvasVariants}
 initial="hidden"
 whileInView="visible"
 viewport={demoViewport}
 >
 <motion.div
 className="w-full max-w-[18rem] rounded-[28px] bg-surface/85 p-3 shadow-xl"
 variants={demoShellVariants}
 >
 <motion.div className="px-1" variants={demoItemVariants}>
 <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.14em] text-muted">
 Vista actual
 </p>
 <div className="mt-1 flex items-end justify-between gap-3">
 <div>
 <p className="text-sm font-extrabold text-foreground">Sofía Vargas</p>
 <p className="text-[0.54rem] font-semibold text-muted">
 Nutrición activa · Entrenamiento activo
 </p>
 </div>
 </div>
 </motion.div>

 <motion.nav
 className="mt-3 flex flex-wrap gap-1.5"
 aria-label="Secciones estáticas de progreso"
 variants={demoGroupVariants}
 >
 {["Resumen", "Nutrición", "Entrenamiento"].map((label, index) => (
 <motion.button
 type="button"
 key={label}
 aria-pressed={index === 0 || undefined}
 variants={demoItemVariants}
 className={[
 "inline-flex min-h-8 items-center rounded-control px-2.5 text-[0.5rem] font-extrabold transition-[background-color,color,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.94]",
 index === 0
 ? "bg-primary text-primary-foreground hover:bg-primary-hover"
 : "text-muted-foreground hover:bg-primary-soft hover:text-foreground active:bg-primary-soft",
 ].join(" ")}
 >
 <span className="text-[0.5rem] font-extrabold">{label}</span>
 </motion.button>
 ))}
 </motion.nav>

 <motion.div
 className="mt-3 grid grid-cols-2 gap-2"
 variants={demoGroupVariants}
 >
 {metrics.map(({ denominator, detail, icon: Icon, label, suffix, target }, index) => (
 <motion.article
 key={label}
 variants={demoMetricVariants}
 className="h-fit self-start rounded-[22px] bg-background p-2.5"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <p className="truncate text-[0.44rem] font-extrabold uppercase tracking-[0.1em] text-muted">
 {label}
 </p>
 <p className="mt-1 font-heading text-base font-bold leading-none text-foreground">
 <AnimatedCount
 target={target}
 denominator={denominator}
 suffix={suffix}
 delay={0.9 + index * 0.18}
 />
 </p>
 </div>
 <motion.span
 className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-text-secondary"
 variants={demoMetricVariants}
 >
 <Icon className="size-3.5" aria-hidden="true" />
 </motion.span>
 </div>
 <p className="mt-2 text-[0.46rem] font-semibold leading-3 text-muted-foreground">
 {detail}
 </p>
 </motion.article>
 ))}
 </motion.div>
 </motion.div>
 </motion.div>
 );
}

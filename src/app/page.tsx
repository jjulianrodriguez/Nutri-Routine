"use client";

import {
 ArrowUpRight,
 CalendarCheck,
 Check,
 CircleDot,
 ClipboardCheck,
 Clock3,
 HeartPulse,
 LockKeyhole,
 MapPin,
 MessageCircle,
 MoveRight,
 RefreshCw,
 ShieldCheck,
 Sparkles,
 UserRoundCheck,
 Waves,
 Zap,
 type LucideIcon,
} from "lucide-react";
import {
 motion,
 useMotionValue,
 useReducedMotion,
 useScroll,
 useSpring,
 useTransform,
 type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";

import { Footer } from "@/components/app/marketing/Footer";
import { Navbar } from "@/components/app/marketing/Navbar";
import { SmoothScroll } from "@/components/app/marketing/SmoothScroll";

const whatsappHref = "https://wa.me/50688332426";
const motionEase = [0.18, 0.82, 0.22, 1] as const;
const displayFontStyle = {
 fontFamily: "var(--font-landing-display)",
 fontWeight: 500,
} as const;

const marianaBenefits = [
 "salud hormonal",
 "salud digestiva",
 "más energía",
 "prevención consciente",
 "sistema inmunológico",
 "sin restricciones extremas",
];

const camilaBenefits = [
 "rendimiento deportivo",
 "fuerza y movilidad",
 "rutinas personalizadas",
 "seguimiento continuo",
 "desde casa o gym",
 "para todos los niveles",
];

const benefitCards: Array<{
 title: string;
 copy: string;
 accent: string;
 icon: LucideIcon;
 span: string;
}> = [
 {
 title: "Disfrutá tus alimentos sin culpa",
 copy: "Decisiones con criterio, flexibilidad y una relación más tranquila con la comida.",
 accent: "bg-[var(--ln-rose)] text-[var(--ln-night)]",
 icon: HeartPulse,
 span: "md:col-span-4 lg:col-span-3",
 },
 {
 title: "Más energía y vitalidad",
 copy: "Hábitos, descanso y movimiento alineados para que el cuerpo responda mejor.",
 accent: "bg-[var(--ln-peach)] text-[var(--ln-night)]",
 icon: Zap,
 span: "md:col-span-2 lg:col-span-2",
 },
 {
 title: "Salud hormonal equilibrada",
 copy: "Mirada funcional para entender señales, ciclos, síntomas y contexto diario.",
 accent: "bg-[var(--ln-mint)] text-[var(--ln-night)]",
 icon: Waves,
 span: "md:col-span-3 lg:col-span-2",
 },
 {
 title: "Rendimiento deportivo mejorado",
 copy: "Entrenamiento progresivo, medible y adaptado a tu punto de partida.",
 accent: "bg-[var(--ln-forest)] text-[var(--ln-paper)]",
 icon: MoveRight,
 span: "md:col-span-3 lg:col-span-2",
 },
 {
 title: "Fuerza y movilidad funcional",
 copy: "Rutinas para moverte mejor, ganar confianza y construir una base sostenible.",
 accent: "bg-[var(--ln-sage)] text-[var(--ln-night)]",
 icon: CircleDot,
 span: "md:col-span-2 lg:col-span-2",
 },
 {
 title: "Sin restricciones extremas",
 copy: "Una estrategia que se ajusta a tu vida, no una lista interminable de prohibiciones.",
 accent: "bg-[var(--ln-sand)] text-[var(--ln-night)]",
 icon: ShieldCheck,
 span: "md:col-span-4 lg:col-span-3",
 },
 {
 title: "Salud digestiva",
 copy: "Lectura integral de síntomas, tolerancias, rutina y elecciones cotidianas.",
 accent: "bg-[var(--ln-clay)] text-[var(--ln-paper)]",
 icon: Sparkles,
 span: "md:col-span-3 lg:col-span-2",
 },
 {
 title: "Seguimiento real y humano",
 copy: "Ajustes, conversación y claridad para sostener el proceso cuando la vida se mueve.",
 accent: "bg-[var(--ln-mist)] text-[var(--ln-night)]",
 icon: Clock3,
 span: "md:col-span-3 lg:col-span-3",
 },
];

const processSteps: Array<{
 title: string;
 copy: string;
 icon: LucideIcon;
}> = [
 {
 title: "Consulta",
 copy: "Escuchamos tu historia, objetivos, síntomas, rutina y punto de partida sin juicio.",
 icon: UserRoundCheck,
 },
 {
 title: "Plan",
 copy: "Definimos prioridades de nutrición, entrenamiento y hábitos con una ruta clara.",
 icon: ClipboardCheck,
 },
 {
 title: "Seguimiento",
 copy: "Revisamos avances, energía, adherencia y dudas para sostener el proceso.",
 icon: CalendarCheck,
 },
 {
 title: "Ajustes",
 copy: "Adaptamos el plan cuando cambian tus horarios, señales del cuerpo o metas.",
 icon: RefreshCw,
 },
];

const trustItems: Array<{
 title: string;
 copy: string;
 icon: LucideIcon;
}> = [
 {
 title: "Modalidad flexible",
 copy: "Consultas presenciales y virtuales desde Costa Rica, según disponibilidad profesional.",
 icon: MapPin,
 },
 {
 title: "Privacidad",
 copy: "Tu información se trata como parte de un acompañamiento privado y profesional.",
 icon: LockKeyhole,
 },
 {
 title: "Acompañamiento humano",
 copy: "La plataforma organiza el seguimiento, pero las decisiones se conversan contigo.",
 icon: MessageCircle,
 },
];

const faqs = [
 {
 question: "¿Necesito un código para crear cuenta?",
 answer:
 "Sí. El registro usa un código privado entregado por tu profesional para proteger el acceso al espacio de seguimiento.",
 },
 {
 question: "¿Puedo iniciar aunque no tenga todo claro?",
 answer:
 "Sí. La primera consulta existe para ordenar tus señales, metas y prioridades antes de definir el plan.",
 },
 {
 question: "¿El plan cambia con el tiempo?",
 answer:
 "Sí. El seguimiento permite ajustar nutrición, entrenamiento y hábitos según tu avance real.",
 },
];

function Reveal({
 children,
 className,
 delay = 0,
}: {
 children: ReactNode;
 className?: string;
 delay?: number;
}) {
 const reduceMotion = useReducedMotion();

 return (
 <motion.div
 initial={
 reduceMotion ? false : { opacity: 0, y: 34, filter: "blur(14px)" }
 }
 whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
 viewport={{ once: true, margin: "-90px" }}
 transition={{
 delay: reduceMotion ? 0 : delay,
 duration: 0.76,
 ease: motionEase,
 }}
 className={className}
 >
 {children}
 </motion.div>
 );
}

function PremiumLink({
 children,
 href = whatsappHref,
 variant = "primary",
 className = "",
}: {
 children: ReactNode;
 href?: string;
 variant?: "primary" | "secondary" | "ghost" | "ink";
 className?: string;
}) {
 const base =
 "group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-5 py-3 text-sm font-black transition-none sm:px-6";
 const variants = {
 primary:
 "bg-[var(--ln-clay)] !text-[var(--ln-paper)] shadow-[0_18px_48px_-34px_rgb(var(--raspberry-rgb)_/_0.34)]",
 secondary:
 " border-[var(--ln-night)]/10 bg-[var(--ln-paper)] !text-[var(--ln-night)] shadow-[0_12px_34px_-28px_rgb(var(--foreground-rgb)_/_0.18)]",
 ghost:
 " border-[var(--ln-night)]/10 bg-[var(--ln-paper)] !text-[var(--ln-night)] shadow-[0_12px_34px_-30px_rgb(var(--foreground-rgb)_/_0.16)]",
 ink: "bg-[var(--ln-night)] !text-[var(--ln-paper)] shadow-[0_24px_70px_-42px_rgb(var(--raspberry-rgb)_/_0.42)]",
 };
 const classes = `${base} ${variants[variant]} ${className}`;
 const content = (
 <>
 <span className="absolute inset-0 translate-y-full rounded-full bg-[var(--ln-clay-hover)] transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-y-0" />
 <span className="relative z-10">{children}</span>
 <ArrowUpRight className="relative z-10 size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
 </>
 );

 if (href.startsWith("http")) {
 return (
 <motion.a
 href={href}
 target="_blank"
 rel="noopener noreferrer"
 whileHover={{ y: -3, scale: 1.01 }}
 whileTap={{ scale: 0.985 }}
 className={classes}
 >
 {content}
 </motion.a>
 );
 }

 return (
 <motion.span
 whileHover={{ y: -3, scale: 1.01 }}
 whileTap={{ scale: 0.985 }}
 >
 <Link href={href} className={classes}>
 {content}
 </Link>
 </motion.span>
 );
}

function SectionEyebrow({
 children,
 light = false,
}: {
 children: ReactNode;
 light?: boolean;
}) {
 return (
 <span
 className={[
 "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em]",
 light
 ? " border-[var(--ln-night)]/10 bg-[var(--ln-paper)] text-[var(--ln-forest)] shadow-[0_16px_40px_-34px_rgb(var(--raspberry-rgb)_/_0.2)]"
 : " border-[var(--ln-night)]/10 bg-[var(--ln-paper)] text-[var(--ln-forest)]",
 ].join(" ")}
 >
 <span className="size-1.5 rounded-full bg-[var(--ln-peach)]" />
 {children}
 </span>
 );
}

const plantLeaves = [
 {
 cx: 210,
 cy: 154,
 rotate: -26,
 scale: 0.86,
 fill: "var(--ln-mint)",
 radius: 190,
 strength: 28,
 twist: -8,
 },
 {
 cx: 342,
 cy: 96,
 rotate: 16,
 scale: 0.74,
 fill: "var(--ln-peach)",
 radius: 172,
 strength: 24,
 twist: 7,
 },
 {
 cx: 492,
 cy: 158,
 rotate: 42,
 scale: 0.9,
 fill: "var(--ln-olive)",
 radius: 190,
 strength: 30,
 twist: 9,
 },
 {
 cx: 286,
 cy: 278,
 rotate: -48,
 scale: 1.04,
 fill: "var(--ln-sage)",
 radius: 210,
 strength: 34,
 twist: -10,
 },
 {
 cx: 544,
 cy: 300,
 rotate: 20,
 scale: 0.98,
 fill: "var(--ln-forest)",
 radius: 208,
 strength: 32,
 twist: 9,
 },
 {
 cx: 372,
 cy: 432,
 rotate: -18,
 scale: 1.1,
 fill: "var(--ln-rose)",
 radius: 228,
 strength: 38,
 twist: -8,
 },
 {
 cx: 608,
 cy: 448,
 rotate: 48,
 scale: 0.96,
 fill: "var(--ln-peach)",
 radius: 208,
 strength: 32,
 twist: 11,
 },
 {
 cx: 440,
 cy: 610,
 rotate: -42,
 scale: 1.02,
 fill: "var(--ln-olive)",
 radius: 214,
 strength: 34,
 twist: -9,
 },
 {
 cx: 626,
 cy: 642,
 rotate: 26,
 scale: 0.82,
 fill: "var(--ln-mint)",
 radius: 190,
 strength: 26,
 twist: 8,
 },
] as const;

type PlantLeafShape = (typeof plantLeaves)[number];

function PlantLeaf({
 leaf,
 pointerX,
 pointerY,
 reduceMotion,
}: {
 leaf: PlantLeafShape;
 pointerX: MotionValue<number>;
 pointerY: MotionValue<number>;
 reduceMotion: boolean;
}) {
 const repelX = useTransform([pointerX, pointerY], ([latestX, latestY]) => {
 const x = Number(latestX);
 const y = Number(latestY);
 const dx = leaf.cx - x;
 const dy = leaf.cy - y;
 const distance = Math.max(Math.hypot(dx, dy), 1);
 const intensity = Math.max(0, 1 - distance / leaf.radius) ** 1.75;

 return (dx / distance) * leaf.strength * intensity;
 });
 const repelY = useTransform([pointerX, pointerY], ([latestX, latestY]) => {
 const x = Number(latestX);
 const y = Number(latestY);
 const dx = leaf.cx - x;
 const dy = leaf.cy - y;
 const distance = Math.max(Math.hypot(dx, dy), 1);
 const intensity = Math.max(0, 1 - distance / leaf.radius) ** 1.75;

 return (dy / distance) * leaf.strength * intensity;
 });
 const repelRotate = useTransform(
 [pointerX, pointerY],
 ([latestX, latestY]) => {
 const x = Number(latestX);
 const y = Number(latestY);
 const dx = leaf.cx - x;
 const dy = leaf.cy - y;
 const distance = Math.max(Math.hypot(dx, dy), 1);
 const intensity = Math.max(0, 1 - distance / leaf.radius) ** 1.7;

 return Math.sign(dx || 1) * leaf.twist * intensity;
 },
 );
 const x = useSpring(repelX, { damping: 22, stiffness: 170, mass: 0.42 });
 const y = useSpring(repelY, { damping: 22, stiffness: 170, mass: 0.42 });
 const rotate = useSpring(repelRotate, {
 damping: 24,
 stiffness: 155,
 mass: 0.44,
 });

 return (
 <motion.g
 style={
 reduceMotion
 ? undefined
 : {
 x,
 y,
 rotate,
 transformBox: "fill-box",
 transformOrigin: "center",
 }
 }
 >
 <g
 transform={`translate(${leaf.cx} ${leaf.cy}) rotate(${leaf.rotate}) scale(${leaf.scale})`}
 >
 <path
 d="M0 0C-44-29-88-26-122 8C-92 53-34 55 0 0Z"
 fill={leaf.fill}
 stroke="rgb(var(--surface-rgb) / 0.72)"
 strokeWidth="2"
 />
 <path
 d="M-9 1C-42 4-78 15-111 34"
 fill="none"
 stroke="rgb(var(--secondary-rgb) / 0.38)"
 strokeLinecap="round"
 strokeWidth="2"
 />
 </g>
 </motion.g>
 );
}

function InteractivePlantSvg({ reduceMotion }: { reduceMotion: boolean }) {
 const svgRef = useRef<SVGSVGElement>(null);
 const pointerX = useMotionValue(9999);
 const pointerY = useMotionValue(9999);

 function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
 if (reduceMotion) {
 return;
 }

 const rect = svgRef.current?.getBoundingClientRect();

 if (!rect) {
 return;
 }

 pointerX.set(((event.clientX - rect.left) / rect.width) * 760);
 pointerY.set(((event.clientY - rect.top) / rect.height) * 820);
 }

 function handlePointerLeave() {
 pointerX.set(9999);
 pointerY.set(9999);
 }

 return (
 <svg
 ref={svgRef}
 viewBox="0 0 760 820"
 role="img"
 aria-label="Planta SVG animada con hojas organicas"
 className="h-auto w-full overflow-visible"
 onPointerMove={handlePointerMove}
 onPointerLeave={handlePointerLeave}
 >
 <defs>
 <filter
 id="heroPlantShadow"
 x="-20%"
 y="-16%"
 width="140%"
 height="140%"
 colorInterpolationFilters="sRGB"
 >
 <feDropShadow
 dx="0"
 dy="28"
 stdDeviation="24"
 floodColor="var(--primary)"
 floodOpacity="0.17"
 />
 </filter>
 </defs>

 <motion.g
 filter="url(#heroPlantShadow)"
 animate={
 reduceMotion
 ? undefined
 : { y: [0, -8, 0], rotate: [0, 0.45, -0.25, 0] }
 }
 transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
 style={{ transformOrigin: "68% 52%" }}
 >
 <path
 d="M716 776C604 684 604 575 654 454C692 363 684 252 608 154"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="13"
 />
 <path
 d="M694 710C604 636 494 624 422 602"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="8"
 />
 <path
 d="M664 528C584 462 504 430 388 410"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="8"
 />
 <path
 d="M646 382C556 318 452 290 292 280"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="7"
 />
 <path
 d="M624 212C514 160 410 128 294 116"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="7"
 />
 <path
 d="M670 486C686 412 654 330 536 286"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="7"
 />
 <path
 d="M690 650C710 586 684 520 604 444"
 fill="none"
 stroke="var(--ln-forest)"
 strokeLinecap="round"
 strokeWidth="7"
 />

 {plantLeaves.map((leaf) => (
 <PlantLeaf
 key={`${leaf.cx}-${leaf.cy}`}
 leaf={leaf}
 pointerX={pointerX}
 pointerY={pointerY}
 reduceMotion={reduceMotion}
 />
 ))}
 </motion.g>
 </svg>
 );
}

function HeroDumbbellSvg({ reduceMotion }: { reduceMotion: boolean }) {
 return (
 <motion.svg
 viewBox="0 0 420 190"
 role="img"
 aria-label="Pesa SVG animada"
 className="h-auto w-full overflow-visible"
 initial={reduceMotion ? false : { opacity: 0, y: 18, rotate: -10 }}
 animate={
 reduceMotion
 ? { opacity: 1 }
 : { opacity: 1, y: [0, -7, 0], rotate: [-9, -6.5, -9] }
 }
 whileHover={
 reduceMotion
 ? undefined
 : { y: -12, rotate: -3, scale: 1.025 }
 }
 transition={{
 opacity: { duration: 0.5, ease: motionEase },
 y: { duration: 5.8, repeat: Infinity, ease: "easeInOut" },
 rotate: { duration: 5.8, repeat: Infinity, ease: "easeInOut" },
 scale: { duration: 0.28, ease: motionEase },
 }}
 >
 <defs>
 <filter
 id="heroDumbbellShadow"
 x="-18%"
 y="-30%"
 width="136%"
 height="160%"
 colorInterpolationFilters="sRGB"
 >
 <feDropShadow
 dx="0"
 dy="24"
 stdDeviation="16"
 floodColor="var(--primary)"
 floodOpacity="0.2"
 />
 </filter>
 </defs>
 <g filter="url(#heroDumbbellShadow)">
 <rect
 x="116"
 y="80"
 width="188"
 height="30"
 rx="15"
 fill="var(--ln-clay)"
 />
 <path
 d="M146 82H274"
 stroke="rgb(var(--surface-rgb) / 0.28)"
 strokeLinecap="round"
 strokeWidth="4"
 />
 <rect
 x="42"
 y="48"
 width="48"
 height="94"
 rx="18"
 fill="var(--ln-forest)"
 />
 <rect
 x="86"
 y="34"
 width="54"
 height="122"
 rx="20"
 fill="var(--ln-forest)"
 />
 <rect
 x="280"
 y="34"
 width="54"
 height="122"
 rx="20"
 fill="var(--ln-forest)"
 />
 <rect
 x="330"
 y="48"
 width="48"
 height="94"
 rx="18"
 fill="var(--ln-forest)"
 />
 <path
 d="M62 61V129M106 49V141M314 49V141M358 61V129"
 stroke="rgb(var(--raspberry-rgb) / 0.18)"
 strokeLinecap="round"
 strokeWidth="5"
 />
 <path
 d="M48 63C58 54 71 51 85 54M287 48C300 40 317 40 328 49"
 fill="none"
 stroke="rgb(var(--surface-rgb) / 0.55)"
 strokeLinecap="round"
 strokeWidth="5"
 />
 </g>
 </motion.svg>
 );
}

function HeroProductVisual() {
 const ref = useRef<HTMLDivElement>(null);
 const reduceMotion = useReducedMotion();
 const { scrollYProgress } = useScroll({
 target: ref,
 offset: ["start end", "end start"],
 });
 const progress = useSpring(scrollYProgress, {
 damping: 36,
 stiffness: 105,
 mass: 0.55,
 });
 const plantY = useTransform(progress, [0, 1], [24, -64]);
 const plantX = useTransform(progress, [0, 1], [28, -26]);
 const plantRotate = useTransform(progress, [0, 1], [1.4, -1.2]);
 const haloY = useTransform(progress, [0, 1], [12, -34]);
 const shadowScale = useTransform(progress, [0, 1], [1, 0.78]);

 return (
 <div
 ref={ref}
 className="pointer-events-none relative mx-auto min-h-[22rem] w-full max-w-[33rem] overflow-visible sm:min-h-[32rem] lg:min-h-[43rem] lg:max-w-[38rem]"
 >
 <motion.div
 style={reduceMotion ? undefined : { y: haloY }}
 initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{
 duration: 0.9,
 delay: reduceMotion ? 0 : 0.16,
 ease: motionEase,
 }}
 className="hidden"
 />
 <motion.div
 style={reduceMotion ? undefined : { scale: shadowScale }}
 className="hidden"
 />

 <motion.div
 style={
 reduceMotion
 ? undefined
 : { x: plantX, y: plantY, rotate: plantRotate }
 }
 initial={
 reduceMotion ? false : { opacity: 0, x: 54, y: 28, scale: 0.96 }
 }
 animate={
 reduceMotion
 ? { opacity: 1, x: 0, y: 0, scale: 1 }
 : { opacity: 1, scale: 1 }
 }
 whileHover={
 reduceMotion
 ? undefined
 : { scale: 1.025, filter: "saturate(1.08) brightness(1.02)" }
 }
 whileTap={reduceMotion ? undefined : { scale: 0.99 }}
 transition={{
 opacity: {
 duration: 0.72,
 delay: reduceMotion ? 0 : 0.18,
 ease: motionEase,
 },
 y: {
 duration: 0.72,
 delay: reduceMotion ? 0 : 0.18,
 ease: motionEase,
 },
 scale: {
 duration: 0.72,
 delay: reduceMotion ? 0 : 0.18,
 ease: motionEase,
 },
 }}
 className="pointer-events-auto absolute -right-20 top-0 w-[28rem] max-w-none cursor-default will-change-transform sm:-right-28 sm:-top-4 sm:w-[39rem] lg:-right-36 lg:-top-8 lg:w-[48rem]"
 >
 <InteractivePlantSvg reduceMotion={Boolean(reduceMotion)} />
 </motion.div>

 <div className="pointer-events-auto absolute bottom-4 left-2 z-10 w-32 origin-center sm:bottom-10 sm:left-4 sm:w-44 lg:bottom-16 lg:w-52">
 <HeroDumbbellSvg reduceMotion={Boolean(reduceMotion)} />
 </div>
 </div>
 );
}

function Hero() {
 const reduceMotion = useReducedMotion();
 const ref = useRef<HTMLElement>(null);
 const { scrollYProgress } = useScroll({
 target: ref,
 offset: ["start start", "end start"],
 });
 const progress = useSpring(scrollYProgress, {
 damping: 38,
 stiffness: 110,
 mass: 0.55,
 });
 const headlineY = useTransform(progress, [0, 1], [0, 72]);

 return (
 <section
 ref={ref}
 className="relative min-h-dvh overflow-hidden bg-[var(--ln-cream)] px-5 pb-16 pt-28 text-[var(--ln-night)] sm:px-8 sm:pb-24 sm:pt-32 lg:px-10"
 >
 <div className="hidden" />
 <div className="hidden" />

 <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(26rem,0.82fr)]">
 <motion.div
 style={reduceMotion ? undefined : { y: headlineY }}
 initial={reduceMotion ? false : { opacity: 0, y: 34 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.9, ease: motionEase }}
 className="min-w-0"
 >
 <p className="mb-6 inline-flex items-center gap-2 rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--ln-forest)]">
 <span className="size-2 rounded-full bg-[var(--ln-peach)]" />
 Nutrición Con Enfoque
 </p>
 <h1
 style={displayFontStyle}
 className="max-w-[14ch] text-balance text-[clamp(4.1rem,10.2vw,10rem)] leading-[0.78] tracking-[-0.035em] text-[var(--ln-night)]"
 >
 Cuerpo fuerte,
 <span className="block italic text-[var(--ln-clay)]">
 salud tranquila.
 </span>
 </h1>

 <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,31rem)_auto] lg:items-end">
 <p className="max-w-2xl text-lg leading-8 text-[var(--ln-muted)] sm:text-xl">
 Un acompañamiento premium y personalizado para trabajar tu
 nutrición, tu fuerza y tus hábitos con una guía real, cercana y
 profesional.
 </p>
 <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
 <PremiumLink>Agendar consulta</PremiumLink>
 <PremiumLink href="/login" variant="ghost">
 Iniciar sesión
 </PremiumLink>
 </div>
 </div>
 </motion.div>

 <HeroProductVisual />
 </div>
 </section>
 );
}

function ProcessSection() {
 return (
 <section
 id="proceso"
 className="relative overflow-hidden border-t border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-5 py-20 text-[var(--ln-night)] sm:px-8 sm:py-28 lg:px-10"
 >
 <div className="hidden" />
 <div className="relative mx-auto max-w-7xl">
 <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
 <Reveal>
 <SectionEyebrow>Cómo funciona</SectionEyebrow>
 <h2
 style={displayFontStyle}
 className="mt-7 max-w-3xl text-balance text-[clamp(3.2rem,7vw,7.2rem)] leading-[0.86] tracking-[-0.025em]"
 >
 Un proceso simple, personalizado y medible.
 </h2>
 </Reveal>
 <Reveal delay={0.08}>
 <p className="max-w-2xl text-lg leading-8 text-[var(--ln-muted)]">
 La experiencia combina consulta profesional, plan de acción,
 seguimiento y ajustes para que nutrición y entrenamiento se
 sostengan en tu vida real.
 </p>
 </Reveal>
 </div>

 <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {processSteps.map((step, index) => {
 const Icon = step.icon;

 return (
 <Reveal key={step.title} delay={index * 0.055}>
 <article className="flex h-full min-h-[18rem] flex-col justify-between rounded-[1.6rem] border-[var(--ln-night)]/8 p-6 shadow-[0_34px_96px_-72px_rgb(var(--raspberry-rgb)_/_0.24)]">
 <div className="flex items-start justify-between gap-4">
 <span className="grid size-12 place-items-center rounded-full bg-[var(--ln-mint)] text-[var(--ln-night)]">
 <Icon className="size-5" strokeWidth={1.8} />
 </span>
 <span
 style={displayFontStyle}
 className="text-5xl leading-none text-[var(--ln-night)]/14"
 >
 0{index + 1}
 </span>
 </div>
 <div className="mt-10">
 <h3 className="text-2xl font-black text-[var(--ln-night)]">
 {step.title}
 </h3>
 <p className="mt-3 text-sm font-bold leading-6 text-[var(--ln-muted)]">
 {step.copy}
 </p>
 </div>
 </article>
 </Reveal>
 );
 })}
 </div>
 </div>
 </section>
 );
}

function BenefitChips({ benefits }: { benefits: string[] }) {
 return (
 <ul className="mt-8 flex flex-wrap gap-2.5">
 {benefits.map((benefit, index) => (
 <Reveal key={benefit} delay={index * 0.035}>
 <li className="inline-flex items-center gap-2 rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-3.5 py-2 text-sm font-extrabold text-[var(--ln-night)] shadow-[0_16px_42px_-34px_rgb(var(--raspberry-rgb)_/_0.28)]">
 <Check className="size-4 text-[var(--ln-clay)]" />
 {benefit}
 </li>
 </Reveal>
 ))}
 </ul>
 );
}

function ProfessionalVisual({
 number,
 label,
 monogram,
 accent,
 reverse = false,
}: {
 number: string;
 label: string;
 monogram: string;
 accent: string;
 reverse?: boolean;
}) {
 const ref = useRef<HTMLDivElement>(null);
 const reduceMotion = useReducedMotion();
 const { scrollYProgress } = useScroll({
 target: ref,
 offset: ["start end", "end start"],
 });
 const progress = useSpring(scrollYProgress, {
 damping: 34,
 stiffness: 105,
 mass: 0.55,
 });
 const y = useTransform(progress, [0, 1], [50, -50]);

 return (
 <motion.div
 ref={ref}
 style={reduceMotion ? undefined : { y }}
 className={[
 "relative min-h-[28rem] overflow-hidden rounded-[2rem] border-[var(--ln-night)]/10 bg-[var(--ln-paper)] p-4 shadow-[0_42px_110px_-76px_rgb(var(--raspberry-rgb)_/_0.34)] sm:rounded-[2.5rem]",
 reverse ? "lg:col-start-2" : "",
 ].join(" ")}
 >
 <div className="hidden" />
 <div className="relative flex min-h-[25rem] flex-col justify-between overflow-hidden rounded-[1.5rem] border-[var(--ln-night)]/10 bg-[var(--ln-cream)] p-6 sm:rounded-[2rem] sm:p-7 lg:min-h-[32rem]">
 <div
 className="hidden"
 style={{ backgroundColor: accent }}
 />
 <div className="absolute left-8 top-1/2 h-px w-[78%] bg-[var(--ln-night)]/12" />
 <div className="absolute bottom-8 right-8 h-[70%] w-px bg-[var(--ln-night)]/12" />

 <div className="relative flex items-start justify-between gap-5">
 <div>
 <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--ln-forest)]">
 capítulo {number}
 </p>
 <p className="mt-2 max-w-[11rem] text-sm font-bold leading-5 text-[var(--ln-muted)]">
 {label}
 </p>
 </div>
 <span
 style={displayFontStyle}
 className="text-8xl leading-none text-[var(--ln-night)]"
 >
 {number}
 </span>
 </div>

 <div className="relative mx-auto grid size-48 place-items-center rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-paper)] shadow-[0_28px_72px_-50px_rgb(var(--raspberry-rgb)_/_0.34)] sm:size-56">
 <span
 style={displayFontStyle}
 className="text-8xl leading-none text-[var(--ln-night)]"
 >
 {monogram}
 </span>
 </div>

 <div className="relative grid gap-3 sm:grid-cols-2">
 {["acompañamiento", "estrategia"].map((item) => (
 <span
 key={item}
 className="rounded-full border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[var(--ln-forest)]"
 >
 {item}
 </span>
 ))}
 </div>
 </div>
 </motion.div>
 );
}

function ProfessionalChapter({
 id,
 number,
 label,
 name,
 subtitle,
 description,
 benefits,
 cta,
 accent,
 monogram,
 reverse = false,
}: {
 id?: string;
 number: string;
 label: string;
 name: string;
 subtitle: string;
 description: string;
 benefits: string[];
 cta: string;
 accent: string;
 monogram: string;
 reverse?: boolean;
}) {
 return (
 <section
 id={id}
 className="relative overflow-hidden border-t border-[var(--ln-night)]/10 bg-[var(--ln-paper)] px-5 py-20 sm:px-8 sm:py-28 lg:px-10"
 >
 <div className="hidden" />
 <div
 className={[
 "relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.86fr_1.14fr]",
 reverse ? "lg:grid-flow-col-dense" : "",
 ].join(" ")}
 >
 <ProfessionalVisual
 number={number}
 label={label}
 monogram={monogram}
 accent={accent}
 reverse={reverse}
 />

 <div className={reverse ? "lg:col-start-1" : ""}>
 <Reveal>
 <SectionEyebrow>{label}</SectionEyebrow>
 <h2
 style={displayFontStyle}
 className="mt-7 max-w-4xl text-balance text-[clamp(3.2rem,7vw,7.4rem)] leading-[0.88] tracking-[-0.025em] text-[var(--ln-night)]"
 >
 {name}
 </h2>
 <p className="mt-5 max-w-2xl text-xl font-black text-[var(--ln-forest)]">
 {subtitle}
 </p>
 <p className="mt-7 max-w-2xl text-base leading-8 text-[var(--ln-muted)] sm:text-lg">
 {description}
 </p>
 </Reveal>

 <BenefitChips benefits={benefits} />

 <Reveal
 delay={0.16}
 className="mt-10 flex flex-col gap-4 sm:flex-row"
 >
 <PremiumLink variant="ink">{cta}</PremiumLink>
 <PremiumLink href="#enfoque" variant="secondary">
 Ver beneficios
 </PremiumLink>
 </Reveal>
 </div>
 </div>
 </section>
 );
}

function WhySection() {
 return (
 <section
 id="enfoque"
 className="relative overflow-hidden border-y border-[var(--ln-night)]/8 bg-[var(--ln-sage)] px-5 py-20 text-[var(--ln-night)] sm:px-8 sm:py-28 lg:px-10"
 >
 <div className="hidden" />
 <div className="relative mx-auto max-w-7xl">
 <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
 <Reveal>
 <SectionEyebrow light>
 ¿Por qué trabajar con nosotras?
 </SectionEyebrow>
 <h2
 style={displayFontStyle}
 className="mt-7 max-w-3xl text-balance text-[clamp(3.4rem,8vw,8rem)] leading-[0.86] tracking-[-0.025em] text-[var(--ln-night)]"
 >
 Más que un plan: un proceso con criterio.
 </h2>
 </Reveal>

 <Reveal delay={0.08}>
 <p className="max-w-2xl text-lg leading-8 text-[var(--ln-muted)]">
 Cada beneficio se trabaja desde dos miradas complementarias:
 ciencia nutricional, movimiento progresivo y acompañamiento que
 entiende tu rutina real.
 </p>
 </Reveal>
 </div>

 <div className="mt-14 grid auto-rows-[minmax(13rem,auto)] gap-4 md:grid-cols-6 lg:grid-cols-7">
 {benefitCards.map((benefit, index) => {
 const Icon = benefit.icon;

 return (
 <Reveal
 key={benefit.title}
 delay={index * 0.035}
 className={benefit.span}
 >
 <motion.article
 whileHover={{ y: -8, scale: 1.012 }}
 transition={{ duration: 0.28, ease: motionEase }}
 className="group flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-[1.4rem] border-[var(--ln-night)]/8 p-5 shadow-[0_34px_90px_-66px_rgb(var(--raspberry-rgb)_/_0.22)] sm:p-6"
 >
 <div className="flex items-start justify-between gap-4">
 <span
 className={`grid size-11 place-items-center rounded-full ${benefit.accent} shadow-[0_18px_50px_-34px_rgb(var(--raspberry-rgb)_/_0.74)]`}
 >
 <Icon className="size-5" strokeWidth={1.8} />
 </span>
 <span
 style={displayFontStyle}
 className="text-4xl leading-none text-[var(--ln-night)]/16 transition-colors duration-300 group-hover:text-[var(--ln-clay)]/70"
 >
 0{index + 1}
 </span>
 </div>

 <div className="mt-8">
 <h3 className="max-w-xl text-2xl font-black leading-tight text-[var(--ln-night)]">
 {benefit.title}
 </h3>
 <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ln-muted)]">
 {benefit.copy}
 </p>
 </div>
 </motion.article>
 </Reveal>
 );
 })}
 </div>
 </div>
 </section>
 );
}

function TrustSection() {
 return (
 <section
 id="confianza"
 className="relative overflow-hidden border-y border-[var(--ln-night)]/8 bg-[var(--ln-night)] px-5 py-20 text-[var(--ln-paper)] sm:px-8 sm:py-28 lg:px-10"
 >
 <div className="hidden" />
 <div className="relative mx-auto max-w-7xl">
 <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
 <Reveal>
 <SectionEyebrow light>Confianza</SectionEyebrow>
 <h2
 style={displayFontStyle}
 className="mt-7 max-w-3xl text-balance text-[clamp(3.2rem,7vw,7.2rem)] leading-[0.86] tracking-[-0.025em]"
 >
 Un espacio privado para avanzar con claridad.
 </h2>
 </Reveal>
 <Reveal delay={0.08}>
 <p className="max-w-2xl text-lg leading-8 text-[rgb(var(--surface-rgb)_/_0.74)]">
 La experiencia pública explica lo esencial antes de pedir datos:
 modalidad, privacidad, acceso con código y una ruta de
 acompañamiento profesional.
 </p>
 </Reveal>
 </div>

 <div className="mt-14 grid gap-4 lg:grid-cols-3">
 {trustItems.map((item, index) => {
 const Icon = item.icon;

 return (
 <Reveal key={item.title} delay={index * 0.06}>
 <article className="h-full rounded-[1.6rem] border-[var(--ln-paper)]/14 p-6 shadow-[0_34px_96px_-72px_rgb(var(--raspberry-rgb)_/_0.7)]">
 <span className="grid size-12 place-items-center rounded-full bg-[var(--ln-peach)] text-[var(--ln-night)]">
 <Icon className="size-5" strokeWidth={1.8} />
 </span>
 <h3 className="mt-8 text-2xl font-black">{item.title}</h3>
 <p className="mt-3 text-sm font-bold leading-6 text-[rgb(var(--surface-rgb)_/_0.68)]">
 {item.copy}
 </p>
 </article>
 </Reveal>
 );
 })}
 </div>

 <div className="mt-14 grid gap-4 lg:grid-cols-3">
 {faqs.map((item, index) => (
 <Reveal key={item.question} delay={index * 0.055}>
 <article className="h-full rounded-[1.4rem] border-[var(--ln-paper)]/14 p-5">
 <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--ln-peach)]">
 FAQ
 </p>
 <h3 className="mt-4 text-lg font-black leading-7">
 {item.question}
 </h3>
 <p className="mt-3 text-sm font-bold leading-6 text-[rgb(var(--surface-rgb)_/_0.68)]">
 {item.answer}
 </p>
 </article>
 </Reveal>
 ))}
 </div>
 </div>
 </section>
 );
}

function ClosingCta() {
 const reduceMotion = useReducedMotion();
 const startCards = [
 ["llegá con", "preguntas sueltas"],
 ["traé", "síntomas, metas o cansancio"],
 ["salí con", "una ruta clara"],
 ];
 const notes = [
 "Sin juicio",
 "Sin listas imposibles",
 "Con prioridades reales",
 ];

 return (
 <section className="relative overflow-hidden bg-[var(--ln-paper)] px-5 py-20 text-[var(--ln-night)] sm:px-8 sm:py-28 lg:px-10">
 <div className="hidden" />
 <motion.div
 aria-hidden="true"
 animate={reduceMotion ? undefined : { x: ["0%", "-7%", "0%"] }}
 transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
 className="pointer-events-none absolute left-[-12%] top-20 hidden w-[124%] -rotate-3 border-y border-[var(--ln-night)]/8 bg-[var(--ln-paper)] py-4 text-[0.72rem] font-black uppercase tracking-[0.36em] text-[var(--ln-muted)]/60 lg:block"
 >
 <span className="mx-8">empezar sin tener todo claro</span>
 <span className="mx-8">escucha profesional</span>
 <span className="mx-8">primer paso amable</span>
 <span className="mx-8">ruta personalizada</span>
 </motion.div>
 <div className="relative mx-auto max-w-7xl">
 <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(28rem,0.72fr)] lg:items-center">
 <Reveal>
 <div className="relative overflow-hidden rounded-[2.4rem] border-[var(--ln-night)]/10 bg-[var(--ln-paper)] p-5 shadow-[0_44px_130px_-86px_rgb(var(--raspberry-rgb)_/_0.28)] sm:rounded-[3rem] sm:p-7">
 <div className="relative min-h-[34rem] overflow-hidden rounded-[1.9rem] border-[var(--ln-night)]/8 bg-[var(--ln-cream)] p-6 sm:min-h-[39rem] sm:p-8 lg:p-10">
 <div className="hidden" />
 <motion.p
 aria-hidden="true"
 animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
 transition={{
 duration: 10,
 repeat: Infinity,
 ease: "easeInOut",
 }}
 style={displayFontStyle}
 className="pointer-events-none absolute -right-5 bottom-4 text-[9rem] leading-none tracking-[-0.06em] text-[var(--ln-night)]/[0.055] sm:text-[14rem]"
 >
 hola
 </motion.p>

 <div className="relative">
 <SectionEyebrow>Primer paso</SectionEyebrow>
 <h2
 style={displayFontStyle}
 className="mt-7 max-w-[11.5ch] text-balance text-[clamp(3rem,13vw,9.4rem)] leading-[0.82] tracking-[-0.038em] text-[var(--ln-night)] sm:max-w-[10.5ch]"
 >
 La primera conversación no tiene que llegar perfecta.
 </h2>
 </div>

 <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
 {startCards.map(([kicker, value], index) => (
 <motion.div
 key={value}
 initial={reduceMotion ? false : { opacity: 0, y: 18 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-80px" }}
 transition={{
 duration: 0.58,
 delay: reduceMotion ? 0 : index * 0.08,
 ease: motionEase,
 }}
 whileHover={reduceMotion ? undefined : { y: -5 }}
 className="rounded-[1.25rem] border-[var(--ln-night)]/8 bg-[var(--ln-paper)] p-4 shadow-[0_20px_62px_-48px_rgb(var(--raspberry-rgb)_/_0.2)]"
 >
 <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--ln-cacao)]/74">
 {kicker}
 </p>
 <p className="mt-3 text-sm font-black leading-5 text-[var(--ln-night)]">
 {value}
 </p>
 </motion.div>
 ))}
 </div>

 <div className="relative mt-10 max-w-2xl">
 <p className="text-lg leading-8 text-[var(--ln-muted)]">
 Llegá con dudas, síntomas, una meta todavía borrosa o
 cansancio acumulado. La conversación existe para ordenar,
 priorizar y acompañarte sin juicio desde tu vida real.
 </p>
 <div className="mt-7 flex flex-col gap-3 sm:flex-row">
 <PremiumLink variant="ink">Agendar consulta</PremiumLink>
 <PremiumLink variant="secondary">
 <MessageCircle className="size-4" />
 Escribir por WhatsApp
 </PremiumLink>
 </div>
 </div>
 </div>
 </div>
 </Reveal>

 <Reveal delay={0.12}>
 <div className="relative min-h-[36rem] lg:min-h-[43rem]">
 <motion.div
 animate={
 reduceMotion
 ? undefined
 : { y: [0, -14, 0], rotate: [-1.5, 0.5, -1.5] }
 }
 transition={{
 duration: 9,
 repeat: Infinity,
 ease: "easeInOut",
 }}
 className="absolute left-0 top-8 w-[82%] rounded-[2.2rem] border-[var(--ln-night)]/10 bg-[var(--ln-mint)] p-6 shadow-[0_34px_96px_-68px_rgb(var(--raspberry-rgb)_/_0.24)] sm:p-7"
 >
 <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ln-forest)]">
 mesa de inicio
 </p>
 <div className="mt-8 grid gap-4">
 {[
 ["escucha", "qué está pasando y qué querés cuidar"],
 ["criterio", "qué conviene priorizar esta semana"],
 ["ruta", "cómo empezar sin abrumarte"],
 ].map(([title, copy]) => (
 <div
 key={title}
 className="rounded-[1.35rem] border-[var(--ln-night)]/8 bg-[var(--ln-paper)] p-4"
 >
 <p className="text-sm font-black uppercase tracking-[0.14em] text-[var(--ln-cacao)]">
 {title}
 </p>
 <p className="mt-2 text-sm font-bold leading-6 text-[var(--ln-muted)]">
 {copy}
 </p>
 </div>
 ))}
 </div>
 </motion.div>

 <motion.div
 initial={reduceMotion ? false : { opacity: 0, x: 26, y: 18 }}
 whileInView={{ opacity: 1, x: 0, y: 0 }}
 viewport={{ once: true, margin: "-90px" }}
 transition={{ duration: 0.72, ease: motionEase }}
 className="absolute right-0 top-0 w-[58%] rounded-[1.8rem] border-[var(--ln-night)]/10 bg-[var(--ln-rose)] p-5 shadow-[0_28px_76px_-58px_rgb(var(--raspberry-rgb)_/_0.22)]"
 >
 <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[var(--ln-cacao)]">
 mensaje
 </p>
 <p className="mt-4 text-sm font-black leading-6 text-[var(--ln-night)]">
 “No sé por dónde empezar, pero quiero sentirme mejor.”
 </p>
 </motion.div>

 <motion.div
 initial={reduceMotion ? false : { opacity: 0, x: -26, y: 18 }}
 whileInView={{ opacity: 1, x: 0, y: 0 }}
 viewport={{ once: true, margin: "-90px" }}
 transition={{
 duration: 0.72,
 delay: reduceMotion ? 0 : 0.12,
 ease: motionEase,
 }}
 className="absolute bottom-24 left-5 w-[58%] rounded-[1.8rem] border-[var(--ln-night)]/10 bg-[var(--ln-sand)] p-5 shadow-[0_28px_76px_-58px_rgb(var(--raspberry-rgb)_/_0.2)]"
 >
 <p className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-[var(--ln-cacao)]">
 respuesta
 </p>
 <p className="mt-4 text-sm font-black leading-6 text-[var(--ln-night)]">
 Perfecto. Empezamos escuchando y hacemos visible lo
 importante.
 </p>
 </motion.div>

 <motion.div
 animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
 transition={{
 duration: 8,
 repeat: Infinity,
 ease: "easeInOut",
 }}
 className="absolute bottom-0 right-3 w-[72%] rounded-[2rem] border-[rgb(var(--surface-rgb)_/_0.7)] bg-[var(--ln-night)] p-6 text-[var(--ln-paper)] shadow-[0_34px_90px_-58px_rgb(var(--raspberry-rgb)_/_0.42)]"
 >
 <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--ln-peach)]">
 confianza
 </p>
 <div className="mt-5 grid gap-3">
 {notes.map((note) => (
 <div
 key={note}
 className="flex items-center gap-3 rounded-full bg-[var(--ln-paper)] px-4 py-3 text-sm font-black text-[var(--ln-night)]"
 >
 <span className="size-2 rounded-full bg-[var(--ln-peach)]" />
 {note}
 </div>
 ))}
 </div>
 </motion.div>
 </div>
 </Reveal>
 </div>
 </div>
 </section>
 );
}

export default function Home() {
 return (
 <SmoothScroll>
 <div className="landing-public min-h-dvh max-w-[100vw] overflow-hidden bg-[var(--ln-cream)] text-[var(--ln-night)] [--ln-brass:var(--primary)] [--ln-cacao:var(--text-secondary)] [--ln-clay:var(--primary)] [--ln-clay-hover:var(--primary-hover)] [--ln-cream:var(--background)] [--ln-forest:var(--secondary)] [--ln-ink:var(--text-primary)] [--ln-mint:var(--secondary-soft)] [--ln-mist:var(--surface-elevated)] [--ln-muted:var(--muted-foreground)] [--ln-night:var(--foreground)] [--ln-olive:var(--secondary-hover)] [--ln-paper:var(--surface)] [--ln-peach:var(--primary-soft)] [--ln-rose:var(--primary-soft)] [--ln-sage:var(--surface-muted)] [--ln-sand:var(--secondary-soft)] [font-family:var(--font-landing-sans)] [&_:is(h1,h2,h3,h4,h5,h6)]:!text-inherit">
 <Navbar />
 <main id="main-content">
 <Hero />
 <ProcessSection />
 <ProfessionalChapter
 id="servicios"
 number="01"
 label="Nutrición funcional"
 name="Dra. Mariana Rodríguez Méndez"
 subtitle="Profesional en nutrición funcional e integrativa"
 description="Un enfoque personalizado basado en tu bioquímica, historia clínica y estilo de vida. Sin dietas de moda, con ciencia real, escucha y ajustes que respetan tu contexto."
 benefits={marianaBenefits}
 cta="Agendar con Mariana"
 accent="var(--primary-soft)"
 monogram="MR"
 />
 <ProfessionalChapter
 number="02"
 label="Entrenamiento personalizado"
 name="Camila Rodríguez Méndez"
 subtitle="Entrenadora"
 description="Rutinas diseñadas para tu cuerpo, tu ritmo y tus metas. Desde casa o en el gimnasio, con progresión clara, seguimiento real y motivación constante."
 benefits={camilaBenefits}
 cta="Agendar con Camila"
 accent="var(--secondary-soft)"
 monogram="CR"
 reverse
 />
 <WhySection />
 <TrustSection />
 <ClosingCta />
 </main>
 <Footer />
 </div>
 </SmoothScroll>
 );
}

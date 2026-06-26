"use client";

import {
  ArrowUpRight,
  Check,
  CircleDot,
  Clock3,
  HeartPulse,
  MessageCircle,
  MoveRight,
  ShieldCheck,
  Sparkles,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SmoothScroll } from "@/components/SmoothScroll";

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
      "bg-[var(--ln-peach)] !text-[var(--ln-night)] shadow-[0_24px_70px_-38px_rgb(75_53_53_/_0.24)]",
    secondary:
      "border border-[var(--ln-night)]/10 bg-[rgb(255_255_255_/_0.62)] !text-[var(--ln-night)] shadow-[0_18px_54px_-42px_rgb(75_53_53_/_0.18)] backdrop-blur-xl",
    ghost:
      "border border-[var(--ln-night)]/10 bg-[rgb(255_255_255_/_0.42)] !text-[var(--ln-night)] shadow-[0_18px_54px_-46px_rgb(75_53_53_/_0.16)] backdrop-blur-xl",
    ink: "bg-[var(--ln-night)] !text-[var(--ln-paper)] shadow-[0_24px_70px_-42px_rgb(75_53_53_/_0.42)]",
  };
  const classes = `${base} ${variants[variant]} ${className}`;
  const content = (
    <>
      <span className="absolute inset-0 translate-y-full rounded-full bg-[rgb(255_255_255_/_0.22)] transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-y-0" />
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
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.18em] backdrop-blur-xl",
        light
          ? "border border-white/[0.8] bg-[rgb(255_255_255_/_0.48)] text-[var(--ln-forest)] shadow-[0_16px_40px_-34px_rgb(75_53_53_/_0.2)]"
          : "border border-[var(--ln-night)]/10 bg-[var(--ln-paper)]/[0.74] text-[var(--ln-forest)]",
      ].join(" ")}
    >
      <span className="size-1.5 rounded-full bg-[var(--ln-peach)]" />
      {children}
    </span>
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
  const plantY = useTransform(progress, [0, 1], [34, -78]);
  const plantX = useTransform(progress, [0, 1], [34, -36]);
  const plantRotate = useTransform(progress, [0, 1], [2.4, -1.8]);
  const haloY = useTransform(progress, [0, 1], [12, -34]);
  const shadowScale = useTransform(progress, [0, 1], [1, 0.78]);

  return (
    <div
      ref={ref}
      className="pointer-events-none relative mx-auto min-h-[26rem] w-full max-w-[36rem] overflow-visible sm:min-h-[35rem] lg:min-h-[46rem]"
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
        className="absolute -right-14 bottom-12 top-4 w-[88%] rounded-[999px] bg-[radial-gradient(circle_at_56%_34%,rgb(255_252_248_/_0.92),rgb(247_230_212_/_0.68)_46%,rgb(231_197_138_/_0.24)_72%,transparent_78%)] blur-[1px] sm:-right-20 sm:bottom-16 lg:-right-28"
      />
      <motion.div
        style={reduceMotion ? undefined : { scale: shadowScale }}
        className="absolute bottom-10 right-0 h-20 w-[58%] rounded-full bg-[radial-gradient(ellipse,rgb(75_53_53_/_0.18),transparent_68%)] blur-xl"
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
        className="pointer-events-auto absolute -right-28 top-4 w-[34rem] max-w-none cursor-pointer will-change-transform sm:-right-36 sm:top-0 sm:w-[44rem] lg:-right-44 lg:-top-6 lg:w-[53rem]"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -8, 0], rotate: [0, 0.7, -0.45, 0] }
          }
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/images/landing/hero-plant-vine.png"
            alt="Planta verde sin maceta entrando desde el lado derecho"
            width={1024}
            height={1536}
            priority
            sizes="(min-width: 1024px) 48vw, 110vw"
            className="h-auto w-full select-none drop-shadow-[0_38px_64px_rgb(75_53_53_/_0.18)]"
          />
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-[-6rem] bottom-0 z-10 h-28 overflow-hidden sm:bottom-4 sm:h-36 lg:bottom-10">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: "-20vw", rotate: 0 }}
          animate={
            reduceMotion
              ? { opacity: 0.44, x: "68vw", rotate: 0 }
              : {
                  opacity: [0, 0.72, 0.72, 0],
                  x: ["-24vw", "18vw", "72vw", "112vw"],
                  rotate: [0, 160, 520, 880],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 14,
                  repeat: Infinity,
                  repeatDelay: 3.2,
                  ease: "linear",
                  times: [0, 0.28, 0.72, 1],
                }
          }
          className="absolute bottom-3 left-0 w-32 will-change-transform sm:bottom-4 sm:w-44 lg:w-52"
          aria-hidden="true"
        >
          <Image
            src="/images/landing/hero-dumbbell.png"
            alt=""
            width={1600}
            height={900}
            sizes="(min-width: 1024px) 13vw, 30vw"
            className="h-auto w-full select-none drop-shadow-[0_18px_28px_rgb(75_53_53_/_0.18)]"
          />
        </motion.div>
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgb(231_197_138_/_0.34),transparent_28rem),radial-gradient(circle_at_88%_20%,rgb(247_230_212_/_0.88),transparent_34rem),linear-gradient(135deg,var(--ln-cream)_0%,var(--ln-paper)_46%,var(--ln-sage)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgb(75_53_53_/_0.08)_1px,transparent_1px),linear-gradient(90deg,rgb(75_53_53_/_0.07)_1px,transparent_1px)] [background-size:78px_78px]" />

      <div className="relative mx-auto grid min-h-[calc(100dvh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(26rem,0.82fr)]">
        <motion.div
          style={reduceMotion ? undefined : { y: headlineY }}
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: motionEase }}
          className="min-w-0"
        >
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
              <PremiumLink href="#servicios" variant="ghost">
                Ver método
              </PremiumLink>
            </div>
          </div>
        </motion.div>

        <HeroProductVisual />
      </div>
    </section>
  );
}

function BenefitChips({ benefits }: { benefits: string[] }) {
  return (
    <ul className="mt-8 flex flex-wrap gap-2.5">
      {benefits.map((benefit, index) => (
        <Reveal key={benefit} delay={index * 0.035}>
          <li className="inline-flex items-center gap-2 rounded-full border border-[var(--ln-night)]/10 bg-[var(--ln-paper)]/[0.72] px-3.5 py-2 text-sm font-extrabold text-[var(--ln-night)] shadow-[0_16px_42px_-34px_rgb(75_53_53_/_0.28)] backdrop-blur-xl">
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
        "relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-[var(--ln-night)]/10 bg-[var(--ln-paper)]/[0.78] p-4 shadow-[0_42px_110px_-76px_rgb(75_53_53_/_0.34)] backdrop-blur-2xl sm:rounded-[2.5rem]",
        reverse ? "lg:col-start-2" : "",
      ].join(" ")}
    >
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background:
            "radial-gradient(circle at 20% 18%, rgb(247 230 212 / 0.86), transparent 18rem), linear-gradient(145deg, rgb(255 252 248 / 0.94), rgb(231 197 138 / 0.38))",
        }}
      />
      <div className="relative flex min-h-[25rem] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-[var(--ln-night)]/10 bg-[var(--ln-cream)] p-6 sm:rounded-[2rem] sm:p-7 lg:min-h-[32rem]">
        <div
          className="absolute -right-24 -top-24 size-64 rounded-full opacity-70 blur-2xl"
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

        <div className="relative mx-auto grid size-48 place-items-center rounded-full border border-[var(--ln-night)]/10 bg-[var(--ln-paper)]/[0.82] shadow-[0_28px_72px_-50px_rgb(75_53_53_/_0.34)] sm:size-56">
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
              className="rounded-full border border-[var(--ln-night)]/10 bg-[var(--ln-paper)]/[0.78] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[var(--ln-forest)]"
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgb(134_176_93_/_0.16),transparent_26rem)]" />
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_18%,rgb(231_197_138_/_0.22),transparent_30rem),radial-gradient(circle_at_92%_12%,rgb(247_230_212_/_0.86),transparent_34rem),linear-gradient(180deg,var(--ln-sage)_0%,var(--ln-paper)_100%)]" />
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
                  className="group flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-[1.4rem] border border-[var(--ln-night)]/8 bg-[rgb(255_252_248_/_0.62)] p-5 shadow-[0_34px_90px_-66px_rgb(75_53_53_/_0.22)] backdrop-blur-xl sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid size-11 place-items-center rounded-full ${benefit.accent} shadow-[0_18px_50px_-34px_rgb(0_0_0_/_0.74)]`}
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgb(199_121_116_/_0.18),transparent_30rem),radial-gradient(circle_at_86%_22%,rgb(247_230_212_/_0.86),transparent_34rem),linear-gradient(180deg,var(--ln-paper)_0%,var(--ln-cream)_100%)]" />
      <motion.div
        aria-hidden="true"
        animate={reduceMotion ? undefined : { x: ["0%", "-7%", "0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[-12%] top-20 hidden w-[124%] -rotate-3 border-y border-[var(--ln-night)]/8 bg-[rgb(255_255_255_/_0.24)] py-4 text-[0.72rem] font-black uppercase tracking-[0.36em] text-[var(--ln-muted)]/60 backdrop-blur-sm lg:block"
      >
        <span className="mx-8">empezar sin tener todo claro</span>
        <span className="mx-8">escucha profesional</span>
        <span className="mx-8">primer paso amable</span>
        <span className="mx-8">ruta personalizada</span>
      </motion.div>
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(28rem,0.72fr)] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.4rem] border border-[var(--ln-night)]/10 bg-[rgb(255_252_248_/_0.48)] p-5 shadow-[0_44px_130px_-86px_rgb(75_53_53_/_0.28)] backdrop-blur-2xl sm:rounded-[3rem] sm:p-7">
              <div className="relative min-h-[34rem] overflow-hidden rounded-[1.9rem] border border-[var(--ln-night)]/8 bg-[var(--ln-cream)] p-6 sm:min-h-[39rem] sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgb(231_197_138_/_0.22),transparent_20rem),radial-gradient(circle_at_88%_10%,rgb(247_230_212_/_0.86),transparent_24rem)]" />
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
                      className="rounded-[1.25rem] border border-[var(--ln-night)]/8 bg-[rgb(255_252_248_/_0.62)] p-4 shadow-[0_20px_62px_-48px_rgb(75_53_53_/_0.2)] backdrop-blur-xl"
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
                className="absolute left-0 top-8 w-[82%] rounded-[2.2rem] border border-[var(--ln-night)]/10 bg-[var(--ln-mint)] p-6 shadow-[0_34px_96px_-68px_rgb(75_53_53_/_0.24)] sm:p-7"
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
                      className="rounded-[1.35rem] border border-[var(--ln-night)]/8 bg-[rgb(255_255_255_/_0.56)] p-4 backdrop-blur-xl"
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
                className="absolute right-0 top-0 w-[58%] rounded-[1.8rem] border border-[var(--ln-night)]/10 bg-[var(--ln-rose)] p-5 shadow-[0_28px_76px_-58px_rgb(75_53_53_/_0.22)]"
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
                className="absolute bottom-24 left-5 w-[58%] rounded-[1.8rem] border border-[var(--ln-night)]/10 bg-[var(--ln-sand)] p-5 shadow-[0_28px_76px_-58px_rgb(75_53_53_/_0.2)]"
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
                className="absolute bottom-0 right-3 w-[72%] rounded-[2rem] border border-[rgb(255_252_248_/_0.7)] bg-[var(--ln-night)] p-6 text-[var(--ln-paper)] shadow-[0_34px_90px_-58px_rgb(75_53_53_/_0.42)]"
              >
                <p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--ln-peach)]">
                  confianza
                </p>
                <div className="mt-5 grid gap-3">
                  {notes.map((note) => (
                    <div
                      key={note}
                      className="flex items-center gap-3 rounded-full bg-[rgb(255_255_255_/_0.1)] px-4 py-3 text-sm font-black"
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
      <div className="landing-public min-h-dvh max-w-[100vw] overflow-hidden bg-[var(--ln-cream)] text-[var(--ln-night)] [--ln-brass:#E7C58A] [--ln-cacao:#604846] [--ln-clay:#9F5F5B] [--ln-cream:#F7E6D4] [--ln-forest:#4F7836] [--ln-ink:#604846] [--ln-mint:#86B05D] [--ln-mist:#FCF1E7] [--ln-muted:#7A6660] [--ln-night:#4B3535] [--ln-olive:#86B05D] [--ln-paper:#FFFCF8] [--ln-peach:#E7C58A] [--ln-rose:#F1D6D0] [--ln-sage:#FFF4EA] [--ln-sand:#E7C58A] [font-family:var(--font-landing-sans)] [&_:is(h1,h2,h3,h4,h5,h6)]:!text-inherit">
        <Navbar />
        <main>
          <Hero />
          <ProfessionalChapter
            id="servicios"
            number="01"
            label="Nutrición funcional"
            name="Dra. Mariana Rodríguez Méndez"
            subtitle="Profesional en nutrición funcional e integrativa"
            description="Un enfoque personalizado basado en tu bioquímica, historia clínica y estilo de vida. Sin dietas de moda, con ciencia real, escucha y ajustes que respetan tu contexto."
            benefits={marianaBenefits}
            cta="Agendar con Mariana"
            accent="#E7C58A"
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
            accent="#86B05D"
            monogram="CR"
            reverse
          />
          <WhySection />
          <ClosingCta />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}

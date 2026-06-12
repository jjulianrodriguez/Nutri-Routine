"use client";

import {
  ArrowRight,
  Check,
  Dumbbell,
  Leaf,
  MessageCircle,
  MoveRight,
  Sparkles,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SmoothScroll } from "@/components/SmoothScroll";

const marianaBenefits = [
  "salud hormonal",
  "salud digestiva",
  "más energía",
  "prevenir enfermedades",
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

const benefitPills = [
  "Disfrutar tus alimentos sin culpa",
  "Más energía y vitalidad",
  "Salud hormonal equilibrada",
  "Rendimiento deportivo mejorado",
  "Fuerza y movilidad funcional",
  "Sin restricciones extremas",
  "Salud digestiva",
  "Seguimiento real y humano",
];

function BotanicalGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 620"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M310 22C426 76 488 176 462 290C435 409 329 528 187 566C106 587 38 552 26 488C8 390 142 342 121 225C103 122 192-19 310 22Z"
        fill="var(--terracotta-soft)"
        opacity="0.65"
      />
      <path
        d="M318 120C230 198 172 310 157 471"
        stroke="var(--terracotta)"
        strokeLinecap="round"
        strokeWidth="4"
        opacity="0.42"
      />
      <path
        d="M210 268C263 260 314 220 348 165C288 154 230 176 210 268Z"
        fill="var(--sand)"
        opacity="0.85"
      />
      <path
        d="M176 378C238 376 302 328 337 256C260 249 193 281 176 378Z"
        fill="var(--sage-green)"
        opacity="0.58"
      />
    </svg>
  );
}

function CurlyArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 106 68"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 49C30 16 59 11 77 30C87 40 80 54 64 49C48 44 58 21 91 18"
        stroke="var(--warm-brown)"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M82 8L94 18L82 30"
        stroke="var(--warm-brown)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
    </svg>
  );
}

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
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        delay: reduceMotion ? 0 : delay,
        duration: 0.82,
        ease: [0.22, 0.72, 0.18, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PrimaryLink({
  children,
  href = "https://wa.me/50688332426",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.99 }}
      className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-center text-sm font-extrabold text-cream shadow-soft"
    >
      {children}
    </motion.a>
  );
}

function BenefitChips({ benefits }: { benefits: string[] }) {
  return (
    <ul className="mt-8 flex flex-wrap gap-2">
      {benefits.map((benefit, index) => (
        <Reveal key={benefit} delay={index * 0.035}>
          <li className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-white/82 px-3.5 py-2 text-sm font-bold text-charcoal shadow-soft backdrop-blur-sm">
            <Check className="size-4 text-warm-brown" />
            {benefit}
          </li>
        </Reveal>
      ))}
    </ul>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 38,
    stiffness: 110,
    mass: 0.55,
  });
  const heroY = useTransform(smoothProgress, [0, 1], [0, 90]);
  const visualY = useTransform(smoothProgress, [0, 1], [0, -80]);
  const visualRotate = useTransform(smoothProgress, [0, 1], [0, -5]);

  return (
    <section
      ref={ref}
      className="nce-grain relative min-h-[100svh] overflow-hidden border-b border-charcoal/10 px-5 pb-16 pt-32 sm:px-8 lg:px-10"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: visualY, rotate: visualRotate }}
        className="pointer-events-none absolute -right-40 top-24 w-[34rem] sm:-right-16 lg:right-8 lg:w-[43rem]"
      >
        <BotanicalGlyph className="w-full" />
      </motion.div>

      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.7fr)] lg:items-end">
        <motion.div
          style={reduceMotion ? undefined : { y: heroY }}
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.92, ease: [0.22, 0.72, 0.18, 1] }}
          className="max-w-5xl"
        >
          <div className="inline-flex flex-col gap-1 rounded-[28px] border border-charcoal/10 bg-white/66 px-4 py-3 text-xs font-bold text-warm-brown shadow-soft backdrop-blur-xl sm:text-sm">
            <span>Dra. Mariana Rodríguez Méndez</span>
            <span>Camila Rodríguez Méndez</span>
          </div>

          <h1 className="mt-9 max-w-6xl font-serif text-[clamp(4.6rem,16vw,12rem)] font-semibold leading-[0.76] text-charcoal">
            Tu cuerpo merece
            <br />
            atención con{" "}
            <em className="font-serif italic text-warm-brown">enfoque</em>
          </h1>

          <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,30rem)_auto] md:items-end">
            <p className="max-w-xl text-lg leading-8 text-stone sm:text-xl">
              Nutrición funcional + entrenamiento personalizado por dos hermanas
              para que te sintás bien de adentro hacia afuera.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryLink>
                <span className="text-cream">Agendar consulta</span>
                <ArrowRight className="size-4 text-cream" />
              </PrimaryLink>
              <motion.a
                href="#servicios"
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.99 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-sand-hover bg-sand-soft px-6 py-3.5 text-sm font-extrabold text-espresso shadow-soft backdrop-blur-xl"
              >
                Conocer más
              </motion.a>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-charcoal/10 bg-white/70 px-6 py-3.5 text-sm font-extrabold text-charcoal shadow-soft backdrop-blur-xl"
              >
                Leer blog
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 42 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 0.72, 0.18, 1] }}
          className="relative rounded-[2rem] border border-charcoal/10 bg-white/74 p-4 shadow-card backdrop-blur-xl"
        >
          <div className="grid gap-3">
            {[
              { name: "Dra. Mariana Rodríguez Méndez", role: "Profesional en nutrición funcional", color: "bg-terracotta text-white" },
              { name: "Camila Rodríguez Méndez", role: "Profesional en entrenamiento", color: "bg-sage text-espresso" },
            ].map((item, index) => (
              <div
                key={item.name}
                className="grid grid-cols-[3.5rem_1fr] overflow-hidden rounded-[1.35rem] border border-charcoal/10 bg-cream"
              >
                <div className={`flex items-center justify-center text-sm font-black ${item.color}`}>
                  0{index + 1}
                </div>
                <div className="px-5 py-5">
                  <p className="text-base font-black leading-5 text-charcoal">{item.name}</p>
                  <p className="text-xs font-medium text-warm-brown/70">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-bold text-warm-brown">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
              <Sparkles className="size-4 text-charcoal" />
              Ciencia sin rigidez
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-soft">
              <MoveRight className="size-4 text-charcoal" />
              Nutrición + movimiento en equipo
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProfessionalChapter({
  id,
  tone,
  number,
  label,
  name,
  subtitle,
  description,
  benefits,
  cta,
  icon,
  reverse = false,
}: {
  id?: string;
  tone: "blush" | "sage" | "terracotta" | "sand";
  number: string;
  label: string;
  name: string;
  subtitle: string;
  description: string;
  benefits: string[];
  cta: string;
  icon: "leaf" | "dumbbell";
  reverse?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 34,
    stiffness: 105,
    mass: 0.55,
  });
  const panelY = useTransform(smoothProgress, [0, 1], [70, -70]);
  const panelScale = useTransform(smoothProgress, [0, 0.5, 1], [0.96, 1, 0.98]);
  const Icon = icon === "leaf" ? Leaf : Dumbbell;

  return (
    <section
      ref={ref}
      id={id}
      className={[
        "relative overflow-hidden border-b border-charcoal/10 px-5 py-20 sm:px-8 sm:py-28 lg:px-10",
        tone === "blush" ? "bg-blush/20" : tone === "sage" ? "bg-sage/10" : tone === "terracotta" ? "bg-terracotta-soft/60" : "bg-sand-soft/80",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/60" />
      <div
        className={[
          "mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.86fr_1.14fr]",
          reverse ? "lg:grid-flow-col-dense" : "",
        ].join(" ")}
      >
        <motion.div
          style={reduceMotion ? undefined : { y: panelY, scale: panelScale }}
          className={[
            "relative min-h-[24rem] overflow-hidden rounded-[2rem] border border-charcoal/10 bg-white p-5 shadow-card lg:min-h-[35rem]",
            reverse ? "lg:col-start-2" : "",
          ].join(" ")}
        >
          <BotanicalGlyph className="absolute -right-32 -top-28 w-[28rem] opacity-70" />
          <div className="relative flex h-full min-h-[21rem] flex-col justify-between rounded-[1.5rem] bg-cream p-6 lg:min-h-[31rem]">
            <div className="flex items-start justify-between">
              <span className="font-serif text-7xl font-semibold leading-none text-charcoal">
                {number}
              </span>
              <span className="nce-vertical text-xs font-black uppercase text-warm-brown">
                {label}
              </span>
            </div>
            <Icon
              className="mx-auto size-32 text-warm-brown/48"
              strokeWidth={1.1}
            />
            <p className="max-w-[14rem] text-sm font-bold leading-6 text-warm-brown">
              {subtitle}
            </p>
          </div>
        </motion.div>

        <div className={reverse ? "lg:col-start-1" : ""}>
          <Reveal>
            <span className="inline-flex rounded-full border border-charcoal/10 bg-white/72 px-4 py-2 text-xs font-black uppercase text-warm-brown shadow-soft backdrop-blur-xl">
              {label}
            </span>
            <h2 className="mt-7 max-w-4xl font-serif text-[clamp(3.25rem,8vw,8rem)] font-semibold leading-[0.86] text-charcoal">
              {name}
            </h2>
            <p className="mt-4 text-xl font-bold text-warm-brown">
              {subtitle}
            </p>
            <p className="mt-7 max-w-2xl text-base leading-8 text-warm-brown sm:text-lg">
              {description}
            </p>
          </Reveal>

          <BenefitChips benefits={benefits} />

          <Reveal delay={0.18} className="mt-10">
            <PrimaryLink>
              <span className="text-cream">{cta}</span>
              <ArrowRight className="size-4 text-cream" />
            </PrimaryLink>
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
      className="relative overflow-hidden border-b border-charcoal/10 bg-white/44 px-5 py-20 sm:px-8 sm:py-28 lg:px-10"
    >
      <CurlyArrow className="pointer-events-none absolute left-[8%] top-14 hidden w-24 opacity-55 lg:block" />
      <div className="mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-[clamp(3.5rem,9vw,8.5rem)] font-semibold leading-[0.82] text-charcoal">
            ¿Por qué{" "}
            <em className="font-serif italic text-warm-brown">trabajar</em> con
            nosotras?
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {benefitPills.map((benefit, index) => {
            const colors = ["bg-terracotta text-white", "bg-sand text-espresso", "bg-sage text-espresso", "bg-blush text-espresso"];
            const colorClass = colors[index % colors.length];
            return (
              <Reveal key={benefit} delay={index * 0.035}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.015 }}
                  className="group min-h-36 rounded-[1.6rem] border border-charcoal/10 bg-cream p-5 shadow-soft"
                >
                  <span className={`mb-8 flex size-9 items-center justify-center rounded-full text-xs font-black ${colorClass}`}>
                    0{index + 1}
                  </span>
                  <p className="text-lg font-bold leading-6 text-espresso">
                    {benefit}
                  </p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-cream px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.2rem] border border-charcoal/10 bg-white p-8 shadow-card sm:p-12 lg:p-16">
            <div className="absolute inset-y-0 left-0 w-2 bg-terracotta" />
            <BotanicalGlyph className="pointer-events-none absolute -right-36 -top-40 w-[32rem] opacity-65" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-black text-terracotta">
                  Tu salud es lo primero
                </p>
                <h2 className="mt-4 max-w-4xl font-serif text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.84] text-espresso">
                  Trabajemos juntas en tu bienestar
                </h2>
                <p className="mt-6 max-w-xl text-lg leading-8 text-stone">
                  Nutrición + entrenamiento, un equipo pensado para vos
                </p>
              </div>

              <div className="flex flex-col items-start gap-5 lg:items-end">
                <PrimaryLink>
                  <MessageCircle className="size-5 text-cream" />
                  <span className="text-cream">WhatsApp</span>
                </PrimaryLink>
                <Link
                  href="/login"
                  className="text-sm font-bold text-stone underline decoration-sand decoration-2 underline-offset-4 hover:text-espresso"
                >
                  Acceso para pacientes
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <SmoothScroll>
      <div className="min-h-dvh bg-cream text-charcoal">
        <Navbar />
        <main>
          <Hero />
          <ProfessionalChapter
            id="servicios"
            tone="blush"
            number="01"
            label="Nutrición Funcional"
            name="Dra. Mariana Rodríguez Méndez"
            subtitle="Profesional en nutrición funcional e integrativa"
            description="Un enfoque personalizado basado en tu bioquímica, historia clínica y estilo de vida. Sin dietas de moda, con ciencia real y sin juicios."
            benefits={marianaBenefits}
            cta="Agendar consulta con Mariana"
            icon="leaf"
          />
          <ProfessionalChapter
            tone="sand"
            number="02"
            label="Entrenamiento Personalizado"
            name="Camila Rodríguez Méndez"
            subtitle="Profesional en entrenamiento"
            description="Rutinas diseñadas para tu cuerpo, tu ritmo y tus metas. Desde casa o en el gimnasio, con seguimiento real y motivación constante."
            benefits={camilaBenefits}
            cta="Agendar sesión con Camila"
            icon="dumbbell"
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

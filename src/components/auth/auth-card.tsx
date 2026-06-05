"use client";

import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { SmoothScroll } from "@/components/SmoothScroll";

type AuthCardProps = {
  children: ReactNode;
  headline: string;
  subtitle: string;
};

function AuthBotanical({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 620"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M326 28C438 89 484 204 446 322C408 440 293 545 172 560C78 572 24 516 42 434C64 329 163 299 135 194C108 93 211-34 326 28Z"
        fill="var(--cream)"
        opacity="0.38"
      />
      <path
        d="M315 123C234 197 183 304 166 466"
        stroke="var(--warm-brown)"
        strokeLinecap="round"
        strokeWidth="4"
        opacity="0.38"
      />
      <path
        d="M205 276C263 270 315 222 347 160C281 154 225 184 205 276Z"
        fill="var(--white)"
        opacity="0.64"
      />
      <path
        d="M178 382C241 377 302 329 336 257C260 251 194 285 178 382Z"
        fill="var(--blush)"
        opacity="0.42"
      />
    </svg>
  );
}

function AuthWordmark() {
  return (
    <Link
      href="/"
      aria-label="Nutrición Con Enfoque · Inicio"
      className="inline-grid grid-cols-[2.5rem_1fr] items-center gap-3"
    >
      <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-charcoal/12 bg-cream shadow-soft">
        <span className="absolute h-8 w-5 rotate-45 rounded-[100%_0_100%_0] bg-terracotta" />
        <span className="relative size-1.5 rounded-full bg-espresso" />
      </span>
      <span className="leading-none">
        <span className="block font-serif text-lg font-semibold text-espresso">
          Nutrición
        </span>
        <span className="block text-[0.68rem] font-bold uppercase text-stone">
          Con Enfoque
        </span>
      </span>
    </Link>
  );
}

export function AuthCard({ children, headline, subtitle }: AuthCardProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 34,
    stiffness: 115,
    mass: 0.45,
  });
  const artY = useTransform(smoothProgress, [0, 1], [0, -48]);
  const formY = useTransform(smoothProgress, [0, 1], [0, 32]);

  return (
    <SmoothScroll>
      <main
        ref={ref}
        className="nce-grain relative min-h-dvh overflow-hidden bg-cream text-charcoal"
      >
        <div className="relative z-10 mx-auto grid min-h-dvh max-w-7xl grid-rows-[auto_1fr] px-5 py-6 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:grid-rows-1 lg:px-10">
          <section className="relative flex items-center justify-between lg:hidden">
            <AuthWordmark />
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-white/72 px-4 py-2 text-sm font-extrabold text-stone shadow-soft backdrop-blur-xl"
            >
              <ArrowLeft className="size-4" />
              Inicio
            </Link>
          </section>

          <section className="relative hidden min-h-dvh flex-col justify-between overflow-hidden border-r border-charcoal/10 bg-sand px-10 py-10 lg:flex xl:px-14">
            <motion.div
              style={reduceMotion ? undefined : { y: artY }}
              className="pointer-events-none absolute -bottom-28 -right-40 w-[38rem]"
            >
              <AuthBotanical className="w-full" />
            </motion.div>

            <div className="relative z-10">
              <AuthWordmark />
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, ease: [0.22, 0.72, 0.18, 1] }}
              className="relative z-10 max-w-lg"
            >
              <p className="text-sm font-extrabold text-espresso/70">
                Nutrición Con Enfoque
              </p>
              <h1 className="mt-5 font-serif text-[clamp(4.5rem,8vw,7.2rem)] font-semibold leading-[0.8] text-espresso">
                Bienestar con
                <br />
                <em className="font-serif italic text-terracotta">criterio</em>
              </h1>
              <p className="mt-7 max-w-md text-base leading-7 text-espresso/80">
                Un espacio cálido para acompañar tu nutrición, tu entrenamiento
                y tus decisiones de salud con ciencia, calma y seguimiento real
                junto a Mariana y Camila.
              </p>
            </motion.div>

            <div className="relative z-10 grid gap-4 text-sm font-bold leading-6 text-espresso/70">
              <p>
                Dra. Mariana Rodríguez Méndez · Nutricionista funcional e
                integrativa
                <br />
                Camila Rodríguez Méndez · Entrenadora Personal
              </p>
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-espresso/10 bg-cream/55 px-4 py-2 text-espresso backdrop-blur-xl transition-colors hover:bg-cream"
              >
                Inicio
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>

          <section className="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center py-10 lg:min-h-dvh lg:pl-12">
            <motion.div
              style={reduceMotion ? undefined : { y: formY }}
              initial={reduceMotion ? false : { opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.88,
                delay: reduceMotion ? 0 : 0.08,
                ease: [0.22, 0.72, 0.18, 1],
              }}
              className="w-full max-w-[34rem]"
            >
              <div className="relative overflow-hidden rounded-[2.1rem] border border-charcoal/10 bg-white/78 p-5 shadow-premium backdrop-blur-2xl sm:p-7">
                <div className="absolute inset-x-0 top-0 h-2 bg-terracotta" />
                <div className="rounded-[1.6rem] bg-cream p-6 sm:p-8">
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <p className="text-sm font-extrabold text-stone">
                      Nutrición Con Enfoque
                    </p>
                    <span className="flex size-10 items-center justify-center rounded-full bg-sand text-espresso">
                      <Sparkles className="size-4" />
                    </span>
                  </div>
                  <h2 className="font-serif text-[clamp(3.25rem,11vw,5rem)] font-semibold leading-[0.86] text-espresso">
                    {headline}
                  </h2>
                  <p className="mt-4 font-serif text-2xl italic leading-7 text-terracotta">
                    {subtitle}
                  </p>

                  <div className="mt-9">{children}</div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </SmoothScroll>
  );
}

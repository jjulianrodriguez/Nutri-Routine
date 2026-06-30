"use client";

import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { type ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  headline: string;
  subtitle: string;
};

const motionEase = [0.18, 0.82, 0.22, 1] as const;

function AuthWordmark() {
  return (
    <Link
      href="/"
      aria-label="Nutrición Con Enfoque · Inicio"
      className="inline-flex items-center gap-3"
    >
      <span className="grid size-10 place-items-center rounded-full border border-border bg-surface text-xs font-extrabold text-espresso shadow-soft">
        NCE
      </span>
      <span className="leading-none">
        <span className="block text-base font-extrabold text-espresso">
          Nutrición Con Enfoque
        </span>
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-stone">
          bienestar privado
        </span>
      </span>
    </Link>
  );
}

export function AuthCard({ children, headline, subtitle }: AuthCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-5 py-6 text-charcoal sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(247_228_219_/_0.72),transparent_28rem),linear-gradient(180deg,rgb(255_250_246_/_0.72),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <AuthWordmark />
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-stone shadow-soft transition-colors hover:border-terracotta/30 hover:text-espresso"
          >
            <ArrowLeft className="size-4" />
            Inicio
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: motionEase }}
            className="w-full max-w-[31rem]"
          >
            <div className="rounded-[1.75rem] border border-border bg-surface/92 p-5 shadow-premium backdrop-blur-xl sm:p-7">
              <div className="rounded-[1.25rem] border border-border/80 bg-background/80 p-6 sm:p-8">
                <div className="mb-8">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-terracotta">
                    Acceso privado
                  </p>
                  <h1 className="mt-3 font-heading text-[clamp(2.7rem,8vw,4.25rem)] font-bold leading-[0.92] text-espresso">
                    {headline}
                  </h1>
                  <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-stone">
                    {subtitle}
                  </p>
                </div>

                {children}
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

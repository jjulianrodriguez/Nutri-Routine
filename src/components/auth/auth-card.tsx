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
      <span className="grid size-10 place-items-center rounded-full border border-border bg-surface text-foreground shadow-soft">
        <svg viewBox="0 0 40 40" className="size-8" fill="none" aria-hidden="true">
          <path
            d="M19.8 8.2C14.2 12.7 10.9 18.8 12.3 25.2C17.9 24.4 24.7 20.3 27.7 12.4C25.5 10 22.8 8.7 19.8 8.2Z"
            fill="var(--primary-soft)"
          />
          <path
            d="M13.7 27.8C17.1 21.6 21.8 16.8 27.6 12.4"
            stroke="var(--primary)"
            strokeLinecap="round"
            strokeWidth="1.35"
          />
          <path
            d="M25.6 25.7C22.7 28.7 18.4 30.1 13.1 29.2"
            stroke="var(--secondary)"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-base font-extrabold text-foreground">
          Nutrición Con Enfoque
        </span>
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          bienestar privado
        </span>
      </span>
    </Link>
  );
}

export function AuthCard({ children, headline, subtitle }: AuthCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main
      id="main-content"
      className="relative min-h-dvh overflow-hidden bg-background px-5 py-6 text-foreground sm:px-8"
    >
      <div className="hidden" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <AuthWordmark />
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-control border border-border bg-surface px-4 py-2 text-sm font-bold text-muted-foreground shadow-none transition-colors hover:border-primary/30 hover:text-foreground"
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
            <div className="rounded-card border border-border bg-surface p-6 shadow-premium sm:p-8">
              <div>
                <div className="mb-8">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
                    Acceso privado
                  </p>
                  <h1 className="mt-3 font-heading text-[clamp(2.4rem,8vw,3.8rem)] font-bold leading-[1.02] text-foreground">
                    {headline}
                  </h1>
                  <p className="mt-4 max-w-sm text-base font-semibold leading-7 text-muted">
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

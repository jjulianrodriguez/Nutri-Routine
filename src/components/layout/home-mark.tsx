import Link from "next/link";

import { cn } from "@/lib/utils";

type HomeMarkProps = {
  className?: string;
};

export function HomeMark({ className }: HomeMarkProps) {
  return (
    <Link
      href="/"
      aria-label="Nutrición Con Enfoque · Inicio"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className="relative flex size-10 items-center justify-center rounded-full border border-charcoal/10 bg-[var(--color-bone)] shadow-soft"
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" className="size-8" fill="none">
          <path
            d="M19.8 8.2C14.2 12.7 10.9 18.8 12.3 25.2C17.9 24.4 24.7 20.3 27.7 12.4C25.5 10 22.8 8.7 19.8 8.2Z"
            fill="var(--terracotta-soft)"
          />
          <path
            d="M13.7 27.8C17.1 21.6 21.8 16.8 27.6 12.4"
            stroke="var(--espresso)"
            strokeLinecap="round"
            strokeWidth="1.35"
          />
          <path
            d="M25.6 25.7C22.7 28.7 18.4 30.1 13.1 29.2"
            stroke="var(--sand)"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-bold text-espresso">
          Nutrición
        </span>
        <span className="mt-0.5 text-[0.7rem] font-semibold uppercase text-stone">
          Con Enfoque
        </span>
      </span>
    </Link>
  );
}

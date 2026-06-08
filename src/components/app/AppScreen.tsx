import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AppScreen({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        "bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_30rem)]",
      )}
    >
      <div className="mx-auto max-w-7xl space-y-6">{children}</div>
    </div>
  );
}

export function AppHeader({
  eyebrow,
  title,
  description,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-border bg-surface p-6 shadow-soft sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-charcoal sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-warm-brown">
        {description}
      </p>
    </section>
  );
}

export function AppPanel({
  children,
  description,
  title,
  tone = "surface",
}: {
  children?: ReactNode;
  description?: string;
  title: string;
  tone?: "surface" | "accent" | "primary";
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border p-5 shadow-soft sm:p-6",
        tone === "surface" && "border-border bg-surface",
        tone === "accent" && "border-charcoal/10 bg-accent-soft",
        tone === "primary" && "border-primary/30 bg-primary-soft",
      )}
    >
      <h2 className="text-2xl font-semibold leading-tight text-charcoal">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function StatTile({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-border bg-surface p-5 shadow-soft">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-3 font-serif text-4xl font-semibold leading-none text-charcoal">
        {value}
      </p>
      <p className="mt-4 text-sm font-bold text-warm-brown">{detail}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-border bg-background/70 p-5 text-sm font-semibold leading-6 text-muted">
      {children}
    </div>
  );
}

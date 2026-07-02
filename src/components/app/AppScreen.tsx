import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AppScreen({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "relative min-h-dvh overflow-x-clip px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        "bg-background",
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
    <section className="h-fit self-start overflow-hidden rounded-card border border-border-soft bg-surface p-6 shadow-card sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold leading-[1.04] text-charcoal sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
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
  tone?: "surface" | "accent" | "primary" | "warm";
}) {
  return (
    <section
      className={cn(
        "h-fit self-start rounded-card border p-5 shadow-soft sm:p-6",
        tone === "surface" && "bg-surface",
        tone === "accent" && "border-secondary/15 bg-accent-soft",
        tone === "primary" && "border-primary/15 bg-primary-soft",
        tone === "warm" && "border-border-soft bg-surface-muted",
      )}
    >
      <h2 className="text-2xl font-bold leading-tight text-charcoal">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-text-subtle">{description}</p>
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
    <div
      data-slot="stat-tile"
      className="h-fit self-start rounded-card border border-border-soft p-5 shadow-soft"
    >
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-3 font-heading text-4xl font-bold leading-none text-charcoal">
        {value}
      </p>
      <p className="mt-4 text-sm font-bold text-muted">{detail}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="h-fit self-start rounded-card border border-dashed border-border bg-surface p-5 text-sm font-semibold leading-6 text-muted shadow-soft">
      {children}
    </div>
  );
}

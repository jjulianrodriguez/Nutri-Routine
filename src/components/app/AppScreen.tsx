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
 <section className="h-fit self-start p-6 sm:p-8">
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
 {eyebrow}
 </p>
 <h1 className="mt-4 max-w-4xl font-heading text-4xl font-bold leading-[1.04] text-foreground sm:text-5xl">
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
 "h-fit self-start rounded-card p-5 sm:p-6",
 tone === "surface" && "bg-surface",
 tone === "accent" && "bg-secondary-soft",
 tone === "primary" && "bg-primary-soft",
 tone === "warm" && "bg-surface-muted",
 )}
 >
 <h2 className="text-2xl font-bold leading-tight text-foreground">
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
 className="h-fit self-start rounded-card bg-surface p-5"
 >
 <p className="text-sm font-bold text-muted">{label}</p>
 <p className="mt-3 font-heading text-4xl font-bold leading-none text-foreground">
 {value}
 </p>
 <p className="mt-4 text-sm font-bold text-muted">{detail}</p>
 </div>
 );
}

export function EmptyState({ children }: { children: ReactNode }) {
 return (
 <div className="h-fit self-start rounded-card bg-surface p-5 text-sm font-semibold leading-6 text-muted">
 {children}
 </div>
 );
}

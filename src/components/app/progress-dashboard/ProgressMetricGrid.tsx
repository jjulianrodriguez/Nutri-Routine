import type { ElementType } from "react";

export type ProgressMetricItem = {
 detail: string;
 icon: ElementType;
 label: string;
 value: string;
};

export function MetricCard({
 detail,
 icon: Icon,
 label,
 value,
}: ProgressMetricItem) {
 return (
 <article className="h-fit self-start rounded-[22px] bg-surface/85 p-4 ">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 {label}
 </p>
 <p className="mt-2 font-heading text-3xl font-bold leading-none text-foreground">
 {value}
 </p>
 </div>
 <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-secondary">
 <Icon className="size-5" aria-hidden="true" />
 </div>
 </div>
 <p className="mt-3 text-sm font-semibold leading-5 text-muted-foreground">
 {detail}
 </p>
 </article>
 );
}

export function ProgressMetricGrid({ items }: { items: ProgressMetricItem[] }) {
 return (
 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {items.map((item) => (
 <MetricCard
 key={item.label}
 detail={item.detail}
 icon={item.icon}
 label={item.label}
 value={item.value}
 />
 ))}
 </section>
 );
}

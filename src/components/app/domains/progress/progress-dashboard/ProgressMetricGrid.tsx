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
 <article className="h-fit self-start rounded-[22px] bg-surface/85 p-3 sm:p-4 ">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 {label}
 </p>
 <p className="mt-2 font-heading text-2xl font-bold leading-none text-foreground sm:text-3xl">
 {value}
 </p>
 </div>
 <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-secondary sm:size-10">
 <Icon className="size-4 sm:size-5" aria-hidden="true" />
 </div>
 </div>
 <p className="mt-3 text-xs font-semibold leading-5 text-muted-foreground sm:text-sm">
 {detail}
 </p>
 </article>
 );
}

export function ProgressMetricGrid({ items }: { items: ProgressMetricItem[] }) {
 return (
 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-4">
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

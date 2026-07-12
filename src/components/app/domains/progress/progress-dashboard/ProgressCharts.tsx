import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/ui/feedback/state-block";
import { cn } from "@/lib/utils";

import { ProgressStatusPill } from "./ProgressShared";
import { formatShortDate, formatValue } from "./utils";

export function ProgressCharts({ children }: { children: ReactNode }) {
 return (
 <section className="grid items-start gap-5 lg:grid-cols-2">
 {children}
 </section>
 );
}

export function LineTrendChart({
 emptyLabel,
 label,
 points,
 unit,
}: {
 emptyLabel: string;
 label: string;
 points: Array<{ date: string; label: string; value: number }>;
 unit: string;
}) {
 if (points.length === 0) {
 return <EmptyState>{emptyLabel}</EmptyState>;
 }

 if (points.length === 1) {
 return (
 <div className="h-fit self-start rounded-[20px] bg-background p-4">
 <p className="text-sm font-extrabold text-foreground">{label}</p>
 <p className="mt-4 font-heading text-3xl font-bold text-foreground">
 {formatValue(points[0].value, unit)}
 </p>
 <p className="mt-2 text-sm font-semibold text-muted">
 Hace falta otro registro para ver tendencia.
 </p>
 </div>
 );
 }

 const min = Math.min(...points.map((point) => point.value));
 const max = Math.max(...points.map((point) => point.value));
 const range = max - min || 1;
 const coordinates = points.map((point, index) => {
 const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
 const y = 80 - ((point.value - min) / range) * 64;

 return `${x},${y}`;
 });

 return (
 <div className="h-fit self-start rounded-[20px] bg-background p-4">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-sm font-extrabold text-foreground">{label}</p>
 <p className="text-xs font-semibold text-muted">
 {formatShortDate(points[0].date)} - {formatShortDate(points[points.length - 1].date)}
 </p>
 </div>
 <ProgressStatusPill>
 {formatValue(points[points.length - 1].value, unit)}
 </ProgressStatusPill>
 </div>
 <svg className="mt-4 h-32 w-full overflow-visible" viewBox="0 0 100 86" preserveAspectRatio="none">
 <polyline
 fill="none"
 points={coordinates.join(" ")}
 stroke="currentColor"
 strokeLinecap="round"
 strokeLinejoin="round"
 strokeWidth="3"
 className="text-primary"
 />
 {points.map((point, index) => {
 const [x, y] = coordinates[index].split(",").map(Number);

 return (
 <circle
 key={`${point.date}-${point.value}`}
 cx={x}
 cy={y}
 fill="var(--surface)"
 r="3"
 stroke="currentColor"
 strokeWidth="2"
 className="text-primary"
 />
 );
 })}
 </svg>
 </div>
 );
}

export function BarHistoryChart({
 items,
 label,
 suffix = "",
}: {
 items: Array<{ label: string; value: number }>;
 label: string;
 suffix?: string;
}) {
 const max = Math.max(1, ...items.map((item) => item.value));

 return (
 <div className="h-fit self-start rounded-[20px] bg-background p-4">
 <p className="text-sm font-extrabold text-foreground">{label}</p>
 <div className="mt-5 grid h-40 grid-cols-[repeat(var(--bar-count),minmax(0,1fr))] items-end gap-2 [--bar-count:6] sm:[--bar-count:8]">
 {items.map((item) => (
 <div key={item.label} className="flex h-full flex-col justify-end gap-2">
 <div
 className="min-h-2 rounded-t-xl bg-primary"
 style={{ height: `${Math.max((item.value / max) * 100, item.value ? 12 : 4)}%` }}
 title={`${item.value}${suffix}`}
 />
 <span className="truncate text-center text-[0.68rem] font-bold text-muted">
 {item.label}
 </span>
 </div>
 ))}
 </div>
 </div>
 );
}

export function DeltaBadge({
 current,
 previous,
 unit,
}: {
 current: number | null | undefined;
 previous: number | null | undefined;
 unit?: string | null;
}) {
 if (current === null || current === undefined || previous === null || previous === undefined) {
 return <ProgressStatusPill>Sin comparacion anterior</ProgressStatusPill>;
 }

 const delta = Number((current - previous).toFixed(1));
 const Icon = delta <= 0 ? TrendingDown : TrendingUp;

 return (
 <span
 className={cn(
 "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold",
 delta <= 0 ? "bg-primary-soft text-foreground" : "bg-warning-soft text-warning",
 )}
 >
 <Icon className="size-3.5" aria-hidden="true" />
 {delta > 0 ? "+" : ""}
 {formatValue(delta, unit)} comparado con el registro anterior
 </span>
 );
}

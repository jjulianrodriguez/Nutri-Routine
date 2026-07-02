import {
 AlertTriangle,
 BarChart3,
 CalendarClock,
 CheckCircle2,
 Dumbbell,
 FileText,
 HeartPulse,
 LineChart,
 Scale,
 TrendingDown,
 TrendingUp,
 UserRound,
 Utensils,
} from "lucide-react";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";

import { AppPanel, EmptyState } from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { isAssignmentApplicableOnDate } from "@/lib/habits/utils";
import { cn } from "@/lib/utils";
import type {
 MeasurementsProgressSummary,
 NutritionProgressSummary,
 ProgressBlock,
 ProgressClientOption,
 ProgressEntrySummary,
 ProgressPageData,
 ProgressPermissions,
 ProgressTab,
} from "@/lib/progress/data";
import type {
 ClientTrainingOverview,
 WorkoutDayProgressSummary,
} from "@/types/routine";

const progressTabs: Array<{
 id: ProgressTab;
 icon: ElementType;
 label: string;
}> = [
 { id: "resumen", icon: BarChart3, label: "Resumen" },
 { id: "nutricion", icon: Utensils, label: "Nutricion" },
 { id: "entrenamiento", icon: Dumbbell, label: "Entrenamiento" },
 { id: "medidas", icon: Scale, label: "Medidas" },
];

function formatDate(value: string | null | undefined) {
 if (!value) {
 return "Sin fecha";
 }

 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 }).format(new Date(value));
}

function formatShortDate(value: string) {
 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 }).format(new Date(value));
}

function formatValue(value: number | null | undefined, unit?: string | null) {
 if (value === null || value === undefined) {
 return "Sin dato";
 }

 return `${Number(value.toFixed(1))}${unit ? ` ${unit}` : ""}`;
}

function classifyMetric(metricType: string) {
 const normalized = metricType
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .toLowerCase();

 if (normalized.includes("peso") || normalized.includes("weight")) {
 return "weight";
 }

 if (
 normalized.includes("grasa") ||
 normalized.includes("body fat") ||
 normalized.includes("fat")
 ) {
 return "bodyFat";
 }

 return "other";
}

function getMetricSeries(entries: ProgressEntrySummary[], kind: "bodyFat" | "weight") {
 return entries
 .filter((entry) => classifyMetric(entry.metric_type) === kind)
 .filter((entry) => entry.metric_value !== null)
 .map((entry) => ({
 date: entry.recorded_at,
 label: formatShortDate(entry.recorded_at),
 value: entry.metric_value ?? 0,
 }))
 .reverse();
}

function getLatestByKind(
 entries: ProgressEntrySummary[],
 kind: "bodyFat" | "weight",
) {
 return entries.find((entry) => classifyMetric(entry.metric_type) === kind);
}

function getPreviousByKind(
 entries: ProgressEntrySummary[],
 kind: "bodyFat" | "weight",
) {
 return entries.filter((entry) => classifyMetric(entry.metric_type) === kind)[1];
}

function getWorkoutStats(progress: WorkoutDayProgressSummary[]) {
 const completed = progress.filter((item) => item.completedAt);
 const now = new Date();
 const weekStart = new Date(now);
 weekStart.setDate(now.getDate() - 6);
 weekStart.setHours(0, 0, 0, 0);
 const monthStart = new Date(now);
 monthStart.setDate(now.getDate() - 29);
 monthStart.setHours(0, 0, 0, 0);

 return {
 completed,
 monthly: completed.filter((item) => new Date(item.workoutDate) >= monthStart)
 .length,
 weekly: completed.filter((item) => new Date(item.workoutDate) >= weekStart)
 .length,
 };
}

function getTrainingHistory(progress: WorkoutDayProgressSummary[]) {
 const ranges = Array.from({ length: 6 }, (_, index) => {
 const end = new Date();
 end.setDate(end.getDate() - 7 * (5 - index));
 const start = new Date(end);
 start.setDate(end.getDate() - 6);

 return {
 end,
 label: formatShortDate(end.toISOString()),
 start,
 };
 });
 const completed = progress.filter((item) => item.completedAt);

 return ranges.map((range) => ({
 label: range.label,
 value: completed.filter((item) => {
 const date = new Date(item.workoutDate);
 return date >= range.start && date <= range.end;
 }).length,
 }));
}

function hrefForTab(tab: ProgressTab, clientId?: string | null) {
 const params = new URLSearchParams({ tab });

 if (clientId) {
 params.set("client", clientId);
 }

 return `/app/progreso?${params.toString()}`;
}

function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "neutral" | "warn" }) {
 return (
 <span
 className={cn(
 "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold",
 tone === "good" && "bg-primary-soft text-foreground",
 tone === "neutral" && "bg-muted/10 text-muted",
 tone === "warn" && "bg-warning-soft text-warning",
 )}
 >
 {children}
 </span>
 );
}

function MetricCard({
 detail,
 icon: Icon,
 label,
 value,
}: {
 detail: string;
 icon: ElementType;
 label: string;
 value: string;
}) {
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

function BlockError({ message }: { message: string }) {
 return (
 <div className="flex items-start gap-3 rounded-[18px] border-warning/30 bg-warning-soft p-4 text-sm font-semibold leading-6 text-warning">
 <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
 <span>{message}</span>
 </div>
 );
}

function EmptyProgressState({
 action,
 description,
 title,
}: {
 action?: ReactNode;
 description: string;
 title: string;
}) {
 return (
 <div className="h-fit self-start rounded-card bg-surface-muted/60 p-5">
 <p className="font-extrabold text-foreground">{title}</p>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
 {action ? <div className="mt-4">{action}</div> : null}
 </div>
 );
}

function ClientSelectorPanel({
 clients,
 invalidClientSelection,
 selectedClient,
}: {
 clients: ProgressClientOption[];
 invalidClientSelection: boolean;
 selectedClient: ProgressClientOption | null;
}) {
 return (
 <section className="h-fit self-start rounded-[24px] bg-surface/85 p-4 ">
 <form
 action="/app/progreso"
 className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
 >
 <input name="tab" type="hidden" value="resumen" />
 <label className="grid gap-2 text-sm font-bold text-foreground">
 Selecciona un cliente para ver su progreso
 <select
 className="h-11 rounded-control bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-primary"
 defaultValue={selectedClient?.id ?? ""}
 name="client"
 >
 <option value="" disabled>
 Elegir cliente
 </option>
 {clients.map((client) => (
 <option key={client.id} value={client.id}>
 {client.fullName}
 </option>
 ))}
 </select>
 </label>
 <Button type="submit">
 <UserRound className="size-4" aria-hidden="true" />
 Ver progreso
 </Button>
 </form>
 {invalidClientSelection ? (
 <p className="mt-3 text-sm font-semibold text-warning">
 Ese cliente no esta disponible para tu cuenta.
 </p>
 ) : null}
 </section>
 );
}

function ProgressTabs({
 activeTab,
 selectedClientId,
}: {
 activeTab: ProgressTab;
 selectedClientId: string | null;
}) {
 return (
 <nav
 aria-label="Secciones de progreso"
 className="grid gap-2 sm:grid-cols-4"
 >
 {progressTabs.map((tab) => {
 const Icon = tab.icon;
 const active = activeTab === tab.id;

 return (
 <Link
 key={tab.id}
 className={cn(
 "inline-flex h-11 items-center justify-center gap-2 rounded-control px-3 text-sm font-extrabold transition",
 active
 ? "bg-primary !text-white"
 : "text-muted hover:bg-primary-soft hover:text-foreground",
 )}
 href={hrefForTab(tab.id, selectedClientId)}
 >
 <Icon className="size-4" aria-hidden="true" />
 {tab.label}
 </Link>
 );
 })}
 </nav>
 );
}

function ActionLinks({
 access,
 permissions,
 selectedClient,
}: {
 access: CurrentUserAccess;
 permissions: ProgressPermissions;
 selectedClient: ProgressClientOption;
}) {
 const actions: Array<{ href: string; icon: ElementType; label: string }> = [];

 if (access.isClient) {
 if (selectedClient.hasNutritionService) {
 actions.push(
 { href: "/app/nutricion/habitos", icon: CheckCircle2, label: "Ver mis habitos" },
 { href: "/app/nutricion", icon: FileText, label: "Abrir plan de alimentacion" },
 );
 }

 if (selectedClient.hasTrainingService) {
 actions.push({
 href: "/app/entrenamiento",
 icon: Dumbbell,
 label: "Ver mi entrenamiento",
 });
 }
 } else {
 actions.push({
 href: `/app/clientes/${selectedClient.id}`,
 icon: UserRound,
 label: "Ver cliente",
 });

 if (permissions.canManageNutritionForClient) {
 actions.push(
 { href: "/app/nutricion/habitos", icon: CheckCircle2, label: "Asignar habito" },
 { href: "/app/nutricion/asignaciones", icon: FileText, label: "Asignar plan" },
 );
 }

 if (permissions.canManageTrainingForClient) {
 actions.push({
 href: "/app/entrenamiento/asignaciones",
 icon: Dumbbell,
 label: "Ver entrenamiento",
 });
 }
 }

 if (actions.length === 0) {
 return null;
 }

 return (
 <div className="flex flex-wrap gap-2">
 {actions.map((action) => {
 const Icon = action.icon;

 return (
 <Button key={`${action.href}-${action.label}`} asChild size="sm" variant="outline">
 <Link href={action.href}>
 <Icon className="size-4" aria-hidden="true" />
 {action.label}
 </Link>
 </Button>
 );
 })}
 </div>
 );
}

function LineTrendChart({
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
 <StatusPill>{formatValue(points[points.length - 1].value, unit)}</StatusPill>
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

function BarHistoryChart({
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

function DeltaBadge({
 current,
 previous,
 unit,
}: {
 current: number | null | undefined;
 previous: number | null | undefined;
 unit?: string | null;
}) {
 if (current === null || current === undefined || previous === null || previous === undefined) {
 return <StatusPill>Sin comparacion anterior</StatusPill>;
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

function WeekdayHabitGrid({ nutrition }: { nutrition: NutritionProgressSummary }) {
 return (
 <div className="grid grid-cols-7 gap-2">
 {nutrition.habits.weekDays.map((day) => {
 const applicable = nutrition.habits.assignments.filter((assignment) =>
 isAssignmentApplicableOnDate(assignment, day.date),
 );
 const completed = applicable.filter(
 (assignment) => assignment.progressByDate[day.date]?.completed,
 ).length;
 const percentage =
 applicable.length > 0 ? Math.round((completed / applicable.length) * 100) : 0;

 return (
 <div
 key={day.date}
 className={cn(
 "h-fit self-start rounded-[16px] p-3 text-center",
 day.isToday
 ? "border-primary bg-primary-soft"
 : " bg-background",
 )}
 >
 <p className="text-xs font-extrabold text-muted">{day.shortLabel}</p>
 <p className="mt-2 text-lg font-black text-foreground">{percentage}%</p>
 <p className="text-[0.68rem] font-bold text-muted-foreground">
 {completed}/{applicable.length}
 </p>
 </div>
 );
 })}
 </div>
 );
}

function PlanMeta({
 createdAt,
 description,
 status,
 title,
}: {
 createdAt: string;
 description?: string | null;
 status: string;
 title: string;
}) {
 return (
 <div className="h-fit self-start rounded-[20px] bg-background p-4">
 <div className="flex flex-wrap items-start justify-between gap-3">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Plan actual
 </p>
 <h3 className="mt-1 text-lg font-black text-foreground">{title}</h3>
 </div>
 <StatusPill tone={status === "active" ? "good" : "neutral"}>{status}</StatusPill>
 </div>
 {description ? (
 <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
 ) : null}
 <p className="mt-3 text-xs font-bold text-muted-foreground">
 Ultimo movimiento: {formatDate(createdAt)}
 </p>
 </div>
 );
}

function NutritionTab({
 access,
 block,
 permissions,
 selectedClient,
}: {
 access: CurrentUserAccess;
 block: ProgressBlock<NutritionProgressSummary>;
 permissions: ProgressPermissions;
 selectedClient: ProgressClientOption;
}) {
 if (!selectedClient.hasNutritionService) {
 return (
 <EmptyProgressState
 action={
 !access.isClient && permissions.canManageNutritionForClient ? (
 <Button asChild size="sm">
 <Link href="/app/nutricion/asignaciones">Asignar plan</Link>
 </Button>
 ) : null
 }
 description={
 access.isClient
 ? "Todavia no tienes habitos o plan nutricional asignado."
 : "Este cliente no tiene nutricion asignada."
 }
 title="No hay nutricion activa"
 />
 );
 }

 if (block.error) {
 return <BlockError message={block.error} />;
 }

 const nutrition = block.data;
 if (!nutrition) {
 return <BlockError message="No pudimos cargar el progreso nutricional." />;
 }

 const stats = nutrition.habits.stats;
 const pendingAssignments = nutrition.habits.assignments.filter((assignment) =>
 nutrition.habits.weekDays.some(
 (day) =>
 isAssignmentApplicableOnDate(assignment, day.date) &&
 !assignment.progressByDate[day.date]?.completed,
 ),
 );

 return (
 <div className="space-y-5">
 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <MetricCard
 detail="Habitos completados esta semana"
 icon={CheckCircle2}
 label="Completados"
 value={`${stats.completed}/${stats.total}`}
 />
 <MetricCard
 detail="Cumplimiento semanal de habitos"
 icon={BarChart3}
 label="Cumplimiento"
 value={`${stats.percentage}%`}
 />
 <MetricCard
 detail="Dias marcados de lunes a domingo"
 icon={CalendarClock}
 label="Dias marcados"
 value={String(stats.markedDays)}
 />
 <MetricCard
 detail="Habitos pendientes de la semana"
 icon={AlertTriangle}
 label="Pendientes"
 value={String(stats.pending)}
 />
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr]">
 <AppPanel title="Semana actual">
 {nutrition.habits.assignments.length > 0 ? (
 <WeekdayHabitGrid nutrition={nutrition} />
 ) : (
 <EmptyProgressState
 action={
 !access.isClient && permissions.canManageNutritionForClient ? (
 <Button asChild size="sm">
 <Link href="/app/nutricion/habitos">Asignar habito</Link>
 </Button>
 ) : null
 }
 description={
 access.isClient
 ? "Todavia no tienes habitos asignados para esta semana."
 : "No hay habitos asignados esta semana."
 }
 title="No hay habitos asignados esta semana"
 />
 )}
 </AppPanel>

 <AppPanel title="Plan alimenticio" tone="primary">
 {nutrition.plan ? (
 <PlanMeta
 createdAt={nutrition.plan.createdAt}
 description={nutrition.plan.description}
 status={nutrition.plan.status}
 title={nutrition.plan.title}
 />
 ) : (
 <EmptyProgressState
 action={
 !access.isClient && permissions.canManageNutritionForClient ? (
 <Button asChild size="sm">
 <Link href="/app/nutricion/asignaciones">Asignar plan</Link>
 </Button>
 ) : null
 }
 description="No hay plan alimenticio activo para mostrar."
 title="Sin plan activo"
 />
 )}
 </AppPanel>
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-2">
 <BarHistoryChart
 items={nutrition.habitHistory.map((item) => ({
 label: formatShortDate(item.end),
 value: item.percentage,
 }))}
 label="Cumplimiento de habitos por semana"
 suffix="%"
 />
 <AppPanel title="Habitos pendientes">
 {pendingAssignments.length > 0 ? (
 <div className="space-y-2">
 {pendingAssignments.slice(0, 6).map((assignment) => (
 <div
 key={assignment.id}
 className="flex items-center justify-between gap-3 rounded-[16px] bg-background px-4 py-3"
 >
 <span className="font-bold text-foreground">{assignment.habit.title}</span>
 <StatusPill tone="warn">Pendiente</StatusPill>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState>No hay habitos pendientes esta semana.</EmptyState>
 )}
 </AppPanel>
 </section>
 </div>
 );
}

function TrainingTab({
 access,
 block,
 permissions,
 selectedClient,
}: {
 access: CurrentUserAccess;
 block: ProgressBlock<ClientTrainingOverview>;
 permissions: ProgressPermissions;
 selectedClient: ProgressClientOption;
}) {
 if (!selectedClient.hasTrainingService) {
 return (
 <EmptyProgressState
 action={
 !access.isClient && permissions.canManageTrainingForClient ? (
 <Button asChild size="sm">
 <Link href="/app/entrenamiento/asignaciones">Asignar entrenamiento</Link>
 </Button>
 ) : null
 }
 description={
 access.isClient
 ? "Todavia no tienes entrenamiento asignado."
 : "Este cliente no tiene entrenamiento asignado."
 }
 title="No hay entrenamiento activo"
 />
 );
 }

 if (block.error) {
 if (block.errorCode === "permission_denied") {
 return (
 <EmptyProgressState
 description={block.error}
 title="Entrenamiento no disponible"
 />
 );
 }

 if (block.errorCode === "client_not_found") {
 return (
 <EmptyProgressState
 description="Revisa la seleccion o vuelve a elegir un cliente disponible."
 title="Cliente no encontrado"
 />
 );
 }

 return <BlockError message={block.error} />;
 }

 const training = block.data;
 if (!training) {
 return <BlockError message="No pudimos cargar el progreso de entrenamiento." />;
 }

 const workoutStats = getWorkoutStats(training.progress);
 const current = training.currentAssignment;

 return (
 <div className="space-y-5">
 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <MetricCard
 detail="Entrenamientos completados en total"
 icon={CheckCircle2}
 label="Completados"
 value={String(workoutStats.completed.length)}
 />
 <MetricCard
 detail="Completados en los ultimos 7 dias"
 icon={BarChart3}
 label="Semana"
 value={String(workoutStats.weekly)}
 />
 <MetricCard
 detail="Completados en los ultimos 30 dias"
 icon={LineChart}
 label="Mes"
 value={String(workoutStats.monthly)}
 />
 <MetricCard
 detail="Estado actual del plan"
 icon={Dumbbell}
 label="Plan"
 value={current?.state ?? "Sin plan"}
 />
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
 <AppPanel title="Entrenamiento actual" tone="accent">
 {current ? (
 <PlanMeta
 createdAt={current.createdAt}
 description={current.description}
 status={current.state}
 title={current.title}
 />
 ) : (
 <EmptyProgressState
 action={
 !access.isClient && permissions.canManageTrainingForClient ? (
 <Button asChild size="sm">
 <Link href="/app/entrenamiento/asignaciones">Asignar entrenamiento</Link>
 </Button>
 ) : null
 }
 description="No hay plan de entrenamiento activo para mostrar."
 title="Sin entrenamiento activo"
 />
 )}
 </AppPanel>

 <BarHistoryChart
 items={getTrainingHistory(training.progress)}
 label="Entrenamientos completados por semana"
 />
 </section>

 <AppPanel title="Historial de entrenamientos">
 {workoutStats.completed.length > 0 ? (
 <div className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
 {workoutStats.completed.slice(0, 6).map((item) => (
 <article
 key={item.id}
 className="h-fit self-start rounded-[18px] bg-background p-4"
 >
 <p className="font-extrabold text-foreground">Dia del ciclo {item.cycleDay}</p>
 <p className="mt-2 text-sm font-semibold text-muted">
 Ultimo registro: {formatDate(item.workoutDate)}
 </p>
 </article>
 ))}
 </div>
 ) : (
 <EmptyState>Todavia no hay entrenamientos completados.</EmptyState>
 )}
 </AppPanel>
 </div>
 );
}

function MeasurementsTab({
 access,
 block,
 permissions,
 selectedClient,
}: {
 access: CurrentUserAccess;
 block: ProgressBlock<MeasurementsProgressSummary>;
 permissions: ProgressPermissions;
 selectedClient: ProgressClientOption;
}) {
 if (!permissions.canViewMeasurements) {
 return (
 <EmptyProgressState
 description="No tienes acceso a las medidas de este cliente."
 title="Medidas no disponibles"
 />
 );
 }

 if (block.error) {
 if (
 block.errorCode === "client_not_found" ||
 block.errorCode === "permission_denied" ||
 block.errorCode === "selection_required"
 ) {
 return (
 <EmptyProgressState
 description={block.error}
 title={
 block.errorCode === "client_not_found"
 ? "Cliente no encontrado"
 : "Medidas no disponibles"
 }
 />
 );
 }

 return <BlockError message={block.error} />;
 }

 const measurements = block.data;
 if (!measurements) {
 return <BlockError message="No pudimos cargar las medidas." />;
 }

 const weightEntry = getLatestByKind(measurements.entries, "weight");
 const previousWeightEntry = getPreviousByKind(measurements.entries, "weight");
 const bodyFatEntry = getLatestByKind(measurements.entries, "bodyFat");
 const previousBodyFatEntry = getPreviousByKind(measurements.entries, "bodyFat");
 const weightValue = weightEntry?.metric_value ?? measurements.profile.weightKg;
 const bodyFatValue =
 bodyFatEntry?.metric_value ?? measurements.profile.bodyFatPercentage;
 const latestRecord = measurements.entries[0]?.recorded_at ?? measurements.profile.updatedAt;
 const weightSeries = getMetricSeries(measurements.entries, "weight");
 const bodyFatSeries = getMetricSeries(measurements.entries, "bodyFat");
 const hasMeasurementEntries = measurements.entries.length > 0;

 if (!measurements.profile.exists && !hasMeasurementEntries) {
 return (
 <EmptyProgressState
 action={
 !access.isClient ? (
 <Button asChild size="sm">
 <Link href={`/app/clientes/${selectedClient.id}`}>Ver cliente</Link>
 </Button>
 ) : null
 }
 description="El cliente todavia no tiene un perfil fisico guardado."
 title="Sin perfil fisico"
 />
 );
 }

 if (!measurements.profile.configured && !hasMeasurementEntries) {
 return (
 <EmptyProgressState
 action={
 !access.isClient ? (
 <Button asChild size="sm">
 <Link href={`/app/clientes/${selectedClient.id}`}>Ver cliente</Link>
 </Button>
 ) : null
 }
 description="El cliente todavia no tiene peso, altura, grasa corporal ni medidas fisicas configuradas en su perfil."
 title="Perfil fisico sin configurar"
 />
 );
 }



 return (
 <div className="space-y-5">
 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <MetricCard
 detail="Ultimo peso disponible"
 icon={Scale}
 label="Peso"
 value={formatValue(weightValue, weightEntry?.metric_unit ?? "kg")}
 />
 <MetricCard
 detail="Ultima grasa corporal disponible"
 icon={HeartPulse}
 label="Grasa"
 value={formatValue(bodyFatValue, bodyFatEntry?.metric_unit ?? "%")}
 />
 <MetricCard
 detail="Altura registrada en perfil"
 icon={UserRound}
 label="Altura"
 value={formatValue(measurements.profile.heightCm, "cm")}
 />
 <MetricCard
 detail="Fecha de ultimo registro"
 icon={CalendarClock}
 label="Ultimo registro"
 value={latestRecord ? formatShortDate(latestRecord) : "Sin dato"}
 />
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-2">
 <div className="space-y-3">
 <LineTrendChart
 emptyLabel="No hay historial de peso para graficar."
 label="Peso por fecha"
 points={weightSeries}
 unit={weightEntry?.metric_unit ?? "kg"}
 />
 <DeltaBadge
 current={weightEntry?.metric_value}
 previous={previousWeightEntry?.metric_value}
 unit={weightEntry?.metric_unit ?? "kg"}
 />
 </div>
 <div className="space-y-3">
 <LineTrendChart
 emptyLabel="No hay historial de grasa corporal para graficar."
 label="Grasa corporal por fecha"
 points={bodyFatSeries}
 unit={bodyFatEntry?.metric_unit ?? "%"}
 />
 <DeltaBadge
 current={bodyFatEntry?.metric_value}
 previous={previousBodyFatEntry?.metric_value}
 unit={bodyFatEntry?.metric_unit ?? "%"}
 />
 </div>
 </section>

 <AppPanel title="Medidas fisicas">
 {measurements.profile.bodyMeasurements ? (
 <p className="rounded-[18px] bg-background p-4 text-sm leading-6 text-foreground">
 {measurements.profile.bodyMeasurements}
 </p>
 ) : (
 <EmptyState>No hay medidas fisicas adicionales registradas.</EmptyState>
 )}
 </AppPanel>
 </div>
 );
}

function SummaryTab({
 access,
 data,
}: {
 access: CurrentUserAccess;
 data: ProgressPageData;
}) {
 const selectedClient = data.selectedClient;

 if (!selectedClient) {
 return null;
 }

 const nutrition = data.nutrition.data;
 const training = data.training.data;
 const measurements = data.measurements.data;
 const appointment = data.appointments.data?.[0] ?? null;
 const habitStats = nutrition?.habits.stats;
 const workoutStats = training ? getWorkoutStats(training.progress) : null;
 const latestWeight = measurements
 ? getLatestByKind(measurements.entries, "weight")?.metric_value ??
 measurements.profile.weightKg
 : null;
 const latestBodyFat = measurements
 ? getLatestByKind(measurements.entries, "bodyFat")?.metric_value ??
 measurements.profile.bodyFatPercentage
 : null;
 const alerts: string[] = [];

 if (selectedClient.hasNutritionService && nutrition && !nutrition.plan) {
 alerts.push("No hay plan alimenticio activo.");
 }

 if (selectedClient.hasTrainingService && training && !training.currentAssignment) {
 alerts.push("No hay entrenamiento activo.");
 }

 if (data.nutrition.error && selectedClient.hasNutritionService) {
 alerts.push("El bloque de nutricion no pudo cargarse.");
 }

 if (data.training.error && selectedClient.hasTrainingService) {
 alerts.push("El bloque de entrenamiento no pudo cargarse.");
 }

 return (
 <div className="space-y-5">
 <section className="rounded-[28px] bg-surface/85 p-5 ">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">
 Vista actual
 </p>
 <h2 className="mt-2 text-3xl font-black text-foreground">
 {selectedClient.fullName}
 </h2>
 <p className="mt-2 text-sm font-semibold text-muted-foreground">
 Nutricion {selectedClient.hasNutritionService ? "activa" : "sin asignar"} · Entrenamiento{" "}
 {selectedClient.hasTrainingService ? "activo" : "sin asignar"}
 </p>
 </div>
 <ActionLinks
 access={access}
 permissions={data.permissions}
 selectedClient={selectedClient}
 />
 </div>
 </section>

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <MetricCard
 detail="Cumplimiento semanal de habitos"
 icon={BarChart3}
 label="Cumplimiento"
 value={habitStats ? `${habitStats.percentage}%` : "Sin dato"}
 />
 <MetricCard
 detail="Habitos completados esta semana"
 icon={CheckCircle2}
 label="Habitos"
 value={habitStats ? `${habitStats.completed}/${habitStats.total}` : "Sin dato"}
 />
 <MetricCard
 detail="Entrenamientos completados"
 icon={Dumbbell}
 label="Entrenamiento"
 value={workoutStats ? String(workoutStats.completed.length) : "Sin dato"}
 />
 <MetricCard
 detail="Proxima consulta programada"
 icon={CalendarClock}
 label="Consulta"
 value={appointment ? formatShortDate(appointment.startsAt) : "Sin dato"}
 />
 </section>

 <section className="grid items-start gap-5 lg:grid-cols-2">
 <AppPanel title="Planes activos">
 <div className="space-y-3">
 {selectedClient.hasNutritionService ? (
 nutrition?.plan ? (
 <PlanMeta
 createdAt={nutrition.plan.createdAt}
 description={nutrition.plan.description}
 status={nutrition.plan.status}
 title={nutrition.plan.title}
 />
 ) : (
 <EmptyState>No hay plan alimenticio activo.</EmptyState>
 )
 ) : (
 <EmptyState>Nutricion no asignada.</EmptyState>
 )}
 {selectedClient.hasTrainingService ? (
 training?.currentAssignment ? (
 <PlanMeta
 createdAt={training.currentAssignment.createdAt}
 description={training.currentAssignment.description}
 status={training.currentAssignment.state}
 title={training.currentAssignment.title}
 />
 ) : (
 <EmptyState>No hay entrenamiento activo.</EmptyState>
 )
 ) : (
 <EmptyState>Entrenamiento no asignado.</EmptyState>
 )}
 </div>
 </AppPanel>

 <AppPanel title="Ultimas medidas" tone="primary">
 <div className="grid items-start gap-3 sm:grid-cols-2">
 <MetricCard
 detail="Ultimo peso registrado"
 icon={Scale}
 label="Peso"
 value={formatValue(latestWeight, "kg")}
 />
 <MetricCard
 detail="Ultima grasa corporal"
 icon={HeartPulse}
 label="Grasa"
 value={formatValue(latestBodyFat, "%")}
 />
 </div>
 {measurements?.entries[0] ? (
 <p className="mt-4 text-sm font-bold text-muted-foreground">
 Ultimo registro: {formatDate(measurements.entries[0].recorded_at)}
 </p>
 ) : null}
 </AppPanel>
 </section>

 {appointment || alerts.length > 0 ? (
 <AppPanel title="Alertas e informacion importante" tone="warm">
 <div className="space-y-3">
 {appointment ? (
 <div className="flex items-center justify-between gap-3 rounded-[18px] bg-background p-4">
 <div>
 <p className="font-extrabold text-foreground">{appointment.title}</p>
 <p className="text-sm font-semibold text-muted">
 Proxima consulta: {formatDate(appointment.startsAt)}
 </p>
 </div>
 <StatusPill>{appointment.area}</StatusPill>
 </div>
 ) : null}
 {alerts.map((alert) => (
 <BlockError key={alert} message={alert} />
 ))}
 </div>
 </AppPanel>
 ) : null}
 </div>
 );
}

export function ProgressDashboard({
 access,
 activeTab,
 data,
}: {
 access: CurrentUserAccess;
 activeTab: ProgressTab;
 data: ProgressPageData;
}) {
 const selectedClientId = data.selectedClient?.id ?? null;

 return (
 <div className="space-y-5">
 {!access.isClient ? (
 data.clientOptions.length > 0 ? (
 <ClientSelectorPanel
 clients={data.clientOptions}
 invalidClientSelection={data.invalidClientSelection}
 selectedClient={data.selectedClient}
 />
 ) : (
 <EmptyProgressState
 description="No hay clientes activos disponibles para tu cuenta."
 title="No hay clientes para mostrar"
 />
 )
 ) : null}

 {!data.selectedClient ? (
 data.invalidClientSelection ? (
 <EmptyProgressState
 description="No encontramos ese cliente entre los clientes disponibles para tu cuenta."
 title="Cliente no encontrado"
 />
 ) : (
 <EmptyProgressState
 description="Selecciona un cliente para ver su progreso de nutricion, entrenamiento, habitos y medidas."
 title="Selecciona un cliente para ver su progreso"
 />
 )
 ) : (
 <>
 <ProgressTabs activeTab={activeTab} selectedClientId={selectedClientId} />

 {activeTab === "resumen" ? (
 <SummaryTab access={access} data={data} />
 ) : null}
 {activeTab === "nutricion" ? (
 <NutritionTab
 access={access}
 block={data.nutrition}
 permissions={data.permissions}
 selectedClient={data.selectedClient}
 />
 ) : null}
 {activeTab === "entrenamiento" ? (
 <TrainingTab
 access={access}
 block={data.training}
 permissions={data.permissions}
 selectedClient={data.selectedClient}
 />
 ) : null}
 {activeTab === "medidas" ? (
 <MeasurementsTab
 access={access}
 block={data.measurements}
 permissions={data.permissions}
 selectedClient={data.selectedClient}
 />
 ) : null}
 </>
 )}
 </div>
 );
}

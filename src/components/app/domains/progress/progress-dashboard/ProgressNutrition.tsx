import { AlertTriangle, BarChart3, CalendarClock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { AppPanel } from "@/components/app/layouts/AppScreen";
import { Button } from "@/components/ui/actions/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback/state-block";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { isAssignmentApplicableOnDate } from "@/lib/habits/utils";
import { cn } from "@/lib/utils";
import type {
 NutritionProgressSummary,
 ProgressBlock,
 ProgressClientOption,
 ProgressPermissions,
} from "@/lib/progress/data";

import { BarHistoryChart, ProgressCharts } from "./ProgressCharts";
import { ProgressMetricGrid } from "./ProgressMetricGrid";
import { ProgressPlanMeta, ProgressStatusPill } from "./ProgressShared";
import { formatShortDate } from "./utils";

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

export function ProgressNutrition({
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
 <EmptyState
 actions={
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
 return <ErrorState variant="warning" size="sm" title={block.error} />;
 }

 const nutrition = block.data;
 if (!nutrition) {
 return (
 <ErrorState
 variant="warning"
 size="sm"
 title="No pudimos cargar el progreso nutricional."
 />
 );
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
 <ProgressMetricGrid
 items={[
 {
 detail: "Habitos completados esta semana",
 icon: CheckCircle2,
 label: "Completados",
 value: `${stats.completed}/${stats.total}`,
 },
 {
 detail: "Cumplimiento semanal de habitos",
 icon: BarChart3,
 label: "Cumplimiento",
 value: `${stats.percentage}%`,
 },
 {
 detail: "Dias marcados de lunes a domingo",
 icon: CalendarClock,
 label: "Dias marcados",
 value: String(stats.markedDays),
 },
 {
 detail: "Habitos pendientes de la semana",
 icon: AlertTriangle,
 label: "Pendientes",
 value: String(stats.pending),
 },
 ]}
 />

 <section className="grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr]">
 <AppPanel title="Semana actual">
 {nutrition.habits.assignments.length > 0 ? (
 <WeekdayHabitGrid nutrition={nutrition} />
 ) : (
 <EmptyState
 actions={
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
 <ProgressPlanMeta
 createdAt={nutrition.plan.createdAt}
 description={nutrition.plan.description}
 status={nutrition.plan.status}
 title={nutrition.plan.title}
 />
 ) : (
 <EmptyState
 actions={
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

 <ProgressCharts>
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
 <ProgressStatusPill tone="warn">Pendiente</ProgressStatusPill>
 </div>
 ))}
 </div>
 ) : (
 <EmptyState>No hay habitos pendientes esta semana.</EmptyState>
 )}
 </AppPanel>
 </ProgressCharts>
 </div>
 );
}

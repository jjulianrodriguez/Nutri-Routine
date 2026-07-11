import {
 BarChart3,
 CalendarClock,
 CheckCircle2,
 Dumbbell,
 FileText,
 HeartPulse,
 Scale,
 UserRound,
} from "lucide-react";
import Link from "next/link";
import type { ElementType } from "react";

import { AppPanel, EmptyState } from "@/components/app/AppScreen";
import { Button } from "@/components/ui/button";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import type {
 ProgressClientOption,
 ProgressPageData,
 ProgressPermissions,
} from "@/lib/progress/data";

import { BlockError } from "./ProgressEmptyState";
import { MetricCard, ProgressMetricGrid } from "./ProgressMetricGrid";
import { ProgressPlanMeta, ProgressStatusPill } from "./ProgressShared";
import {
 formatDate,
 formatShortDate,
 formatValue,
 getLatestByKind,
 getWorkoutStats,
} from "./utils";

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

export function ProgressSummary({
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
 Nutricion {selectedClient.hasNutritionService ? "activa" : "sin asignar"}{" "}
 {"\u00b7"} Entrenamiento{" "}
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

 <ProgressMetricGrid
 items={[
 {
 detail: "Cumplimiento semanal de habitos",
 icon: BarChart3,
 label: "Cumplimiento",
 value: habitStats ? `${habitStats.percentage}%` : "Sin dato",
 },
 {
 detail: "Habitos completados esta semana",
 icon: CheckCircle2,
 label: "Habitos",
 value: habitStats ? `${habitStats.completed}/${habitStats.total}` : "Sin dato",
 },
 {
 detail: "Entrenamientos completados",
 icon: Dumbbell,
 label: "Entrenamiento",
 value: workoutStats ? String(workoutStats.completed.length) : "Sin dato",
 },
 {
 detail: "Proxima consulta programada",
 icon: CalendarClock,
 label: "Consulta",
 value: appointment ? formatShortDate(appointment.startsAt) : "Sin dato",
 },
 ]}
 />

 <section className="grid items-start gap-5 lg:grid-cols-2">
 <AppPanel title="Planes activos">
 <div className="space-y-3">
 {selectedClient.hasNutritionService ? (
 nutrition?.plan ? (
 <ProgressPlanMeta
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
 <ProgressPlanMeta
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
 <ProgressStatusPill>{appointment.area}</ProgressStatusPill>
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

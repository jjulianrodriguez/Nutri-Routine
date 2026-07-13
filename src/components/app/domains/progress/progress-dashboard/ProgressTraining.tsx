import { BarChart3, CheckCircle2, Dumbbell, LineChart } from "lucide-react";
import Link from "next/link";

import { AppPanel } from "@/components/app/layouts/AppScreen";
import { Button } from "@/components/ui/actions/button";
import { EmptyState, ErrorState } from "@/components/ui/feedback/state-block";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import type {
 ProgressBlock,
 ProgressClientOption,
 ProgressPermissions,
} from "@/lib/progress/data";
import type { ClientTrainingOverview } from "@/types/routine";

import { BarHistoryChart } from "./ProgressCharts";
import { ProgressMetricGrid } from "./ProgressMetricGrid";
import { getProgressStatusLabel, ProgressPlanMeta } from "./ProgressShared";
import { formatDate, getTrainingHistory, getWorkoutStats } from "./utils";

export function ProgressTraining({
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
 <EmptyState
 actions={
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
 <EmptyState
 description={block.error}
 title="Entrenamiento no disponible"
 />
 );
 }

 if (block.errorCode === "client_not_found") {
 return (
 <EmptyState
 description="Revisa la seleccion o vuelve a elegir un cliente disponible."
 title="Cliente no encontrado"
 />
 );
 }

 return <ErrorState variant="warning" size="sm" title={block.error} />;
 }

 const training = block.data;
 if (!training) {
 return (
 <ErrorState
 variant="warning"
 size="sm"
 title="No pudimos cargar el progreso de entrenamiento."
 />
 );
 }

 const workoutStats = getWorkoutStats(training.progress);
 const current = training.currentAssignment;

 return (
 <div className="space-y-5">
 <ProgressMetricGrid
 items={[
 {
 detail: "Entrenamientos completados en total",
 icon: CheckCircle2,
 label: "Completados",
 value: String(workoutStats.completed.length),
 },
 {
 detail: "Completados en los ultimos 7 dias",
 icon: BarChart3,
 label: "Semana",
 value: String(workoutStats.weekly),
 },
 {
 detail: "Completados en los ultimos 30 dias",
 icon: LineChart,
 label: "Mes",
 value: String(workoutStats.monthly),
 },
 {
 detail: "Estado actual del plan",
 icon: Dumbbell,
 label: "Plan",
 value: current ? getProgressStatusLabel(current.state) : "Sin plan",
 },
 ]}
 />

 <section className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
 <AppPanel title="Entrenamiento actual" tone="accent">
 {current ? (
 <ProgressPlanMeta
 createdAt={current.createdAt}
 description={current.description}
 status={current.state}
 title={current.title}
 />
 ) : (
 <EmptyState
 actions={
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

import {
 ArrowLeft,
 CalendarDays,
 Clock3,
 History,
 ListChecks,
 Tags,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
 AppHeader,
 AppPanel,
 AppScreen,
} from "@/components/app/layouts/AppScreen";
import { EmptyState } from "@/components/ui/feedback/state-block";
import { WorkoutTemplateSnapshotView } from "@/components/app/domains/training/workout-template-snapshot-view";
import { Button } from "@/components/ui/actions/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineAssignmentDetail } from "@/lib/routines/data";
import type {
 RoutineAssignmentState,
 RoutineDifficulty,
} from "@/types/routine";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

const assignmentStateLabels: Record<RoutineAssignmentState, string> = {
 active: "Vigente",
 archived: "Archivada",
 expired: "Vencida",
 upcoming: "Programada",
};

const assignmentStateTones = {
 active: "active",
 archived: "inactive",
 expired: "warning",
 upcoming: "neutral",
} as const satisfies Record<RoutineAssignmentState, "active" | "inactive" | "neutral" | "warning">;

const difficultyLabels: Record<RoutineDifficulty, string> = {
 advanced: "Avanzado",
 beginner: "Principiante",
 intermediate: "Intermedio",
};

function formatDate(value: string | null) {
 if (!value) {
 return "Sin fecha";
 }

 const normalizedValue = value.includes("T")
 ? value
 : `${value}T12:00:00`;

 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "long",
 year: "numeric",
 }).format(new Date(normalizedValue));
}

export default async function HistoricalRoutineDetailPage({
 params,
}: {
 params: Promise<{ assignmentId: string }>;
}) {
 const access = await requireRouteAccess(
 "/app/entrenamiento/historial",
 );
 const { assignmentId } = await params;
 const detail = await getRoutineAssignmentDetail(assignmentId, access);

 if (!detail) {
 notFound();
 }

 const { assignment, routine, routineSource, template } = detail;
 const legacyRoutineSnapshot: WorkoutTemplateSnapshot | null =
 !template && routine
 ? {
 days: [
 {
 dayNumber: 1,
 routine,
 weekday: null,
 },
 ],
 template: {
 cycleDays: 1,
 description: assignment.description ?? routine.description,
 id: assignment.id,
 name: assignment.title,
 },
 version: 1,
 }
 : null;
 const historicalSnapshot = template ?? legacyRoutineSnapshot;
 const historicalMessage = template
 ? "Esta es una copia histórica de la plantilla asignada. Los cambios posteriores no alteran este historial."
 : routineSource === "snapshot"
 ? "Esta es una copia histórica del entrenamiento asignado. Los cambios posteriores no alteran este historial."
 : routineSource === "live"
 ? "Esta plantilla antigua no tenia una copia guardada. Se muestra la version actual disponible."
 : "No fue posible reconstruir el contenido original de esta plantilla.";

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Historial de entrenamiento"
 title={assignment.title}
 description={
 assignment.description ||
 routine?.description ||
 template?.template.description ||
 "Detalle del plan de entrenamiento asignado."
 }
 />

 <Button asChild variant="outline" size="lg">
 <Link href="/app/entrenamiento">
 <ArrowLeft className="size-4" aria-hidden="true" />
 Volver a entrenamiento
 </Link>
 </Button>

 <div className="flex items-start gap-3 rounded-[22px] border-primary/30 bg-primary-tint/55 p-4">
 <History
 className="mt-0.5 size-5 shrink-0 text-muted-foreground"
 aria-hidden="true"
 />
 <div>
 <p className="font-extrabold text-foreground">Copia histórica</p>
 <p className="mt-1 text-sm leading-6 text-muted">
 {historicalMessage}
 </p>
 </div>
 </div>

 <section className="grid grid-cols-2 items-start gap-3 sm:gap-4 xl:grid-cols-5">
 <DetailValue
 icon={History}
 label="Estado"
 value={assignmentStateLabels[assignment.state]}
 />
 <DetailValue
 icon={CalendarDays}
 label="Asignada"
 value={formatDate(assignment.createdAt)}
 />
 <DetailValue
 icon={Clock3}
 label="Periodo"
 value={`${formatDate(assignment.startDate)} - ${formatDate(
 assignment.endDate,
 )}`}
 />
 {assignment.completedDayCount > 0 ? (
 <DetailValue
 icon={ListChecks}
 label="Dias completados"
 value={String(assignment.completedDayCount)}
 />
 ) : null}
 {routine ? (
 <>
 <DetailValue
 icon={ListChecks}
 label="Dificultad"
 value={difficultyLabels[routine.difficulty]}
 />
 <DetailValue
 icon={Tags}
 label="Categoría"
 value={routine.category}
 />
 </>
 ) : template ? (
 <>
 <DetailValue
 icon={ListChecks}
 label="Dias del ciclo"
 value={String(template.template.cycleDays)}
 />
 <DetailValue
 icon={Tags}
 label="Tipo"
 value="Plantilla de entrenamiento"
 />
 </>
 ) : null}
 </section>

 {historicalSnapshot ? (
 <WorkoutTemplateSnapshotView
 snapshot={historicalSnapshot}
 statusLabel={assignmentStateLabels[assignment.state]}
 statusTone={assignmentStateTones[assignment.state]}
 />
 ) : (
 <AppPanel
 title="Detalle historico"
 description="La plantilla se conserva, pero su contenido original no pudo recuperarse."
 >
 <EmptyState>Información histórica no disponible.</EmptyState>
 </AppPanel>
 )}
 </AppScreen>
 );
}

function DetailValue({
 icon: Icon,
 label,
 value,
}: {
 icon: typeof History;
 label: string;
 value: string;
}) {
 return (
 <div className="h-fit self-start rounded-[22px] bg-surface p-4 ">
 <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
 <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
 {label}
 </p>
 <p className="mt-1 text-sm font-extrabold leading-6 text-foreground">
 {value}
 </p>
 </div>
 );
}

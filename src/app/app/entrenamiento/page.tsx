import {
 ArrowRight,
 ClipboardCheck,
 Dumbbell,
 History,
 Layers3,
 ListChecks,
 NotebookTabs,
} from "lucide-react";
import Link from "next/link";

import {
 AppHeader,
 AppPanel,
 AppScreen,
 EmptyState,
 StatTile,
} from "@/components/app/AppScreen";
import { ClientTodayTraining } from "@/components/app/client-today-training";
import { AssignedProfessionalCards } from "@/components/app/relationship-badges";
import {
 trainingSectionTabs,
} from "@/components/app/section-tab-presets";
import { SectionTabs } from "@/components/app/section-tabs";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
 getClientTrainingOverview,
 getRoutineManagementStats,
} from "@/lib/routines/data";
import { getWorkoutTemplateStats } from "@/lib/workout-templates/data";
import type {
 RoutineAssignmentState,
 RoutineAssignmentSummary,
 RoutineDetail,
} from "@/types/routine";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";

const assignmentStateLabels: Record<RoutineAssignmentState, string> = {
 active: "Vigente",
 archived: "Archivada",
 expired: "Vencida",
 upcoming: "Programada",
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

function formatRelativeDate(value: string | null) {
 if (!value) {
 return null;
 }

 const normalizedValue = value.includes("T")
 ? value
 : `${value}T12:00:00`;
 const date = new Date(normalizedValue);
 const diffDays = Math.round(
 (Date.now() - date.getTime()) / 86_400_000,
 );

 if (diffDays === 0) {
 return "Hoy";
 }

 if (diffDays > 0) {
 if (diffDays < 14) {
 return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
 }

 const weeks = Math.round(diffDays / 7);

 return `Hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
 }

 const futureDays = Math.abs(diffDays);

 if (futureDays < 14) {
 return `En ${futureDays} ${futureDays === 1 ? "día" : "días"}`;
 }

 const futureWeeks = Math.round(futureDays / 7);

 return `En ${futureWeeks} ${futureWeeks === 1 ? "semana" : "semanas"}`;
}

function isFutureDate(value: string | null) {
 if (!value) {
 return false;
 }

 const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);

 return date.getTime() > Date.now();
}

function remainingLabel(
 assignment: RoutineAssignmentSummary,
 trainerName: string | null,
) {
 if (assignment.state === "expired") {
 return `Tu plantilla vencio. Consulta a ${
 trainerName ?? "tu profesional de entrenamiento"
 } para actualizarla.`;
 }

 if (assignment.state === "upcoming") {
 return `Inicia el ${formatDate(assignment.startDate)}.`;
 }

 if (assignment.daysRemaining === 0) {
 return "Vence hoy.";
 }

 if (assignment.daysRemaining !== null) {
 if (assignment.daysRemaining >= 14) {
 const weeks = Math.round(assignment.daysRemaining / 7);

 return `Vence en ${weeks} ${
 weeks === 1 ? "semana" : "semanas"
 }.`;
 }

 return `Vence en ${assignment.daysRemaining} ${
 assignment.daysRemaining === 1 ? "día" : "días"
 }.`;
 }

 return "Vigencia sin fecha de cierre.";
}

function getCurrentCycleDay(startDate: string | null, cycleDays: number) {
 if (!startDate || cycleDays < 1) {
 return 1;
 }

 const [year, month, day] = startDate.split("-").map(Number);
 const startUtc = Date.UTC(year, month - 1, day);
 const today = new Date();
 const todayUtc = Date.UTC(
 today.getFullYear(),
 today.getMonth(),
 today.getDate(),
 );
 const elapsedDays = Math.max(
 0,
 Math.floor((todayUtc - startUtc) / 86_400_000),
 );

 return (elapsedDays % cycleDays) + 1;
}

function getClientTrainingSnapshot(
 assignment: RoutineAssignmentSummary | null,
 routine: RoutineDetail | null,
 template: WorkoutTemplateSnapshot | null,
): WorkoutTemplateSnapshot | null {
 if (template) {
 return template;
 }

 if (!assignment || !routine) {
 return null;
 }

 return {
 days: [
 {
 dayNumber: 1,
 routine,
 weekday: null,
 },
 ],
 template: {
 cycleDays: 1,
 description: assignment.description,
 id: assignment.id,
 name: assignment.title,
 },
 version: 1,
 };
}

async function ClientTrainingPage({
 access,
}: {
 access: Awaited<ReturnType<typeof requireRouteAccess>>;
}) {
 const overview = await getClientTrainingOverview(access.userId);
 const current = overview.currentAssignment;
 const trainingSnapshot = getClientTrainingSnapshot(
 current,
 overview.currentRoutine,
 overview.currentTemplate,
 );
 const currentCycleDay = trainingSnapshot
 ? getCurrentCycleDay(
 current?.startDate ?? null,
 trainingSnapshot.template.cycleDays,
 )
 : null;
 const currentProgress =
 current && currentCycleDay
 ? (overview.progress.find(
 (progress) =>
 progress.workoutPlanId === current.id &&
 progress.workoutDate === overview.today &&
 progress.cycleDay === currentCycleDay,
 ) ?? null)
 : null;

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Mi entrenamiento"
 title="Entrenamiento de hoy"
 description={`Tu entrenamiento actual con ${
 access.assignedTrainerName ?? "tu profesional de entrenamiento"
 }, el día que te toca y tu historial de plantillas.`}
 />

 <AssignedProfessionalCards
 assignedNutritionistId={null}
 assignedNutritionistName={null}
 assignedTrainerId={access.assignedTrainerId}
 assignedTrainerName={access.assignedTrainerName}
 className="mb-2"
 />

 {current && trainingSnapshot ? (
 <ClientTodayTraining
 assignment={current}
 currentDayNumber={currentCycleDay}
 progress={currentProgress}
 snapshot={trainingSnapshot}
 today={overview.today}
 trainerName={access.assignedTrainerName}
 />
 ) : (
 <AppPanel
 title="Entrenamiento actual"
 description="Aquí aparecerá tu entrenamiento cuando tengas una plantilla asignada."
 tone="primary"
 >
 <EmptyState>
 No hay una plantilla asignada actualmente. Cuando{" "}
 {access.assignedTrainerName ?? "tu profesional de entrenamiento"} te
 asigne una plantilla, aparecerá aquí con el entrenamiento de hoy.
 </EmptyState>
 </AppPanel>
 )}

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
 <StatTile
 label="Estado actual"
 value={current ? assignmentStateLabels[current.state] : "Sin plantilla"}
 detail={
 current
 ? remainingLabel(current, access.assignedTrainerName)
 : `${
 access.assignedTrainerName ??
 "Tu profesional de entrenamiento"
 } aun no ha asignado una plantilla`
 }
 />
 <StatTile
 label="Duracion"
 value={
 current?.durationWeeks
 ? `${current.durationWeeks} sem`
 : "Sin definir"
 }
 detail={
 current
 ? `${formatDate(current.startDate)} - ${formatDate(current.endDate)}`
 : "Se mostrara cuando recibas una plantilla"
 }
 />
 <StatTile
 label="Plantillas anteriores"
 value={String(overview.history.length)}
 detail="Historial y días completados"
 />
 </section>

 <AppPanel
 title="Historial de plantillas"
 description="Tus plantillas anteriores permanecen visibles con sus fechas y estado."
 tone="accent"
 >
 {overview.history.length > 0 ? (
 <div className="grid items-start gap-4 lg:grid-cols-2">
 {overview.history.map((assignment) => {
 const relativeCreatedLabel = formatRelativeDate(
 assignment.createdAt,
 );
 const isArchivedBeforeEnd =
 assignment.state === "archived" &&
 isFutureDate(assignment.endDate);
 const content = (
 <>
 <div className="flex items-start justify-between gap-3">
 <History
 className="size-5 text-muted-foreground"
 aria-hidden="true"
 />
 <div className="flex flex-wrap justify-end gap-2">
 <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-extrabold text-foreground">
 Copia histórica
 </span>
 <span className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-foreground">
 {assignmentStateLabels[assignment.state]}
 </span>
 </div>
 </div>
 <h3 className="mt-4 text-lg font-extrabold text-foreground">
 {assignment.title}
 </h3>
 <p className="mt-2 text-sm text-muted">
 {formatDate(assignment.startDate)} -{" "}
 {formatDate(assignment.endDate)}
 </p>
 <p className="mt-2 text-sm font-semibold leading-6 text-muted">
 Esta es una copia histórica de la plantilla asignada.
 </p>
 {relativeCreatedLabel ? (
 <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
 Asignada {relativeCreatedLabel}
 </p>
 ) : null}
 {isArchivedBeforeEnd ? (
 <p className="mt-2 rounded-[14px] bg-primary-soft px-3 py-2 text-xs font-bold leading-5 text-foreground">
 Archivada antes de terminar su periodo original.
 </p>
 ) : null}
 {assignment.completedDayCount > 0 ? (
 <p className="mt-3 text-sm font-extrabold text-foreground">
 {assignment.completedDayCount}{" "}
 {assignment.completedDayCount === 1
 ? "día completado"
 : "días completados"}
 </p>
 ) : null}
 {assignment.detailAvailable ? (
 <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-muted-foreground transition group-hover:text-foreground">
 Ver detalle
 <ArrowRight
 className="size-4 transition group-hover:translate-x-1"
 aria-hidden="true"
 />
 </span>
 ) : (
 <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
 Información histórica no disponible
 </p>
 )}
 </>
 );

 return assignment.detailAvailable ? (
 <Link
 key={assignment.id}
 href={`/app/entrenamiento/historial/${assignment.id}`}
 className="group h-fit self-start rounded-[20px] border-foreground/10 bg-surface p-4 outline-none transition hover:border-primary/50 hover:shadow-soft focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/35"
 aria-label={`Ver detalle de ${assignment.title}`}
 >
 {content}
 </Link>
 ) : (
 <article
 key={assignment.id}
 className="h-fit self-start rounded-[20px] border-foreground/10 bg-background/70 p-4"
 >
 {content}
 </article>
 );
 })}
 </div>
 ) : (
 <div className="rounded-[20px] border-foreground/10 bg-surface p-4">
 <NotebookTabs className="size-5 text-muted-foreground" />
 <p className="mt-4 text-sm font-semibold leading-6 text-muted">
 Todavia no hay plantillas anteriores.
 </p>
 </div>
 )}
 </AppPanel>
 </AppScreen>
 );
}

export default async function TrainingPage() {
 const access = await requireRouteAccess("/app/entrenamiento");

 if (access.isClient) {
 return <ClientTrainingPage access={access} />;
 }

 const [overview, templateStats] = await Promise.all([
 getRoutineManagementStats(),
 getWorkoutTemplateStats(),
 ]);

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Entrenamiento"
 title="Gestion de entrenamiento"
 description="Crea ejercicios, combínalos en entrenamientos diarios y organiza esos entrenamientos dentro de plantillas."
 />

 <SectionTabs
 activeId="overview"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />

 <section className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatTile
 label="Ejercicios activos"
 value={String(overview.exerciseCount)}
 detail="Disponibles para crear entrenamientos"
 />
 <StatTile
 label="Entrenamientos"
 value={String(overview.routineCount)}
 detail="Sesiones diarias creadas"
 />
 <StatTile
 label="Plantillas"
 value={String(templateStats.totalCount)}
 detail="Ciclos semanales creados"
 />
 <StatTile
 label="Plantillas activas"
 value={String(templateStats.activeCount)}
 detail="Disponibles para asignar"
 />
 </section>

 <div className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-4">
 <Link
 href="/app/entrenamiento/ejercicios"
 className="group h-fit self-start rounded-[28px] bg-surface p-6 transition hover:border-primary/40 hover:bg-primary-soft/30"
 >
 <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-foreground">
 <Dumbbell className="size-5" aria-hidden="true" />
 </div>
 <h2 className="mt-5 text-3xl font-semibold text-foreground">
 Ejercicios
 </h2>
 <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
 Crea, edita y desactiva ejercicios. Aquí se guardan instrucciones,
 dificultad, grupo muscular, categoría, tipo y recurso externo.
 </p>
 <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-muted-foreground group-hover:text-foreground">
 Gestionar ejercicios
 <ArrowRight className="size-4 transition group-hover:translate-x-1" />
 </span>
 </Link>

 <Link
 href="/app/entrenamiento/rutinas"
 className="group h-fit self-start rounded-[28px] border-foreground/10 bg-secondary-soft p-6 transition hover:border-primary/40 hover:bg-primary-soft/40"
 >
 <div className="grid size-12 place-items-center rounded-full bg-surface text-foreground">
 <ListChecks className="size-5" aria-hidden="true" />
 </div>
 <h2 className="mt-5 text-3xl font-semibold text-foreground">
 Entrenamientos
 </h2>
 <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
 Construye sesiones para un día seleccionando ejercicios y
 configurando series, repeticiones, descanso, notas y orden.
 </p>
 <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-muted-foreground group-hover:text-foreground">
 Gestionar entrenamientos
 <ArrowRight className="size-4 transition group-hover:translate-x-1" />
 </span>
 </Link>

 <Link
 href="/app/entrenamiento/plantillas"
 className="group h-fit self-start rounded-[28px] bg-surface p-6 transition hover:border-primary/40 hover:bg-primary-soft/30"
 >
 <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-foreground">
 <Layers3 className="size-5" aria-hidden="true" />
 </div>
 <h2 className="mt-5 text-3xl font-semibold text-foreground">
 Plantillas
 </h2>
 <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
 Organiza entrenamientos por días para crear ciclos semanales o
 personalizados que puedas reutilizar.
 </p>
 <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-muted-foreground group-hover:text-foreground">
 Gestionar plantillas
 <ArrowRight className="size-4 transition group-hover:translate-x-1" />
 </span>
 </Link>

 <Link
 href="/app/entrenamiento/asignaciones"
 className="group h-fit self-start rounded-[28px] bg-surface p-6 transition hover:border-primary/40 hover:bg-primary-soft/30"
 >
 <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-foreground">
 <ClipboardCheck className="size-5" aria-hidden="true" />
 </div>
 <h2 className="mt-5 text-3xl font-semibold text-foreground">
 Asignaciones
 </h2>
 <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
 Consulta los clientes disponibles, asigna plantillas activas y
 conserva el historial de cada periodo.
 </p>
 <span className="mt-6 inline-flex min-h-11 items-center gap-2 font-extrabold text-muted-foreground group-hover:text-foreground">
 Gestionar asignaciones
 <ArrowRight className="size-4 transition group-hover:translate-x-1" />
 </span>
 </Link>
 </div>
 </AppScreen>
 );
}

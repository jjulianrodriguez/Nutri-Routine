import {
 CalendarDays,
 CheckCircle2,
 Clock3,
 UserRound,
 Users,
} from "lucide-react";
import { redirect } from "next/navigation";

import {
 AppHeader,
 AppPanel,
 AppScreen,
 StatTile,
} from "@/components/app/layouts/AppScreen";
import { EmptyState } from "@/components/ui/feedback/state-block";
import { WorkoutTemplateAssignmentForm } from "@/components/app/domains/training/routine-assignment-form";
import { RoutineUnassignButton } from "@/components/app/domains/training/routine-unassign-button";
import {
 trainingSectionTabs,
} from "@/components/app/shared/section-tab-presets";
import { SectionTabs } from "@/components/app/shared/section-tabs";
import {
 getAssignedRelationBadge,
 RelationshipBadge,
} from "@/components/app/shared/relationship-badges";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
 listAssignableTrainingClients,
} from "@/lib/routines/data";
import { listAssignableWorkoutTemplatesWithMeta } from "@/lib/workout-templates/data";
import { cn } from "@/lib/utils";
import type {
 RoutineAssignmentState,
 RoutineAssignmentSummary,
} from "@/types/routine";

const stateLabels: Record<RoutineAssignmentState, string> = {
 active: "Vigente",
 archived: "Archivada",
 expired: "Vencida",
 upcoming: "Proxima",
};

function formatDate(value: string | null) {
 if (!value) {
 return "Sin fecha";
 }

 return new Intl.DateTimeFormat("es-CR", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 }).format(new Date(`${value}T12:00:00`));
}

function getStatusDetail(assignment: RoutineAssignmentSummary) {
 if (assignment.state === "expired") {
 return `Vencio el ${formatDate(assignment.endDate)}. Sigue asignada hasta renovarla o desasignarla.`;
 }

 if (assignment.state === "upcoming") {
 return `Inicia el ${formatDate(assignment.startDate)}`;
 }

 if (assignment.daysRemaining === 0) {
 return "Vence hoy";
 }

 if (assignment.daysRemaining !== null) {
 return `${assignment.daysRemaining} días restantes`;
 }

 return "Sin fecha de cierre";
}

export default async function RoutineAssignmentsPage({
 searchParams,
}: {
 searchParams: Promise<{
 client?: string | string[];
 template?: string | string[];
 }>;
}) {
 const access = await requireRouteAccess(
 "/app/entrenamiento/asignaciones",
 );

 if (!access.canManageTraining) {
 redirect("/app/entrenamiento");
 }

 const [clients, templateResult, query] = await Promise.all([
 listAssignableTrainingClients(access),
 listAssignableWorkoutTemplatesWithMeta(),
 searchParams,
 ]);
 const { templates, warning } = templateResult;
 const requestedTemplateId =
 typeof query.template === "string" ? query.template : "";
 const requestedClientId =
 typeof query.client === "string" ? query.client : "";
 const defaultTemplateId = templates.some(
 (template) => template.id === requestedTemplateId,
 )
 ? requestedTemplateId
 : "";
 const defaultClientId = clients.some(
 (client) => client.id === requestedClientId,
 )
 ? requestedClientId
 : "";
 const assignedCount = clients.filter(
 (client) => client.currentAssignment,
 ).length;
 const expiredCount = clients.filter(
 (client) => client.currentAssignment?.state === "expired",
 ).length;

 return (
 <AppScreen>
 <AppHeader
 eyebrow="Entrenamiento"
 title="Asignaciones de plantillas"
 description="Asigna ciclos de entrenamiento completos a tus clientes y administra su vigencia desde un único lugar."
 />

 <SectionTabs
 activeId="assignments"
 ariaLabel="Secciones de entrenamiento"
 items={trainingSectionTabs}
 />

 {warning ? (
 <Alert className="rounded-[22px] border-primary/30 bg-primary-soft/50 px-5 py-4">
 <AlertDescription className="font-semibold text-muted-foreground">
 {warning}
 </AlertDescription>
 </Alert>
 ) : null}

 <section className="grid items-start gap-4 sm:grid-cols-3">
 <StatTile
 label="Clientes disponibles"
 value={String(clients.length)}
 detail={
 access.role === "admin"
 ? "Con plan de entrenamiento activo"
 : "Vinculados con entrenamiento activo"
 }
 />
 <StatTile
 label="Con plantilla actual"
 value={String(assignedCount)}
 detail="Una asignación abierta por cliente"
 />
 <StatTile
 label="Plantillas vencidas"
 value={String(expiredCount)}
 detail="Pendientes de renovar o desasignar"
 />
 </section>

 <AppPanel
 title="Nueva asignación"
 description="Al asignar una nueva plantilla se archiva la asignación activa anterior y se conserva en el historial del cliente."
 tone="primary"
 >
 <WorkoutTemplateAssignmentForm
 clients={clients}
 currentUserId={access.userId}
 defaultClientId={defaultClientId}
 defaultTemplateId={defaultTemplateId}
 defaultStartDate={new Date().toISOString().slice(0, 10)}
 isAdmin={access.role === "admin"}
 isProfessional={!access.isClient}
 templates={templates}
 />
 </AppPanel>

 <AppPanel
 title="Clientes y plantillas actuales"
 description={
 access.role === "admin"
 ? "El administrador universal puede gestionar cualquier cuenta cliente."
 : "Solo se muestran los clientes asignados a tu área profesional."
 }
 >
 {clients.length === 0 ? (
 <EmptyState>
 <span className="block">
 No hay clientes con plan de entrenamiento activo.
 </span>
 <span className="mt-1 block">
 Activa el plan de entrenamiento de un cliente antes de asignarle
 una plantilla.
 </span>
 </EmptyState>
 ) : (
 <div className="grid items-start gap-4 lg:grid-cols-2">
 {clients.map((client) => {
 const assignment = client.currentAssignment;
 const relationBadge = getAssignedRelationBadge({
 assignedId: client.assignedTrainerId,
 currentUserId: access.userId,
 isAdmin: access.role === "admin",
 isProfessional: !access.isClient,
 });

 return (
 <article
 key={client.id}
 className="h-fit self-start rounded-[24px] bg-background p-5 "
 >
 <div className="flex items-start justify-between gap-4">
 <div className="flex min-w-0 items-center gap-3">
 <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-foreground">
 <UserRound className="size-5" aria-hidden="true" />
 </div>
 <div className="min-w-0">
 <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
 Cliente
 </p>
 <h2 className="truncate text-xl font-semibold text-foreground">
 {client.name}
 </h2>
 {client.contact ? (
 <p className="mt-1 truncate text-sm font-semibold text-muted">
 {client.contact}
 </p>
 ) : null}
 <div className="mt-3 flex flex-wrap gap-2">
 <RelationshipBadge tone="primary">
 Entrenamiento
 </RelationshipBadge>
 <RelationshipBadge tone={relationBadge.tone}>
 {relationBadge.label}
 </RelationshipBadge>
 </div>
 </div>
 </div>
 <span
 className={cn(
 "rounded-full px-3 py-1 text-xs font-extrabold",
 !assignment && "bg-surface-muted text-foreground",
 assignment?.state === "active" &&
 "bg-primary text-primary-foreground",
 assignment?.state === "upcoming" &&
 "bg-secondary-soft text-secondary",
 assignment?.state === "expired" &&
 "bg-danger/10 text-danger",
 )}
 >
 {assignment
 ? stateLabels[assignment.state]
 : "Sin plantilla"}
 </span>
 </div>

 <div className="mt-4 grid items-start gap-3 border-t pt-4 sm:grid-cols-2">
 <div>
 <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
 Plan de entrenamiento
 </p>
 <p className="mt-1 text-sm font-extrabold text-foreground">
 Activo
 </p>
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-wide text-muted">
 Responsable
 </p>
 <p className="mt-1 truncate text-sm font-extrabold text-foreground">
 {client.assignedTrainerName ??
 "Sin profesional asignado"}
 </p>
 </div>
 </div>

 {assignment ? (
 <div className="mt-5 rounded-[20px] border-foreground/10 bg-surface p-4">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
 <CheckCircle2
 className="size-4"
 aria-hidden="true"
 />
 Plantilla asignada
 </div>
 <h3 className="mt-2 text-lg font-extrabold text-foreground">
 {assignment.title}
 </h3>
 <p className="mt-1 text-sm font-semibold text-muted">
 {getStatusDetail(assignment)}
 </p>
 </div>
 <RoutineUnassignButton
 assignmentId={assignment.id}
 assignmentName={assignment.title}
 clientName={client.name}
 />
 </div>

 <div className="mt-4 grid items-start gap-3 border-t pt-4 sm:grid-cols-3">
 <AssignmentMeta
 icon={CalendarDays}
 label="Inicio"
 value={formatDate(assignment.startDate)}
 />
 <AssignmentMeta
 icon={Clock3}
 label="Fin"
 value={formatDate(assignment.endDate)}
 />
 <AssignmentMeta
 icon={Users}
 label="Duracion"
 value={
 assignment.durationWeeks
 ? `${assignment.durationWeeks} semanas`
 : "Sin definir"
 }
 />
 </div>
 </div>
 ) : (
 <div className="mt-5">
 <EmptyState>
 Este cliente no tiene una plantilla asignada actualmente.
 </EmptyState>
 </div>
 )}
 </article>
 );
 })}
 </div>
 )}
 </AppPanel>
 </AppScreen>
 );
}

function AssignmentMeta({
 icon: Icon,
 label,
 value,
}: {
 icon: typeof CalendarDays;
 label: string;
 value: string;
}) {
 return (
 <div>
 <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
 <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-muted">
 {label}
 </p>
 <p className="mt-1 text-sm font-extrabold text-foreground">{value}</p>
 </div>
 );
}

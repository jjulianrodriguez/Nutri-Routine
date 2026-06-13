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
  EmptyState,
  StatTile,
} from "@/components/app/AppScreen";
import { RoutineAssignmentForm } from "@/components/app/routine-assignment-form";
import { RoutineUnassignButton } from "@/components/app/routine-unassign-button";
import { TrainingSectionNav } from "@/components/app/training-section-nav";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import {
  getRoutineManagementOverview,
  listAssignableTrainingClients,
} from "@/lib/routines/data";
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
    return `Vencio el ${formatDate(assignment.endDate)}`;
  }

  if (assignment.state === "upcoming") {
    return `Inicia el ${formatDate(assignment.startDate)}`;
  }

  if (assignment.daysRemaining === 0) {
    return "Vence hoy";
  }

  if (assignment.daysRemaining !== null) {
    return `${assignment.daysRemaining} dias restantes`;
  }

  return "Sin fecha de cierre";
}

export default async function RoutineAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    client?: string | string[];
    routine?: string | string[];
  }>;
}) {
  const access = await requireRouteAccess(
    "/app/entrenamiento/asignaciones",
  );

  if (!access.canManageTraining) {
    redirect("/app/entrenamiento");
  }

  const [clients, overview, query] = await Promise.all([
    listAssignableTrainingClients(access),
    getRoutineManagementOverview(),
    searchParams,
  ]);
  const routines = overview.routines
    .filter((routine) => routine.isActive)
    .map((routine) => ({
      category: routine.category,
      id: routine.id,
      name: routine.name,
    }));
  const requestedRoutineId =
    typeof query.routine === "string" ? query.routine : "";
  const requestedClientId =
    typeof query.client === "string" ? query.client : "";
  const defaultRoutineId = routines.some(
    (routine) => routine.id === requestedRoutineId,
  )
    ? requestedRoutineId
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
        title="Asignaciones de rutinas"
        description="Asigna rutinas activas a tus clientes y administra su vigencia desde un unico lugar."
      />

      <TrainingSectionNav active="assignments" />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Clientes disponibles"
          value={String(clients.length)}
          detail="Vinculados con entrenamiento"
        />
        <StatTile
          label="Con rutina actual"
          value={String(assignedCount)}
          detail="Asignaciones activas o programadas"
        />
        <StatTile
          label="Rutinas vencidas"
          value={String(expiredCount)}
          detail="Pendientes de renovar o desasignar"
        />
      </section>

      <AppPanel
        title="Nueva asignacion"
        description="Al asignar una nueva rutina se archiva la asignacion activa anterior y se conserva en el historial del cliente."
        tone="primary"
      >
        <RoutineAssignmentForm
          clients={clients}
          defaultClientId={defaultClientId}
          defaultRoutineId={defaultRoutineId}
          defaultStartDate={new Date().toISOString().slice(0, 10)}
          routines={routines}
        />
      </AppPanel>

      <AppPanel
        title="Clientes y rutinas actuales"
        description="Solo se muestran los clientes asignados a tu area profesional."
      >
        {clients.length === 0 ? (
          <EmptyState>
            No hay clientes de entrenamiento vinculados con tu cuenta.
          </EmptyState>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {clients.map((client) => {
              const assignment = client.currentAssignment;

              return (
                <article
                  key={client.id}
                  className="rounded-[24px] border border-border bg-background p-5 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-charcoal">
                        <UserRound className="size-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                          Cliente
                        </p>
                        <h2 className="truncate text-xl font-semibold text-charcoal">
                          {client.name}
                        </h2>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-extrabold",
                        !assignment && "bg-stone-soft text-stone-hover",
                        assignment?.state === "active" &&
                          "bg-primary text-charcoal",
                        assignment?.state === "upcoming" &&
                          "bg-teal-soft text-teal",
                        assignment?.state === "expired" &&
                          "bg-danger/10 text-danger",
                      )}
                    >
                      {assignment
                        ? stateLabels[assignment.state]
                        : "Sin rutina"}
                    </span>
                  </div>

                  {assignment ? (
                    <div className="mt-5 rounded-[20px] border border-charcoal/10 bg-surface p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-bold text-warm-brown">
                            <CheckCircle2
                              className="size-4"
                              aria-hidden="true"
                            />
                            Rutina asignada
                          </div>
                          <h3 className="mt-2 text-lg font-extrabold text-charcoal">
                            {assignment.title}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-muted">
                            {getStatusDetail(assignment)}
                          </p>
                        </div>
                        <RoutineUnassignButton
                          assignmentId={assignment.id}
                          clientName={client.name}
                          routineName={assignment.title}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
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
                        Este cliente no tiene una rutina asignada actualmente.
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
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold text-charcoal">{value}</p>
    </div>
  );
}

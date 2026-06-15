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
  EmptyState,
} from "@/components/app/AppScreen";
import { RoutineExerciseList } from "@/components/app/routine-exercise-list";
import { Button } from "@/components/ui/button";
import { requireRouteAccess } from "@/lib/auth/current-user-access";
import { getRoutineAssignmentDetail } from "@/lib/routines/data";
import type {
  RoutineAssignmentState,
  RoutineDifficulty,
} from "@/types/routine";

const assignmentStateLabels: Record<RoutineAssignmentState, string> = {
  active: "Vigente",
  archived: "Finalizada",
  expired: "Vencida",
  upcoming: "Programada",
};

const difficultyLabels: Record<RoutineDifficulty, string> = {
  advanced: "Avanzada",
  beginner: "Principiante",
  intermediate: "Intermedia",
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
  const historicalMessage = template
    ? "Esta vista usa la copia guardada cuando se asigno la plantilla. Los cambios posteriores no alteran este historial."
    : routineSource === "snapshot"
      ? "Esta vista usa la copia guardada cuando se asigno la rutina. Los cambios posteriores no alteran este historial."
      : routineSource === "live"
        ? "Esta asignacion antigua no tenia una copia guardada. Se muestra la version actual disponible."
        : "No fue posible reconstruir el contenido original de esta asignacion.";

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Historial de entrenamiento"
        title={assignment.title}
        description={
          assignment.description ||
          routine?.description ||
          template?.template.description ||
          "Detalle de la rutina asignada."
        }
      />

      <Button asChild variant="outline" size="lg">
        <Link href="/app/entrenamiento">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a entrenamiento
        </Link>
      </Button>

      <div className="flex items-start gap-3 rounded-[22px] border border-primary/30 bg-primary-soft/55 p-4">
        <History
          className="mt-0.5 size-5 shrink-0 text-warm-brown"
          aria-hidden="true"
        />
        <div>
          <p className="font-extrabold text-charcoal">Copia historica</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {historicalMessage}
          </p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        {routine ? (
          <>
            <DetailValue
              icon={ListChecks}
              label="Dificultad"
              value={difficultyLabels[routine.difficulty]}
            />
            <DetailValue
              icon={Tags}
              label="Categoria"
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

      {routine ? (
        <AppPanel
          title="Ejercicios de la rutina"
          description={`${routine.exercises.length} ejercicios en el orden definido para esta rutina.`}
        >
          <RoutineExerciseList
            emptyMessage="Esta rutina historica no tiene ejercicios disponibles."
            exercises={routine.exercises}
          />
        </AppPanel>
      ) : template ? (
        <div className="space-y-6">
          {template.days.map((day) => (
            <AppPanel
              key={`${day.dayNumber}-${day.routine.id}`}
              title={`Dia ${day.dayNumber}: ${day.routine.name}`}
              description={day.routine.description}
            >
              <RoutineExerciseList
                emptyMessage="Este dia no tiene ejercicios disponibles."
                exercises={day.routine.exercises}
              />
            </AppPanel>
          ))}
        </div>
      ) : (
        <AppPanel
          title="Detalle historico"
          description="La asignacion se conserva, pero su contenido original no pudo recuperarse."
        >
          <EmptyState>Informacion historica no disponible.</EmptyState>
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
    <div className="rounded-[22px] border border-border bg-surface p-4 shadow-soft">
      <Icon className="size-4 text-warm-brown" aria-hidden="true" />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold leading-6 text-charcoal">
        {value}
      </p>
    </div>
  );
}

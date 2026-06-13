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

  const { assignment, routine } = detail;

  return (
    <AppScreen>
      <AppHeader
        eyebrow="Historial de entrenamiento"
        title={assignment.title}
        description={
          assignment.description ||
          routine.description ||
          "Detalle de la rutina asignada."
        }
      />

      <Button asChild variant="outline" size="lg">
        <Link href="/app/entrenamiento">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a entrenamiento
        </Link>
      </Button>

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
      </section>

      <AppPanel
        title="Ejercicios de la rutina"
        description={`${routine.exercises.length} ejercicios en el orden definido para esta rutina.`}
      >
        <RoutineExerciseList
          emptyMessage="Esta rutina historica no tiene ejercicios disponibles."
          exercises={routine.exercises}
        />
      </AppPanel>
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

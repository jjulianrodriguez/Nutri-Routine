"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { updateWorkoutDayExerciseProgress } from "@/lib/actions/workout-day-progress";
import type {
 RoutineAssignmentState,
 RoutineAssignmentSummary,
 WorkoutDayProgressSummary,
} from "@/types/routine";
import type { WorkoutTemplateSnapshot } from "@/types/workout-template";
import {
 WorkoutTemplateView,
 type TemplateStatusTone,
} from "@/components/app/workout-template-view";

const stateLabels: Record<RoutineAssignmentState, string> = {
 active: "Vigente",
 archived: "Archivada",
 expired: "Vencida",
 upcoming: "Programada",
};

const stateTones: Record<RoutineAssignmentState, TemplateStatusTone> = {
 active: "active",
 archived: "inactive",
 expired: "warning",
 upcoming: "neutral",
};

function getStatusMessage(
 assignment: RoutineAssignmentSummary,
 trainerName: string | null,
) {
 if (assignment.state === "expired") {
 return `Tu entrenamiento esta vencido. Consulta a ${
 trainerName ?? "tu profesional de entrenamiento"
 } para actualizarlo.`;
 }

 if (assignment.state === "upcoming") {
 return "Este entrenamiento ya esta programado, pero aun no inicia.";
 }

 if (assignment.state === "archived") {
 return "Este entrenamiento ya forma parte de tu historial.";
 }

 return "Marca los ejercicios conforme los completes para llevar tu avance de hoy.";
}

export function ClientTodayTraining({
 assignment,
 currentDayNumber,
 progress,
 snapshot,
 today,
 trainerName,
}: {
 assignment: RoutineAssignmentSummary;
 currentDayNumber: number | null;
 progress: WorkoutDayProgressSummary | null;
 snapshot: WorkoutTemplateSnapshot;
 today: string;
 trainerName: string | null;
}) {
 const todayDay = useMemo(
 () =>
 snapshot.days.find((day) => day.dayNumber === currentDayNumber) ??
 snapshot.days[0] ??
 null,
 [currentDayNumber, snapshot.days],
 );
 const todayExerciseIds = useMemo(
 () => todayDay?.routine.exercises.map((item) => item.id) ?? [],
 [todayDay],
 );
 const [completedExerciseIds, setCompletedExerciseIds] = useState(
 () =>
 progress?.completedExerciseIds.filter((exerciseId) =>
 todayExerciseIds.includes(exerciseId),
 ) ?? [],
 );
 const [completedAt, setCompletedAt] = useState(progress?.completedAt ?? null);
 const [pendingExerciseId, setPendingExerciseId] = useState<string | null>(
 null,
 );
 const [isPending, startTransition] = useTransition();
 const isTrackable = assignment.state === "active";

 function handleExerciseToggle(exerciseId: string, completed: boolean) {
 if (!todayDay || !isTrackable || isPending) {
 return;
 }

 setPendingExerciseId(exerciseId);
 startTransition(async () => {
 const result = await updateWorkoutDayExerciseProgress({
 completed,
 cycleDay: todayDay.dayNumber,
 exerciseId,
 workoutDate: today,
 workoutPlanId: assignment.id,
 });

 setPendingExerciseId(null);

 if (result.status === "error") {
 toast.error(result.message);
 return;
 }

 setCompletedExerciseIds(result.completedExerciseIds);
 setCompletedAt(result.completedAt);
 toast.success(result.message);
 });
 }

 return (
 <WorkoutTemplateView
 currentDayNumber={currentDayNumber}
 description={getStatusMessage(assignment, trainerName)}
 focusCurrentDayFirst
 progress={{
 completedAt,
 completedExerciseIds,
 disabled: !isTrackable || isPending,
 isPending,
 onToggle: handleExerciseToggle,
 pendingExerciseId,
 }}
 showPrimaryActions
 snapshot={snapshot}
 startExpanded="current"
 statusLabel={stateLabels[assignment.state]}
 statusTone={stateTones[assignment.state]}
 viewer="client"
 />
 );
}

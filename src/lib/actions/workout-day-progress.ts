"use server";

import { revalidatePath } from "next/cache";

import { getRoutineDetail } from "@/lib/routines/data";
import { parseRoutineSnapshot } from "@/lib/routines/snapshot";
import { createClient } from "@/lib/supabase/server";
import { parseWorkoutTemplateSnapshot } from "@/lib/workout-templates/snapshot";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WorkoutDayProgressActionResult =
  | {
      completedAt: string | null;
      completedExerciseIds: string[];
      message: string;
      status: "success";
    }
  | {
      message: string;
      status: "error";
    };

type UpdateWorkoutDayProgressInput = {
  completed: boolean;
  cycleDay: number;
  exerciseId: string;
  workoutDate: string;
  workoutPlanId: string;
};

function getTodayDateKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function getInvalidMessage(input: UpdateWorkoutDayProgressInput) {
  if (!UUID_PATTERN.test(input.workoutPlanId)) {
    return "El plan de entrenamiento no es válido.";
  }

  if (!input.exerciseId || input.exerciseId.length > 120) {
    return "El ejercicio indicado no es válido.";
  }

  if (!DATE_PATTERN.test(input.workoutDate)) {
    return "La fecha del entrenamiento no es válida.";
  }

  if (!Number.isInteger(input.cycleDay) || input.cycleDay < 1) {
    return "El día del ciclo no es válido.";
  }

  return null;
}

export async function updateWorkoutDayExerciseProgress(
  input: UpdateWorkoutDayProgressInput,
): Promise<WorkoutDayProgressActionResult> {
  const invalidMessage = getInvalidMessage(input);

  if (invalidMessage) {
    return { message: invalidMessage, status: "error" };
  }

  const today = getTodayDateKey();

  if (input.workoutDate !== today) {
    return {
      message: "Solo puedes marcar el entrenamiento del día actual.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      message: "Debes iniciar sesión para actualizar tu entrenamiento.",
      status: "error",
    };
  }

  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .select(
      "id, client_id, routine_id, routine_snapshot, status, start_date, end_date, template_snapshot",
    )
    .eq("id", input.workoutPlanId)
    .maybeSingle();

  if (planError || !plan || plan.client_id !== user.id) {
    return {
      message: "No se pudo validar tu entrenamiento actual.",
      status: "error",
    };
  }

  if (plan.status !== "active") {
    return {
      message: "Este entrenamiento no está activo.",
      status: "error",
    };
  }

  if (plan.start_date && plan.start_date > today) {
    return {
      message: "Este entrenamiento aún no inicia.",
      status: "error",
    };
  }

  if (plan.end_date && plan.end_date < today) {
    return {
      message:
        "Tu entrenamiento esta vencido. Consulta a tu profesional de entrenamiento para actualizarlo.",
      status: "error",
    };
  }

  const template = parseWorkoutTemplateSnapshot(plan.template_snapshot);
  const templateDay = template?.days.find(
    (day) => day.dayNumber === input.cycleDay,
  );
  const routineSnapshot = parseRoutineSnapshot(plan.routine_snapshot);
  const routine =
    templateDay?.routine ??
    routineSnapshot?.routine ??
    (plan.routine_id ? await getRoutineDetail(plan.routine_id) : null);

  if (!routine) {
    return {
      message: "No se pudo recuperar el entrenamiento de hoy.",
      status: "error",
    };
  }

  if (template && !templateDay) {
    return {
      message: "El día de entrenamiento indicado no existe en tu plantilla.",
      status: "error",
    };
  }

  if (!template && input.cycleDay !== 1) {
    return {
      message: "Esta asignación solo permite marcar el día actual.",
      status: "error",
    };
  }

  const validExerciseIds = routine.exercises.map((exercise) => exercise.id);

  if (!validExerciseIds.includes(input.exerciseId)) {
    return {
      message: "El ejercicio indicado no pertenece a tu entrenamiento de hoy.",
      status: "error",
    };
  }

  const { data: existingProgress, error: progressError } = await supabase
    .from("workout_day_progress")
    .select("id, completed_exercise_ids")
    .eq("client_id", user.id)
    .eq("workout_plan_id", input.workoutPlanId)
    .eq("workout_date", input.workoutDate)
    .eq("cycle_day", input.cycleDay)
    .maybeSingle();

  if (progressError) {
    return {
      message: "No se pudo cargar tu avance de hoy.",
      status: "error",
    };
  }

  const completedSet = new Set(
    (existingProgress?.completed_exercise_ids ?? []).filter((exerciseId) =>
      validExerciseIds.includes(exerciseId),
    ),
  );

  if (input.completed) {
    completedSet.add(input.exerciseId);
  } else {
    completedSet.delete(input.exerciseId);
  }

  const completedExerciseIds = validExerciseIds.filter((exerciseId) =>
    completedSet.has(exerciseId),
  );
  const completedAt =
    completedExerciseIds.length === validExerciseIds.length &&
    validExerciseIds.length > 0
      ? new Date().toISOString()
      : null;

  if (!existingProgress && !input.completed) {
    return {
      completedAt,
      completedExerciseIds,
      message: "Avance actualizado.",
      status: "success",
    };
  }

  const mutation = existingProgress
    ? supabase
        .from("workout_day_progress")
        .update({
          completed_at: completedAt,
          completed_exercise_ids: completedExerciseIds,
        })
        .eq("id", existingProgress.id)
    : supabase.from("workout_day_progress").insert({
        client_id: user.id,
        completed_at: completedAt,
        completed_exercise_ids: completedExerciseIds,
        cycle_day: input.cycleDay,
        workout_date: input.workoutDate,
        workout_plan_id: input.workoutPlanId,
      });

  const { error: mutationError } = await mutation;

  if (mutationError) {
    return {
      message: "No se pudo guardar tu avance. Inténtalo de nuevo.",
      status: "error",
    };
  }

  revalidatePath("/app/entrenamiento");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/progreso");

  return {
    completedAt,
    completedExerciseIds,
    message: completedAt
      ? "Entrenamiento de hoy completado."
      : "Avance actualizado.",
    status: "success",
  };
}

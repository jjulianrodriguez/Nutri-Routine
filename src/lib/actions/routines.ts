"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  routineAssignmentSchema,
  type RoutineAssignmentFormValues,
} from "@/lib/validations/routine-assignments";
import {
  routineFormSchema,
  type RoutineFormValues,
} from "@/lib/validations/routines";
import type { Json } from "@/types/database";

const TRAINING_PATH = "/app/entrenamiento";
const ROUTINES_PATH = `${TRAINING_PATH}/rutinas`;

export type RoutineActionResult =
  | {
      id: string;
      message: string;
      status: "success";
    }
  | {
      message: string;
      status: "error";
    };

async function getTrainingManagerContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      error: "Debes iniciar sesion para gestionar rutinas.",
      supabase,
      user: null,
    };
  }

  const [{ data: profile, error: profileError }, professionalResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("professional_profiles")
        .select("specialty")
        .eq("profile_id", user.id)
        .maybeSingle(),
    ]);

  if (profileError || professionalResult.error || !profile) {
    return {
      error: "No se pudo validar tu perfil profesional.",
      supabase,
      user,
    };
  }

  const specialty = professionalResult.data?.specialty ?? null;
  const isGeneralAdmin = profile.role === "admin" && specialty === null;
  const canManageTraining =
    (profile.role === "admin" || profile.role === "professional") &&
    (isGeneralAdmin || specialty === "training" || specialty === "both");

  return {
    error: canManageTraining
      ? null
      : "No tienes permisos para gestionar rutinas.",
    supabase,
    user,
  };
}

function getRoutineErrorMessage(code?: string) {
  if (code === "23505") {
    return "Un ejercicio esta repetido o tiene un orden duplicado.";
  }

  if (code === "23503") {
    return "Uno de los ejercicios ya no esta disponible.";
  }

  if (code === "42501") {
    return "No tienes permisos para gestionar rutinas.";
  }

  return "No se pudo guardar la rutina. Revisa los datos e intentalo de nuevo.";
}

export async function saveRoutine(
  routineId: string | null,
  values: RoutineFormValues,
): Promise<RoutineActionResult> {
  const parsed = routineFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      status: "error",
    };
  }

  if (routineId && !/^[0-9a-f-]{36}$/i.test(routineId)) {
    return {
      message: "La rutina indicada no es valida.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos para gestionar rutinas.",
      status: "error",
    };
  }

  const exercises = parsed.data.exercises.map((exercise) => ({
    durationMinutes: exercise.durationMinutes,
    exerciseId: exercise.exerciseId,
    notes: exercise.notes,
    repetitions: exercise.repetitions,
    restSeconds:
      exercise.restValue === ""
        ? ""
        : Number(exercise.restValue) *
          (exercise.restUnit === "minutes" ? 60 : 1),
    series: exercise.series,
  })) satisfies Json[];

  const { data, error } = await context.supabase.rpc("save_routine", {
    p_category: parsed.data.category,
    p_description: parsed.data.description,
    p_difficulty: parsed.data.difficulty,
    p_exercises: exercises,
    p_is_active: parsed.data.isActive,
    p_name: parsed.data.name,
    p_routine_id: routineId,
    p_target_audience: parsed.data.targetAudience,
  });

  if (error || !data) {
    return {
      message: getRoutineErrorMessage(error?.code),
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ROUTINES_PATH);
  revalidatePath(`${TRAINING_PATH}/rutinas/${data}`);

  return {
    id: data,
    message: routineId
      ? "Rutina actualizada correctamente."
      : "Rutina creada correctamente.",
    status: "success",
  };
}

export async function deleteRoutine(
  routineId: string,
): Promise<RoutineActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(routineId)) {
    return {
      message: "La rutina indicada no es valida.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos para gestionar rutinas.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("routines")
    .delete()
    .eq("id", routineId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    return {
      message:
        "No puedes eliminar esta rutina porque tiene asignaciones de clientes. Desactivala para conservar el historial.",
      status: "error",
    };
  }

  if (error || !data) {
    return {
      message: "No se pudo eliminar la rutina.",
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ROUTINES_PATH);

  return {
    id: data.id,
    message: "Rutina eliminada correctamente.",
    status: "success",
  };
}

export async function setRoutineActive(
  routineId: string,
  isActive: boolean,
): Promise<RoutineActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(routineId)) {
    return {
      message: "La rutina indicada no es valida.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos para gestionar rutinas.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("routines")
    .update({ is_active: isActive })
    .eq("id", routineId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo cambiar el estado de la rutina.",
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ROUTINES_PATH);
  revalidatePath(`${ROUTINES_PATH}/${routineId}`);

  return {
    id: data.id,
    message: isActive ? "Rutina activada." : "Rutina desactivada.",
    status: "success",
  };
}

export async function assignRoutineToClient(
  values: RoutineAssignmentFormValues,
): Promise<RoutineActionResult> {
  const parsed = routineAssignmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Revisa la asignacion.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos para asignar rutinas.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase.rpc(
    "assign_routine_to_client",
    {
      p_client_id: parsed.data.clientId,
      p_duration_weeks: Number(parsed.data.durationWeeks),
      p_routine_id: parsed.data.routineId,
      p_start_date: parsed.data.startDate,
    },
  );

  if (error || !data) {
    const message =
      error?.code === "42501"
        ? "Solo puedes asignar rutinas a clientes vinculados contigo."
        : error?.code === "23503"
          ? "El cliente no tiene un entrenador asignado."
          : error?.code === "P0002"
            ? "La rutina no existe o esta inactiva."
            : "No se pudo asignar la rutina.";

    return {
      message,
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ROUTINES_PATH);
  revalidatePath(`${ROUTINES_PATH}/${parsed.data.routineId}`);

  return {
    id: data,
    message: "Rutina asignada correctamente.",
    status: "success",
  };
}

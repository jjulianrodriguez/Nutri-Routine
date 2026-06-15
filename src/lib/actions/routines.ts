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
const ASSIGNMENTS_PATH = `${TRAINING_PATH}/asignaciones`;

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      error: "No se pudo validar tu perfil profesional.",
      supabase,
      user,
    };
  }

  if (profile.role === "admin") {
    return {
      error: null,
      supabase,
      user,
    };
  }

  const { data: professionalProfile, error: professionalProfileError } =
    await supabase
      .from("professional_profiles")
      .select("is_active, specialty")
      .eq("profile_id", user.id)
      .maybeSingle();
  const canManageTraining =
    !professionalProfileError &&
    profile.role === "professional" &&
    professionalProfile?.is_active === true &&
    (professionalProfile.specialty === "training" ||
      professionalProfile.specialty === "both");

  return {
    error: canManageTraining
      ? null
      : "No tienes permisos para gestionar rutinas.",
    supabase,
    user,
  };
}

function getRoutineErrorMessage(code?: string, message?: string) {
  if (
    code === "23505" &&
    message?.includes("routines_identifier_unique_idx")
  ) {
    return "Ese identificador ya esta usado por otra rutina.";
  }

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

function getRoutineAssignmentErrorMessage(code?: string, message?: string) {
  if (code === "42501") {
    return "Solo puedes asignar rutinas a clientes vinculados contigo.";
  }

  if (
    code === "23505" &&
    message?.includes("workout_plans_one_active_per_client_idx")
  ) {
    return "El cliente ya tiene una rutina asignada. Actualiza la pagina y confirma el reemplazo.";
  }

  if (code === "23503") {
    return "El cliente no tiene un entrenador asignado.";
  }

  if (code === "P0002") {
    return "La rutina no existe o esta inactiva.";
  }

  return "No se pudo asignar la rutina.";
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
    p_identifier: parsed.data.identifier,
    p_is_active: parsed.data.isActive,
    p_name: parsed.data.name,
    p_routine_id: routineId,
    p_target_audience: parsed.data.targetAudience,
  });

  if (error || !data) {
    return {
      message: getRoutineErrorMessage(error?.code, error?.message),
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

  if (error?.code === "42501") {
    return {
      message: "No tienes permisos para eliminar esta rutina.",
      status: "error",
    };
  }

  if (error || !data) {
    return {
      message:
        error?.code === "23503"
          ? "No se pudo eliminar la rutina por una relacion de datos inesperada."
          : "No se pudo eliminar la rutina. Intentalo de nuevo.",
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ROUTINES_PATH);
  revalidatePath(ASSIGNMENTS_PATH);

  return {
    id: data.id,
    message:
      "Rutina eliminada correctamente. Sus asignaciones quedaron archivadas.",
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
    return {
      message: getRoutineAssignmentErrorMessage(
        error?.code,
        error?.message,
      ),
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ROUTINES_PATH);
  revalidatePath(ASSIGNMENTS_PATH);
  revalidatePath(`${ROUTINES_PATH}/${parsed.data.routineId}`);

  return {
    id: data,
    message: "Rutina asignada correctamente.",
    status: "success",
  };
}

export async function unassignRoutineFromClient(
  assignmentId: string,
): Promise<RoutineActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(assignmentId)) {
    return {
      message: "La asignacion indicada no es valida.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos para desasignar planes.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase
    .from("workout_plans")
    .update({ status: "archived" })
    .eq("id", assignmentId)
    .eq("status", "active")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message:
        error?.code === "42501"
          ? "Solo puedes desasignar planes de clientes vinculados contigo."
          : "No se pudo desasignar el plan.",
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(ASSIGNMENTS_PATH);

  return {
    id: data.id,
    message: "Plan desasignado. La asignación se conservó en el historial.",
    status: "success",
  };
}

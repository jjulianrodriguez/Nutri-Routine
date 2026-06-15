"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  workoutTemplateAssignmentSchema,
  workoutTemplateFormSchema,
  type WorkoutTemplateAssignmentFormValues,
  type WorkoutTemplateFormValues,
} from "@/lib/validations/workout-templates";
import type { Json } from "@/types/database";

const TRAINING_PATH = "/app/entrenamiento";
const TEMPLATES_PATH = `${TRAINING_PATH}/plantillas`;
const ASSIGNMENTS_PATH = `${TRAINING_PATH}/asignaciones`;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WorkoutTemplateActionResult =
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
      error: "Debes iniciar sesión para gestionar plantillas.",
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
    return { error: null, supabase, user };
  }

  const { data: professionalProfile, error } = await supabase
    .from("professional_profiles")
    .select("is_active, specialty")
    .eq("profile_id", user.id)
    .maybeSingle();
  const canManageTraining =
    !error &&
    profile.role === "professional" &&
    professionalProfile?.is_active === true &&
    (professionalProfile.specialty === "training" ||
      professionalProfile.specialty === "both");

  return {
    error: canManageTraining
      ? null
      : "No tienes permisos para gestionar plantillas.",
    supabase,
    user,
  };
}

function getSaveError(code?: string) {
  if (code === "42501") {
    return "No tienes permisos para gestionar plantillas.";
  }

  if (code === "23503") {
    return "Uno de los entrenamientos ya no está disponible.";
  }

  if (code === "23505") {
    return "Los días de la plantilla tienen una configuración duplicada.";
  }

  if (code === "P0002") {
    return "La plantilla no existe o ya no está disponible.";
  }

  return "No se pudo guardar la plantilla. Revisa los datos e inténtalo de nuevo.";
}

export async function saveWorkoutTemplate(
  templateId: string | null,
  values: WorkoutTemplateFormValues,
): Promise<WorkoutTemplateActionResult> {
  const parsed = workoutTemplateFormSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      status: "error",
    };
  }

  if (templateId && !UUID_PATTERN.test(templateId)) {
    return {
      message: "La plantilla indicada no es válida.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase.rpc(
    "save_workout_template",
    {
      p_cycle_days: Number(parsed.data.cycleDays),
      p_days: parsed.data.days satisfies Json[],
      p_description: parsed.data.description,
      p_is_active: parsed.data.isActive,
      p_name: parsed.data.name,
      p_template_id: templateId,
    },
  );

  if (error || !data) {
    return {
      message: getSaveError(error?.code),
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(TEMPLATES_PATH);
  revalidatePath(`${TEMPLATES_PATH}/${data}`);
  revalidatePath(ASSIGNMENTS_PATH);

  return {
    id: data,
    message: templateId
      ? "Plantilla actualizada correctamente."
      : "Plantilla creada correctamente.",
    status: "success",
  };
}

export async function setWorkoutTemplateActive(
  templateId: string,
  isActive: boolean,
): Promise<WorkoutTemplateActionResult> {
  if (!UUID_PATTERN.test(templateId)) {
    return { message: "La plantilla indicada no es válida.", status: "error" };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return { message: context.error ?? "No tienes permisos.", status: "error" };
  }

  const { data, error } = await context.supabase
    .from("workout_templates")
    .update({ is_active: isActive })
    .eq("id", templateId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo cambiar el estado de la plantilla.",
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(TEMPLATES_PATH);
  revalidatePath(`${TEMPLATES_PATH}/${templateId}`);
  revalidatePath(ASSIGNMENTS_PATH);

  return {
    id: data.id,
    message: isActive ? "Plantilla activada." : "Plantilla desactivada.",
    status: "success",
  };
}

export async function deleteWorkoutTemplate(
  templateId: string,
): Promise<WorkoutTemplateActionResult> {
  if (!UUID_PATTERN.test(templateId)) {
    return { message: "La plantilla indicada no es válida.", status: "error" };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return { message: context.error ?? "No tienes permisos.", status: "error" };
  }

  const { data, error } = await context.supabase
    .from("workout_templates")
    .delete()
    .eq("id", templateId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      message: "No se pudo eliminar la plantilla.",
      status: "error",
    };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(TEMPLATES_PATH);
  revalidatePath(ASSIGNMENTS_PATH);

  return {
    id: data.id,
    message:
      "Plantilla eliminada. Las asignaciones conservaron su snapshot en el historial.",
    status: "success",
  };
}

export async function assignWorkoutTemplateToClient(
  values: WorkoutTemplateAssignmentFormValues,
): Promise<WorkoutTemplateActionResult> {
  const parsed = workoutTemplateAssignmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      message: parsed.error.issues[0]?.message ?? "Revisa la asignación.",
      status: "error",
    };
  }

  const context = await getTrainingManagerContext();

  if (context.error || !context.user) {
    return {
      message: context.error ?? "No tienes permisos para asignar plantillas.",
      status: "error",
    };
  }

  const { data, error } = await context.supabase.rpc(
    "assign_workout_template_to_client",
    {
      p_client_id: parsed.data.clientId,
      p_duration_weeks: Number(parsed.data.durationWeeks),
      p_start_date: parsed.data.startDate,
      p_template_id: parsed.data.templateId,
    },
  );

  if (error || !data) {
    let message = "No se pudo asignar la plantilla.";

    if (error?.code === "42501") {
      message = "Solo puedes asignar plantillas a clientes vinculados contigo.";
    } else if (error?.code === "23503") {
      message =
        "La plantilla está incompleta o contiene entrenamientos inactivos.";
    } else if (error?.code === "P0002") {
      message = "La plantilla no existe o está inactiva.";
    }

    return { message, status: "error" };
  }

  revalidatePath(TRAINING_PATH);
  revalidatePath(TEMPLATES_PATH);
  revalidatePath(ASSIGNMENTS_PATH);

  return {
    id: data,
    message: "Plantilla asignada correctamente.",
    status: "success",
  };
}

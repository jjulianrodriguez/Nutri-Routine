"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
  getCurrentHabitWeek,
  isAssignmentApplicableOnDate,
  isHabitDateMarkable,
} from "@/lib/habits/utils";
import {
  createNutritionNotification,
  createNutritionNotifications,
  getAssignedHabitNotificationRecipients,
} from "@/lib/actions/nutrition-notifications";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import {
  habitAssignmentSchema,
  habitProgressSchema,
  habitSchema,
  type HabitAssignmentValues,
  type HabitProgressValues,
  type HabitValues,
} from "@/lib/validations/habits";

type HabitActionResult =
  | {
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: Record<string, string>;
      message: string;
      status: "error";
    };

const NUTRITION_PATH = "/app/nutricion";
const NUTRITION_HABITS_PATH = "/app/nutricion/habitos";
const DASHBOARD_PATH = "/app/dashboard";

function getFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0] ?? "Campo invalido.",
    ]),
  );
}

function logQueryError(label: string, error: unknown) {
  const e = error as Record<string, unknown> | null;
  const message = typeof e?.message === "string" ? e.message : "Error desconocido";
  
  console.error(`${label}: ${message}`, {
    code: e?.code,
    details: e?.details,
    hint: e?.hint,
    message: e?.message,
    name: e?.name,
  });
}

async function logActionFailure(userId: string, message: string) {
  if (!hasSupabaseAdminConfig()) return;
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      actor_id: userId,
      destination_path: "/app/nutricion",
      event_type: "nutrition_action_failed",
      message: message,
      recipient_id: userId,
    });
  } catch (err) {
    console.error("No se pudo registrar la notificacion de fallo:", err);
  }
}

function normalizeDescription(value?: string | null) {
  const description = value?.trim() ?? "";
  return description ? description : null;
}

function normalizeDaysOfWeek(value: number[]) {
  return Array.from(new Set(value)).sort((a, b) => a - b);
}

function revalidateHabits(clientId?: string) {
  revalidatePath(NUTRITION_PATH);
  revalidatePath(DASHBOARD_PATH);
  revalidatePath("/app/progreso");

  if (clientId) {
    revalidatePath(`/app/clientes/${clientId}`);
  }
}

async function notifyAssignedHabitClients({
  access,
  eventType,
  habitId,
  message,
}: {
  access: CurrentUserAccess;
  eventType: string;
  habitId: string;
  message: string;
}) {
  const recipientIds = await getAssignedHabitNotificationRecipients({
    actorId: access.userId,
    habitId,
    isAdmin: access.isAdmin,
  });

  await createNutritionNotifications({
    actorId: access.userId,
    destinationPath: NUTRITION_HABITS_PATH,
    eventType,
    message,
    metadata: { habitId },
    recipientIds,
  });
}

async function notifyHabitAssignmentClient({
  access,
  assignmentId,
  clientId,
  eventType,
  habitId,
  message,
}: {
  access: CurrentUserAccess;
  assignmentId: string;
  clientId: string;
  eventType: string;
  habitId: string;
  message: string;
}) {
  await createNutritionNotification({
    actorId: access.userId,
    destinationPath: NUTRITION_HABITS_PATH,
    eventType,
    message,
    metadata: { assignmentId, habitId },
    recipientId: clientId,
  });
}

async function requireNutritionManager() {
  const access = await getCurrentUserAccess();

  if (!access) {
    return {
      access: null,
      error: "Debes iniciar sesion para gestionar habitos.",
    };
  }

  if (!access.canManageNutrition) {
    return {
      access: null,
      error: "Tu cuenta no tiene permisos para gestionar habitos de nutricion.",
    };
  }

  return { access, error: null };
}

async function validateClientForNutritionManager(clientId: string) {
  const actor = await requireNutritionManager();

  if (actor.error || !actor.access) {
    return actor;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_profiles")
    .select("profile_id, assigned_nutritionist_id")
    .eq("profile_id", clientId)
    .maybeSingle();

  if (error || !data) {
    return {
      access: null,
      error: "La clienta seleccionada no existe.",
    };
  }

  if (actor.access.isAdmin) {
    return actor;
  }

  if (!data.assigned_nutritionist_id) {
    return {
      access: null,
      error: "La clienta seleccionada no tiene nutricion activa.",
    };
  }

  if (data.assigned_nutritionist_id !== actor.access.userId) {
    return {
      access: null,
      error: "Solo puedes gestionar habitos de tus clientas asignadas.",
    };
  }

  return actor;
}

export async function saveHabit(values: HabitValues): Promise<HabitActionResult> {
  const parsed = habitSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos del habito.",
      status: "error",
    };
  }

  const actor = await requireNutritionManager();

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();
  const payload = {
    active: parsed.data.active ?? true,
    description: normalizeDescription(parsed.data.description),
    title: parsed.data.title.trim(),
  };

  const { data: previousHabit, error: previousHabitError } = parsed.data.habitId
    ? await supabase
        .from("habits")
        .select("id, active")
        .eq("id", parsed.data.habitId)
        .maybeSingle()
    : { data: null, error: null };

  if (previousHabitError) {
    logQueryError("Error revisando habito actual", previousHabitError);
  }

  const mutation = parsed.data.habitId
    ? supabase
        .from("habits")
        .update(payload)
        .eq("id", parsed.data.habitId)
    : supabase.from("habits").insert({
        ...payload,
        created_by: actor.access.userId,
      });
  const { error } = await mutation;

  if (error) {
    logQueryError("Error en saveHabit", error);
    await logActionFailure(actor.access.userId, "Fallo al guardar el habito de nutricion.");
    return {
      message: "No se pudo guardar el habito. Verifica tus permisos.",
      status: "error",
    };
  }

  revalidateHabits();

  if (parsed.data.habitId) {
    const wasDeactivated = previousHabit?.active === true && !payload.active;

    await notifyAssignedHabitClients({
      access: actor.access,
      eventType: wasDeactivated
        ? "nutrition_habit_removed"
        : "nutrition_habit_updated",
      habitId: parsed.data.habitId,
      message: wasDeactivated
        ? "Un habito de nutricion asignado fue desactivado de tu plan."
        : "Se actualizo un habito de nutricion que tienes asignado.",
    });
  }

  return {
    message: parsed.data.habitId
      ? "Habito actualizado correctamente."
      : "Habito creado correctamente.",
    status: "success",
  };
}

export async function deactivateHabit(habitId: string): Promise<HabitActionResult> {
  const parsed = habitSchema
    .pick({ habitId: true, title: true })
    .safeParse({ habitId, title: "Temporal" });

  if (!parsed.success || !habitId) {
    return {
      message: "El habito no es valido.",
      status: "error",
    };
  }

  const actor = await requireNutritionManager();

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({ active: false })
    .eq("id", habitId);

  if (error) {
    logQueryError("Error en deactivateHabit", error);
    return {
      message: "No se pudo desactivar el habito.",
      status: "error",
    };
  }

  await notifyAssignedHabitClients({
    access: actor.access,
    eventType: "nutrition_habit_removed",
    habitId,
    message: "Un habito de nutricion asignado fue desactivado de tu plan.",
  });

  revalidateHabits();

  return {
    message: "Habito desactivado correctamente.",
    status: "success",
  };
}

export async function saveHabitAssignment(
  values: HabitAssignmentValues,
): Promise<HabitActionResult> {
  const parsed = habitAssignmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos de la asignacion.",
      status: "error",
    };
  }

  const actor = await validateClientForNutritionManager(parsed.data.clientId);

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();
  const daysOfWeek = normalizeDaysOfWeek(parsed.data.daysOfWeek);
  const payload = {
    active: parsed.data.active ?? true,
    days_of_week: daysOfWeek,
    end_date: parsed.data.endDate || null,
    habit_id: parsed.data.habitId,
    start_date: parsed.data.startDate,
  };

  let assignmentId = parsed.data.assignmentId ?? null;

  if (!assignmentId) {
    const { data: existing, error: existingError } = await supabase
      .from("habit_assignments")
      .select("id")
      .eq("client_id", parsed.data.clientId)
      .eq("habit_id", parsed.data.habitId)
      .eq("active", true)
      .maybeSingle();

    if (existingError) {
      return {
        message: "No se pudo revisar la asignacion actual.",
        status: "error",
      };
    }

    assignmentId = existing?.id ?? null;
  }

  const isNewAssignment = !assignmentId;
  const mutation = assignmentId
    ? supabase
        .from("habit_assignments")
        .update(payload)
        .eq("id", assignmentId)
        .select("id")
        .maybeSingle()
    : supabase.from("habit_assignments").insert({
        ...payload,
        assigned_by: actor.access.userId,
        client_id: parsed.data.clientId,
      }).select("id").single();
  const { data, error } = await mutation;

  if (error || !data) {
    logQueryError("Error en saveHabitAssignment", error);
    await logActionFailure(actor.access.userId, "Fallo al asignar el habito de nutricion.");
    return {
      message: "No se pudo asignar el habito. Verifica permisos y duplicados.",
      status: "error",
    };
  }

  await notifyHabitAssignmentClient({
    access: actor.access,
    assignmentId: data.id,
    clientId: parsed.data.clientId,
    eventType: isNewAssignment
      ? "nutrition_habit_assigned"
      : "nutrition_habit_updated",
    habitId: parsed.data.habitId,
    message: isNewAssignment
      ? "Se te asigno un nuevo habito de nutricion."
      : "Se actualizo un habito de nutricion que tienes asignado.",
  });

  revalidateHabits(parsed.data.clientId);

  return {
    message: isNewAssignment
      ? "Habito asignado correctamente."
      : "Asignacion actualizada correctamente.",
    status: "success",
  };
}

export async function deactivateHabitAssignment(
  assignmentId: string,
  clientId: string,
): Promise<HabitActionResult> {
  const actor = await validateClientForNutritionManager(clientId);

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habit_assignments")
    .update({
      active: false,
      end_date: getCurrentHabitWeek().today,
    })
    .eq("id", assignmentId)
    .eq("client_id", clientId)
    .select("id, habit_id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error en deactivateHabitAssignment", error);
    return {
      message: "No se pudo desactivar la asignacion.",
      status: "error",
    };
  }

  await notifyHabitAssignmentClient({
    access: actor.access,
    assignmentId: data.id,
    clientId,
    eventType: "nutrition_habit_removed",
    habitId: data.habit_id,
    message: "Un habito de nutricion fue desactivado de tu plan.",
  });

  revalidateHabits(clientId);

  return {
    message: "Asignacion desactivada correctamente.",
    status: "success",
  };
}

export async function updateHabitProgress(
  values: HabitProgressValues,
): Promise<HabitActionResult> {
  const parsed = habitProgressSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "No se pudo validar la marca del habito.",
      status: "error",
    };
  }

  const access = await getCurrentUserAccess();

  if (!access || !access.isClient) {
    return {
      message: "Solo la clienta puede marcar su propio cumplimiento.",
      status: "error",
    };
  }

  const week = getCurrentHabitWeek();

  if (
    parsed.data.date > week.weekEnd ||
    !isHabitDateMarkable(parsed.data.date, week.today, week.weekStart)
  ) {
    return {
      message: "Solo puedes marcar hoy o dias anteriores de esta semana.",
      status: "error",
    };
  }

  const supabase = await createClient();
  const { data: assignment, error: assignmentError } = await supabase
    .from("habit_assignments")
    .select("id, client_id, active, days_of_week, start_date, end_date")
    .eq("id", parsed.data.assignmentId)
    .maybeSingle();

  if (assignmentError || !assignment || assignment.client_id !== access.userId) {
    return {
      message: "No se pudo validar este habito en tu cuenta.",
      status: "error",
    };
  }

  const normalizedAssignment = {
    active: assignment.active,
    daysOfWeek: normalizeDaysOfWeek(assignment.days_of_week),
    endDate: assignment.end_date,
    id: assignment.id,
    startDate: assignment.start_date,
  };

  if (!isAssignmentApplicableOnDate(normalizedAssignment, parsed.data.date)) {
    return {
      message: "Este habito no aplica para el dia seleccionado.",
      status: "error",
    };
  }

  const { data: existing, error: existingError } = await supabase
    .from("habit_progress")
    .select("id")
    .eq("habit_assignment_id", parsed.data.assignmentId)
    .eq("client_id", access.userId)
    .eq("date", parsed.data.date)
    .maybeSingle();

  if (existingError) {
    return {
      message: "No se pudo revisar tu marca actual.",
      status: "error",
    };
  }

  if (!existing && !parsed.data.completed) {
    return {
      message: "Habito actualizado.",
      status: "success",
    };
  }

  const progressPayload = {
    completed: parsed.data.completed,
    completed_at: parsed.data.completed ? new Date().toISOString() : null,
  };
  const mutation = existing
    ? supabase
        .from("habit_progress")
        .update(progressPayload)
        .eq("id", existing.id)
    : supabase.from("habit_progress").insert({
        ...progressPayload,
        client_id: access.userId,
        date: parsed.data.date,
        habit_assignment_id: parsed.data.assignmentId,
      });
  const { error } = await mutation;

  if (error) {
    logQueryError("Error en updateHabitProgress", error);
    return {
      message: "No se pudo guardar tu avance. Intentalo de nuevo.",
      status: "error",
    };
  }

  revalidateHabits(access.userId);

  return {
    message: parsed.data.completed
      ? "Habito marcado como completado."
      : "Habito desmarcado.",
    status: "success",
  };
}

export async function activateHabit(habitId: string): Promise<HabitActionResult> {
  if (!habitId) {
    return {
      message: "El habito no es valido.",
      status: "error",
    };
  }

  const actor = await requireNutritionManager();

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({ active: true })
    .eq("id", habitId);

  if (error) {
    logQueryError("Error en activateHabit", error);
    return {
      message: "No se pudo activar el habito.",
      status: "error",
    };
  }

  revalidateHabits();

  return {
    message: "Habito activado correctamente.",
    status: "success",
  };
}

export async function deleteHabit(habitId: string): Promise<HabitActionResult> {
  if (!habitId) {
    return {
      message: "El habito no es valido.",
      status: "error",
    };
  }

  const actor = await requireNutritionManager();

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();

  // First check if it has assignments
  const { count, error: countError } = await supabase
    .from("habit_assignments")
    .select("id", { count: "exact", head: true })
    .eq("habit_id", habitId);

  if (countError) {
    logQueryError("Error contando asignaciones en deleteHabit", countError);
    return {
      message: "No se pudo verificar el historial del habito.",
      status: "error",
    };
  }

  if ((count ?? 0) > 0) {
    return {
      message: "Este habito tiene asignaciones activas o pasadas. Desactivalo en su lugar para conservar el historial.",
      status: "error",
    };
  }

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId);

  if (error) {
    logQueryError("Error en deleteHabit", error);
    return {
      message: "No se pudo eliminar el habito.",
      status: "error",
    };
  }

  revalidateHabits();

  return {
    message: "Habito eliminado correctamente.",
    status: "success",
  };
}

export async function reactivateHabitAssignment(
  assignmentId: string,
  clientId: string,
): Promise<HabitActionResult> {
  const actor = await validateClientForNutritionManager(clientId);

  if (actor.error || !actor.access) {
    return { message: actor.error, status: "error" };
  }

  const supabase = await createClient();

  // Get the assignment details to check habit_id
  const { data: assignment, error: assignmentError } = await supabase
    .from("habit_assignments")
    .select("id, habit_id, active")
    .eq("id", assignmentId)
    .eq("client_id", clientId)
    .maybeSingle();

  if (assignmentError || !assignment) {
    return {
      message: "La asignacion no existe o no pertenece a la clienta.",
      status: "error",
    };
  }

  if (assignment.active) {
    return {
      message: "La asignacion ya esta activa.",
      status: "error",
    };
  }

  // Check if parent habit is active
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id, active")
    .eq("id", assignment.habit_id)
    .maybeSingle();

  if (habitError || !habit) {
    return {
      message: "El habito asignado no existe.",
      status: "error",
    };
  }

  if (!habit.active) {
    return {
      message: "El habito debe estar activo para reactivar la asignacion.",
      status: "error",
    };
  }

  // Check if there is already an active assignment for this habit and client
  const { data: existingActive, error: existingError } = await supabase
    .from("habit_assignments")
    .select("id")
    .eq("client_id", clientId)
    .eq("habit_id", assignment.habit_id)
    .eq("active", true)
    .maybeSingle();

  if (existingError) {
    return {
      message: "No se pudo verificar si ya existe una asignacion activa.",
      status: "error",
    };
  }

  if (existingActive) {
    return {
      message: "Ya existe una asignacion activa de este habito para esta clienta.",
      status: "error",
    };
  }

  const { data, error } = await supabase
    .from("habit_assignments")
    .update({
      active: true,
      end_date: null,
    })
    .eq("id", assignmentId)
    .eq("client_id", clientId)
    .select("id, habit_id")
    .maybeSingle();

  if (error || !data) {
    logQueryError("Error en reactivateHabitAssignment", error);
    return {
      message: "No se pudo reactivar la asignacion.",
      status: "error",
    };
  }

  await notifyHabitAssignmentClient({
    access: actor.access,
    assignmentId: data.id,
    clientId,
    eventType: "nutrition_habit_assigned",
    habitId: data.habit_id,
    message: "Se te asigno un nuevo habito de nutricion.",
  });

  revalidateHabits(clientId);

  return {
    message: "Asignacion reactivada correctamente.",
    status: "success",
  };
}

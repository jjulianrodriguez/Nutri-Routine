"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import {
  getCurrentHabitWeek,
  isAssignmentApplicableOnDate,
  isHabitDateMarkable,
} from "@/lib/habits/utils";
import { createClient } from "@/lib/supabase/server";
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

  if (error || !data?.assigned_nutritionist_id) {
    return {
      access: null,
      error: "La clienta seleccionada no tiene nutricion activa.",
    };
  }

  if (!actor.access.isAdmin && data.assigned_nutritionist_id !== actor.access.userId) {
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
    return {
      message: "No se pudo guardar el habito. Verifica tus permisos.",
      status: "error",
    };
  }

  revalidateHabits();

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
    return {
      message: "No se pudo desactivar el habito.",
      status: "error",
    };
  }

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

  const mutation = assignmentId
    ? supabase.from("habit_assignments").update(payload).eq("id", assignmentId)
    : supabase.from("habit_assignments").insert({
        ...payload,
        assigned_by: actor.access.userId,
        client_id: parsed.data.clientId,
      });
  const { error } = await mutation;

  if (error) {
    return {
      message: "No se pudo asignar el habito. Verifica permisos y duplicados.",
      status: "error",
    };
  }

  revalidateHabits(parsed.data.clientId);

  return {
    message: assignmentId
      ? "Asignacion actualizada correctamente."
      : "Habito asignado correctamente.",
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
  const { error } = await supabase
    .from("habit_assignments")
    .update({
      active: false,
      end_date: getCurrentHabitWeek().today,
    })
    .eq("id", assignmentId)
    .eq("client_id", clientId);

  if (error) {
    return {
      message: "No se pudo desactivar la asignacion.",
      status: "error",
    };
  }

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

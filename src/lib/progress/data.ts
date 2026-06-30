import "server-only";

import { listClientActivationData } from "@/lib/actions/client-activation";
import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { getClientAdministrativeProfile } from "@/lib/clients/profile-data";
import { getNutritionHabitTrackerData } from "@/lib/habits/data";
import {
  getCurrentHabitWeek,
  isAssignmentInDate,
  parseDateKey,
  toDateKey,
  type NutritionHabitTrackerData,
} from "@/lib/habits/utils";
import { getClientTrainingOverview } from "@/lib/routines/data";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import type { ClientTrainingOverview } from "@/types/routine";

export type ProgressTab = "resumen" | "nutricion" | "entrenamiento" | "medidas";

export type ProgressClientOption = {
  assignedNutritionistId: string | null;
  assignedTrainerId: string | null;
  fullName: string;
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  id: string;
};

export type ProgressPermissions = {
  canManageNutritionForClient: boolean;
  canManageTrainingForClient: boolean;
  canViewMeasurements: boolean;
  canViewNutrition: boolean;
  canViewTraining: boolean;
};

export type ProgressBlock<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

export type NutritionPlanSummary = {
  createdAt: string;
  description: string | null;
  id: string;
  source: "document" | "diet_plan";
  status: string;
  title: string;
};

export type HabitWeekHistoryItem = {
  completed: number;
  end: string;
  percentage: number;
  start: string;
  total: number;
};

export type NutritionProgressSummary = {
  habitHistory: HabitWeekHistoryItem[];
  habits: NutritionHabitTrackerData;
  plan: NutritionPlanSummary | null;
};

export type ProgressEntrySummary = Pick<
  Tables<"progress_entries">,
  "area" | "id" | "metric_type" | "metric_unit" | "metric_value" | "note" | "recorded_at"
>;

export type PhysicalProfileSummary = {
  bodyFatPercentage: number | null;
  bodyMeasurements: string | null;
  heightCm: number | null;
  updatedAt: string | null;
  weightKg: number | null;
};

export type MeasurementsProgressSummary = {
  entries: ProgressEntrySummary[];
  profile: PhysicalProfileSummary;
};

export type AppointmentSummary = {
  area: "general" | "nutrition" | "training";
  id: string;
  startsAt: string;
  status: string;
  title: string;
};

export type ProgressPageData = {
  appointments: ProgressBlock<AppointmentSummary[]>;
  clientOptions: ProgressClientOption[];
  invalidClientSelection: boolean;
  measurements: ProgressBlock<MeasurementsProgressSummary>;
  nutrition: ProgressBlock<NutritionProgressSummary>;
  permissions: ProgressPermissions;
  selectedClient: ProgressClientOption | null;
  training: ProgressBlock<ClientTrainingOverview>;
};

const EMPTY_PERMISSIONS: ProgressPermissions = {
  canManageNutritionForClient: false,
  canManageTrainingForClient: false,
  canViewMeasurements: false,
  canViewNutrition: false,
  canViewTraining: false,
};

function emptyBlock<T>(error: string): ProgressBlock<T> {
  return { data: null, error };
}

async function toBlock<T>(
  callback: () => Promise<T>,
  fallbackMessage: string,
): Promise<ProgressBlock<T>> {
  try {
    return { data: await callback(), error: null };
  } catch {
    return { data: null, error: fallbackMessage };
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function normalizeDaysOfWeek(value: number[] | null) {
  const days = Array.from(
    new Set((value ?? []).filter((day) => day >= 1 && day <= 7)),
  ).sort((left, right) => left - right);

  return days.length > 0 ? days : [1, 2, 3, 4, 5, 6, 7];
}

function getWeekRanges(count: number) {
  const currentWeek = getCurrentHabitWeek();
  const currentMonday = parseDateKey(currentWeek.weekStart);

  return Array.from({ length: count }, (_, index) => {
    const start = addDays(currentMonday, -7 * (count - index - 1));
    const weekStart = toDateKey(start);
    const weekEnd = toDateKey(addDays(start, 6));

    return { end: weekEnd, start: weekStart };
  });
}

function eachDateInRange(start: string, end: string) {
  const dates: string[] = [];
  let cursor = parseDateKey(start);
  const finalDate = parseDateKey(end);

  while (cursor <= finalDate) {
    dates.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function isClientVisibleToProgress(
  client: ProgressClientOption,
  access: CurrentUserAccess,
) {
  if (access.isAdmin) {
    return true;
  }

  return (
    client.assignedNutritionistId === access.userId ||
    client.assignedTrainerId === access.userId
  );
}

function getClientPermissions(
  client: ProgressClientOption | null,
  access: CurrentUserAccess,
): ProgressPermissions {
  if (!client) {
    return EMPTY_PERMISSIONS;
  }

  if (access.isClient) {
    return {
      canManageNutritionForClient: false,
      canManageTrainingForClient: false,
      canViewMeasurements: true,
      canViewNutrition: access.hasNutritionService,
      canViewTraining: access.hasTrainingService,
    };
  }

  const canViewNutrition =
    access.isAdmin || client.assignedNutritionistId === access.userId;
  const canViewTraining =
    access.isAdmin || client.assignedTrainerId === access.userId;

  return {
    canManageNutritionForClient:
      access.canManageNutrition && canViewNutrition && client.hasNutritionService,
    canManageTrainingForClient:
      access.canManageTraining && canViewTraining && client.hasTrainingService,
    canViewMeasurements: canViewNutrition || canViewTraining,
    canViewNutrition,
    canViewTraining,
  };
}

function getVisibleAreas(
  access: CurrentUserAccess,
  permissions: ProgressPermissions,
): Array<"general" | "nutrition" | "training"> | null {
  if (access.isAdmin || access.isClient) {
    return null;
  }

  const areas: Array<"general" | "nutrition" | "training"> = ["general"];

  if (permissions.canViewNutrition) {
    areas.push("nutrition");
  }

  if (permissions.canViewTraining) {
    areas.push("training");
  }

  return areas;
}

async function loadNutritionPlan(clientId: string) {
  const supabase = await createClient();
  const [documentResult, planResult] = await Promise.all([
    supabase
      .from("nutrition_documents")
      .select("id, title, description, status, created_at")
      .eq("client_id", clientId)
      .eq("document_type", "meal_plan")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("diet_plans")
      .select("id, title, description, status, created_at")
      .eq("client_id", clientId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (documentResult.error || planResult.error) {
    throw new Error("No se pudo cargar el plan alimenticio.");
  }

  const document = documentResult.data?.[0];

  if (document) {
    return {
      createdAt: document.created_at,
      description: document.description,
      id: document.id,
      source: "document" as const,
      status: document.status,
      title: document.title,
    };
  }

  const plan = planResult.data?.[0];

  if (!plan) {
    return null;
  }

  return {
    createdAt: plan.created_at,
    description: plan.description,
    id: plan.id,
    source: "diet_plan" as const,
    status: plan.status,
    title: plan.title,
  };
}

async function loadHabitHistory(clientId: string): Promise<HabitWeekHistoryItem[]> {
  const supabase = await createClient();
  const ranges = getWeekRanges(8);
  const first = ranges[0];
  const last = ranges[ranges.length - 1];

  const [assignmentsResult, progressResult] = await Promise.all([
    supabase
      .from("habit_assignments")
      .select("id, active, days_of_week, start_date, end_date")
      .eq("client_id", clientId)
      .lte("start_date", last.end)
      .or(`end_date.is.null,end_date.gte.${first.start}`),
    supabase
      .from("habit_progress")
      .select("habit_assignment_id, date, completed")
      .eq("client_id", clientId)
      .gte("date", first.start)
      .lte("date", last.end),
  ]);

  if (assignmentsResult.error || progressResult.error) {
    throw new Error("No se pudo cargar el historial de habitos.");
  }

  const completedByAssignmentAndDate = new Set(
    (progressResult.data ?? [])
      .filter((progress) => progress.completed)
      .map((progress) => `${progress.habit_assignment_id}:${progress.date}`),
  );

  return ranges.map((range) => {
    let total = 0;
    let completed = 0;

    for (const date of eachDateInRange(range.start, range.end)) {
      const isoDay = parseDateKey(date).getDay() || 7;

      for (const assignment of assignmentsResult.data ?? []) {
        const daysOfWeek = normalizeDaysOfWeek(assignment.days_of_week);

        if (
          assignment.active &&
          daysOfWeek.includes(isoDay) &&
          isAssignmentInDate(assignment, date)
        ) {
          total += 1;

          if (completedByAssignmentAndDate.has(`${assignment.id}:${date}`)) {
            completed += 1;
          }
        }
      }
    }

    return {
      completed,
      end: range.end,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      start: range.start,
      total,
    };
  });
}

async function loadNutritionProgress(
  access: CurrentUserAccess,
  clientId: string,
): Promise<NutritionProgressSummary> {
  const [habits, plan, habitHistory] = await Promise.all([
    getNutritionHabitTrackerData(access, clientId),
    loadNutritionPlan(clientId),
    loadHabitHistory(clientId),
  ]);

  return { habitHistory, habits, plan };
}

async function loadAppointments(
  clientId: string,
  access: CurrentUserAccess,
  permissions: ProgressPermissions,
): Promise<AppointmentSummary[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  let query = supabase
    .from("appointments")
    .select("id, title, area, starts_at, status")
    .eq("client_id", clientId)
    .eq("status", "scheduled")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true })
    .limit(3);
  const visibleAreas = getVisibleAreas(access, permissions);

  if (visibleAreas) {
    query = query.in("area", visibleAreas);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("No se pudo cargar la proxima consulta.");
  }

  return (data ?? []).map((appointment) => ({
    area: appointment.area,
    id: appointment.id,
    startsAt: appointment.starts_at,
    status: appointment.status,
    title: appointment.title,
  }));
}

async function loadOwnPhysicalProfile(clientId: string): Promise<PhysicalProfileSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_personal_details")
    .select("weight_kg, height_cm, body_fat_percentage, body_measurements, updated_at")
    .eq("profile_id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar el perfil fisico.");
  }

  return {
    bodyFatPercentage: data?.body_fat_percentage ?? null,
    bodyMeasurements: data?.body_measurements ?? null,
    heightCm: data?.height_cm ?? null,
    updatedAt: data?.updated_at ?? null,
    weightKg: data?.weight_kg ?? null,
  };
}

async function loadProfessionalPhysicalProfile(
  clientId: string,
  access: CurrentUserAccess,
): Promise<PhysicalProfileSummary> {
  const profile = await getClientAdministrativeProfile(clientId, access);

  return {
    bodyFatPercentage: profile?.bodyFatPercentage ?? null,
    bodyMeasurements: profile?.bodyMeasurements ?? null,
    heightCm: profile?.heightCm ?? null,
    updatedAt: profile?.updatedAt ?? null,
    weightKg: profile?.weightKg ?? null,
  };
}

async function loadMeasurements(
  clientId: string,
  access: CurrentUserAccess,
  permissions: ProgressPermissions,
): Promise<MeasurementsProgressSummary> {
  const supabase = await createClient();
  let query = supabase
    .from("progress_entries")
    .select("id, area, metric_type, metric_value, metric_unit, note, recorded_at")
    .eq("client_id", clientId)
    .order("recorded_at", { ascending: false });
  const visibleAreas = getVisibleAreas(access, permissions);

  if (visibleAreas) {
    query = query.in("area", visibleAreas);
  }

  const [entriesResult, profile] = await Promise.all([
    query,
    access.isClient
      ? loadOwnPhysicalProfile(clientId)
      : loadProfessionalPhysicalProfile(clientId, access),
  ]);

  if (entriesResult.error) {
    throw new Error("No se pudieron cargar las medidas.");
  }

  return {
    entries: entriesResult.data ?? [],
    profile,
  };
}

function emptyProgressPageData(
  clientOptions: ProgressClientOption[],
  selectedClient: ProgressClientOption | null,
  invalidClientSelection = false,
): ProgressPageData {
  return {
    appointments: emptyBlock("Selecciona un cliente para ver su progreso."),
    clientOptions,
    invalidClientSelection,
    measurements: emptyBlock("Selecciona un cliente para ver sus medidas."),
    nutrition: emptyBlock("Selecciona un cliente para ver su nutricion."),
    permissions: EMPTY_PERMISSIONS,
    selectedClient,
    training: emptyBlock("Selecciona un cliente para ver su entrenamiento."),
  };
}

export function normalizeProgressTab(value?: string | null): ProgressTab {
  if (
    value === "resumen" ||
    value === "nutricion" ||
    value === "entrenamiento" ||
    value === "medidas"
  ) {
    return value;
  }

  return "resumen";
}

export async function getProgressPageData(
  access: CurrentUserAccess,
  requestedClientId?: string | null,
): Promise<ProgressPageData> {
  if (access.isClient) {
    const selectedClient: ProgressClientOption = {
      assignedNutritionistId: access.assignedNutritionistId,
      assignedTrainerId: access.assignedTrainerId,
      fullName: access.displayName,
      hasNutritionService: access.hasNutritionService,
      hasTrainingService: access.hasTrainingService,
      id: access.userId,
    };
    const permissions = getClientPermissions(selectedClient, access);

    return {
      appointments: await toBlock(
        () => loadAppointments(access.userId, access, permissions),
        "No pudimos cargar tus proximas consultas.",
      ),
      clientOptions: [selectedClient],
      invalidClientSelection: false,
      measurements: await toBlock(
        () => loadMeasurements(access.userId, access, permissions),
        "No pudimos cargar tus medidas.",
      ),
      nutrition:
        permissions.canViewNutrition && selectedClient.hasNutritionService
          ? await toBlock(
              () => loadNutritionProgress(access, access.userId),
              "No pudimos cargar tu progreso nutricional.",
            )
          : emptyBlock("Todavia no tienes nutricion asignada."),
      permissions,
      selectedClient,
      training:
        permissions.canViewTraining && selectedClient.hasTrainingService
          ? await toBlock(
              () => getClientTrainingOverview(access.userId),
              "No pudimos cargar tu progreso de entrenamiento.",
            )
          : emptyBlock("Todavia no tienes entrenamiento asignado."),
    };
  }

  const activationData = await listClientActivationData("active", access);
  const clientOptions = activationData.clients
    .map((client) => ({
      assignedNutritionistId: client.assignedNutritionistId,
      assignedTrainerId: client.assignedTrainerId,
      fullName: client.fullName,
      hasNutritionService: client.hasNutritionService,
      hasTrainingService: client.hasTrainingService,
      id: client.id,
    }))
    .filter((client) => isClientVisibleToProgress(client, access))
    .sort((left, right) => left.fullName.localeCompare(right.fullName, "es"));
  const selectedClient =
    clientOptions.find((client) => client.id === requestedClientId) ?? null;
  const invalidClientSelection = Boolean(requestedClientId && !selectedClient);

  if (!selectedClient) {
    return emptyProgressPageData(clientOptions, null, invalidClientSelection);
  }

  const permissions = getClientPermissions(selectedClient, access);

  return {
    appointments: await toBlock(
      () => loadAppointments(selectedClient.id, access, permissions),
      "No pudimos cargar la proxima consulta.",
    ),
    clientOptions,
    invalidClientSelection,
    measurements: permissions.canViewMeasurements
      ? await toBlock(
          () => loadMeasurements(selectedClient.id, access, permissions),
          "No pudimos cargar las medidas de este cliente.",
        )
      : emptyBlock("No tienes acceso a las medidas de este cliente."),
    nutrition:
      permissions.canViewNutrition && selectedClient.hasNutritionService
        ? await toBlock(
            () => loadNutritionProgress(access, selectedClient.id),
            "No pudimos cargar el progreso nutricional de este cliente.",
          )
        : emptyBlock("No tienes acceso nutricional para este cliente."),
    permissions,
    selectedClient,
    training:
      permissions.canViewTraining && selectedClient.hasTrainingService
        ? await toBlock(
            () => getClientTrainingOverview(selectedClient.id),
            "No pudimos cargar el progreso de entrenamiento de este cliente.",
          )
        : emptyBlock("No tienes acceso de entrenamiento para este cliente."),
  };
}

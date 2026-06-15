import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

export type AppRecordSummary = {
  detail: string | null;
  id: string;
  title: string;
};

export type DashboardData = {
  assignedClientsCount: number;
  currentDietPlan: AppRecordSummary | null;
  currentWorkoutPlan: AppRecordSummary | null;
  dietPlansCount: number;
  recentResources: AppRecordSummary[];
  resourcesCount: number;
  workoutPlansCount: number;
};

export type SectionRecord = AppRecordSummary & {
  meta?: string | null;
};

export type SectionData = {
  count: number;
  records: SectionRecord[];
};

type AppointmentRow = Pick<
  Tables<"appointments">,
  "area" | "id" | "starts_at" | "status" | "title"
>;
type DietPlanRow = Pick<
  Tables<"diet_plans">,
  "created_at" | "description" | "end_date" | "id" | "start_date" | "status" | "title"
>;
type ProgressEntryRow = Pick<
  Tables<"progress_entries">,
  | "area"
  | "id"
  | "metric_type"
  | "metric_unit"
  | "metric_value"
  | "note"
  | "recorded_at"
>;
type ResourceRow = Pick<
  Tables<"resources">,
  "area" | "created_at" | "description" | "file_url" | "id" | "title"
>;
type WorkoutPlanRow = Pick<
  Tables<"workout_plans">,
  "created_at" | "description" | "end_date" | "id" | "start_date" | "status" | "title"
>;

type CountQuery = PromiseLike<{
  count: number | null;
  error: unknown;
}>;

type RowsQuery<Row> = PromiseLike<{
  data: Row[] | null;
  error: unknown;
}>;

const PLAN_STATUS_LABELS: Record<Enums<"plan_status">, string> = {
  active: "Activo",
  archived: "Archivado",
  draft: "Borrador",
};

const AREA_LABELS: Record<Enums<"service_area">, string> = {
  general: "General",
  nutrition: "Nutricion",
  training: "Entrenamiento",
};

const APPOINTMENT_STATUS_LABELS: Record<Enums<"appointment_status">, string> = {
  cancelled: "Cancelada",
  completed: "Completada",
  scheduled: "Programada",
};

async function resolveCount(query: CountQuery) {
  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count ?? 0;
}

async function resolveRows<Row>(query: RowsQuery<Row>) {
  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data;
}

function isGeneralAdmin(access: CurrentUserAccess) {
  return access.role === "admin";
}

function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim()) ?? null;
}

function formatDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function summarizePlan(record: DietPlanRow | WorkoutPlanRow): AppRecordSummary {
  const dates = [formatDate(record.start_date), formatDate(record.end_date)]
    .filter(Boolean)
    .join(" - ");

  return {
    detail: firstText(
      PLAN_STATUS_LABELS[record.status],
      dates || null,
      record.description,
      formatDate(record.created_at),
    ),
    id: record.id,
    title: record.title,
  };
}

function summarizeResource(record: ResourceRow): AppRecordSummary {
  return {
    detail: firstText(AREA_LABELS[record.area], record.description, record.file_url),
    id: record.id,
    title: record.title,
  };
}

function summarizeAppointment(record: AppointmentRow): SectionRecord {
  return {
    detail: firstText(formatDate(record.starts_at), AREA_LABELS[record.area]),
    id: record.id,
    meta: APPOINTMENT_STATUS_LABELS[record.status],
    title: record.title,
  };
}

function summarizeProgress(record: ProgressEntryRow): SectionRecord {
  const value =
    record.metric_value === null
      ? null
      : `${record.metric_value}${record.metric_unit ? ` ${record.metric_unit}` : ""}`;

  return {
    detail: firstText(value, record.note, AREA_LABELS[record.area]),
    id: record.id,
    meta: formatDate(record.recorded_at),
    title: record.metric_type,
  };
}

async function countAssignedClients(access: CurrentUserAccess) {
  if (!access.isAdmin) {
    return 0;
  }

  const supabase = await createClient();
  let query = supabase
    .from("client_profiles")
    .select("profile_id", { count: "exact", head: true });

  if (isGeneralAdmin(access)) {
    return resolveCount(query);
  }

  if (access.canManageNutrition && access.canManageTraining) {
    query = query.or(
      `assigned_nutritionist_id.eq.${access.userId},assigned_trainer_id.eq.${access.userId}`,
    );
  } else if (access.canManageNutrition) {
    query = query.eq("assigned_nutritionist_id", access.userId);
  } else if (access.canManageTraining) {
    query = query.eq("assigned_trainer_id", access.userId);
  } else {
    return 0;
  }

  return resolveCount(query);
}

async function getDietPlans(access: CurrentUserAccess, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("diet_plans")
    .select("id, title, description, status, start_date, end_date, created_at")
    .order("created_at", { ascending: false });

  if (access.isClient) {
    query = query.eq("client_id", access.userId);
  } else if (!isGeneralAdmin(access)) {
    query = query.eq("nutritionist_id", access.userId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  return resolveRows<DietPlanRow>(query);
}

async function countDietPlans(access: CurrentUserAccess) {
  const supabase = await createClient();
  let query = supabase
    .from("diet_plans")
    .select("id", { count: "exact", head: true });

  if (access.isClient) {
    query = query.eq("client_id", access.userId);
  } else if (!isGeneralAdmin(access)) {
    query = query.eq("nutritionist_id", access.userId);
  }

  return resolveCount(query);
}

async function getWorkoutPlans(access: CurrentUserAccess, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("workout_plans")
    .select("id, title, description, status, start_date, end_date, created_at")
    .order("created_at", { ascending: false });

  if (access.isClient) {
    query = query.eq("client_id", access.userId);
  } else if (!isGeneralAdmin(access)) {
    query = query.eq("trainer_id", access.userId);
  }

  if (limit) {
    query = query.limit(limit);
  }

  return resolveRows<WorkoutPlanRow>(query);
}

async function countWorkoutPlans(access: CurrentUserAccess) {
  const supabase = await createClient();
  let query = supabase
    .from("workout_plans")
    .select("id", { count: "exact", head: true });

  if (access.isClient) {
    query = query.eq("client_id", access.userId);
  } else if (!isGeneralAdmin(access)) {
    query = query.eq("trainer_id", access.userId);
  }

  return resolveCount(query);
}

async function getResources(access: CurrentUserAccess, limit?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("resources")
    .select("id, title, description, file_url, area, created_at")
    .order("created_at", { ascending: false });

  if (access.isClient) {
    query = query.or(`client_id.eq.${access.userId},client_id.is.null`);
  }

  if (limit) {
    query = query.limit(limit);
  }

  return resolveRows<ResourceRow>(query);
}

async function countResources(access: CurrentUserAccess) {
  const supabase = await createClient();
  let query = supabase
    .from("resources")
    .select("id", { count: "exact", head: true });

  if (access.isClient) {
    query = query.or(`client_id.eq.${access.userId},client_id.is.null`);
  }

  return resolveCount(query);
}

export async function getDashboardData(
  access: CurrentUserAccess,
): Promise<DashboardData> {
  const shouldReadNutrition = access.canViewNutrition;
  const shouldReadTraining = access.canViewTraining;

  const [
    assignedClientsCount,
    dietPlansCount,
    workoutPlansCount,
    resourcesCount,
    dietPlanRows,
    workoutPlanRows,
    resourceRows,
  ] = await Promise.all([
    countAssignedClients(access),
    shouldReadNutrition ? countDietPlans(access) : Promise.resolve(0),
    shouldReadTraining ? countWorkoutPlans(access) : Promise.resolve(0),
    countResources(access),
    shouldReadNutrition ? getDietPlans(access, 1) : Promise.resolve([]),
    shouldReadTraining ? getWorkoutPlans(access, 1) : Promise.resolve([]),
    getResources(access, 3),
  ]);

  return {
    assignedClientsCount,
    currentDietPlan: dietPlanRows[0] ? summarizePlan(dietPlanRows[0]) : null,
    currentWorkoutPlan: workoutPlanRows[0]
      ? summarizePlan(workoutPlanRows[0])
      : null,
    dietPlansCount,
    recentResources: resourceRows.map(summarizeResource),
    resourcesCount,
    workoutPlansCount,
  };
}

export async function getCalendarData(
  access: CurrentUserAccess,
): Promise<SectionData> {
  const supabase = await createClient();
  let rowsQuery = supabase
    .from("appointments")
    .select("id, title, area, starts_at, status")
    .order("starts_at", { ascending: true })
    .limit(5);
  let countQuery = supabase
    .from("appointments")
    .select("id", { count: "exact", head: true });

  if (access.isClient) {
    rowsQuery = rowsQuery.eq("client_id", access.userId);
    countQuery = countQuery.eq("client_id", access.userId);
  } else if (!isGeneralAdmin(access)) {
    rowsQuery = rowsQuery.eq("professional_id", access.userId);
    countQuery = countQuery.eq("professional_id", access.userId);
  }

  const [rows, count] = await Promise.all([
    resolveRows<AppointmentRow>(rowsQuery),
    resolveCount(countQuery),
  ]);

  return {
    count,
    records: rows.map(summarizeAppointment),
  };
}

export async function getProgressData(
  access: CurrentUserAccess,
): Promise<SectionData> {
  const supabase = await createClient();
  let rowsQuery = supabase
    .from("progress_entries")
    .select(
      "id, area, metric_type, metric_value, metric_unit, note, recorded_at",
    )
    .order("recorded_at", { ascending: false })
    .limit(5);
  let countQuery = supabase
    .from("progress_entries")
    .select("id", { count: "exact", head: true });

  if (access.isClient) {
    rowsQuery = rowsQuery.eq("client_id", access.userId);
    countQuery = countQuery.eq("client_id", access.userId);
  } else if (!isGeneralAdmin(access)) {
    rowsQuery = rowsQuery.eq("recorded_by", access.userId);
    countQuery = countQuery.eq("recorded_by", access.userId);
  }

  const [rows, count] = await Promise.all([
    resolveRows<ProgressEntryRow>(rowsQuery),
    resolveCount(countQuery),
  ]);

  return {
    count,
    records: rows.map(summarizeProgress),
  };
}

import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

type PlanStatus = Enums<"plan_status">;

type PlanRow = {
  end_date: string | null;
  start_date: string | null;
  status: PlanStatus;
  title: string;
};

type AppointmentRow = Pick<
  Tables<"appointments">,
  "area" | "starts_at" | "status" | "title"
>;

type CountQuery = PromiseLike<{
  count: number | null;
  error: unknown;
}>;

const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  active: "Activo",
  archived: "Archivado",
  draft: "Borrador",
};

const AREA_LABELS: Record<Enums<"service_area">, string> = {
  general: "General",
  nutrition: "Nutricion",
  training: "Entrenamiento",
};

export type ClientProfileSummary = {
  activePlanLabel: string;
  currentNutritionPlan: PlanRow | null;
  currentTrainingPlan: PlanRow | null;
  nextAppointment: AppointmentRow | null;
  planEndDate: string | null;
  planStartDate: string | null;
  planStatusLabel: string;
};

export type ProfessionalProfileSummary = {
  activeClients: number;
  blogsCreated: number;
  nextAppointments: number;
  nutritionClients: number;
  resourcesCreated: number;
  trainingClients: number;
};

async function resolveCount(query: CountQuery) {
  const { count, error } = await query;

  if (error) {
    return 0;
  }

  return count ?? 0;
}

async function getActivePlan<Row extends PlanRow>(
  query: PromiseLike<{ data: Row[] | null; error: unknown }>,
) {
  const { data, error } = await query;

  if (error || !data) {
    return null;
  }

  return data[0] ?? null;
}

function getPlanDates(plans: Array<PlanRow | null>) {
  const startDates = plans
    .map((plan) => plan?.start_date)
    .filter((value): value is string => Boolean(value))
    .sort();
  const endDates = plans
    .map((plan) => plan?.end_date)
    .filter((value): value is string => Boolean(value))
    .sort();

  return {
    endDate: endDates.at(-1) ?? null,
    startDate: startDates[0] ?? null,
  };
}

export async function getClientProfileSummary(
  access: CurrentUserAccess,
): Promise<ClientProfileSummary> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [currentNutritionPlan, currentTrainingPlan, appointmentResult] =
    await Promise.all([
      access.canViewNutrition
        ? getActivePlan(
            supabase
              .from("diet_plans")
              .select("title, status, start_date, end_date")
              .eq("client_id", access.userId)
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1),
          )
        : Promise.resolve(null),
      access.canViewTraining
        ? getActivePlan(
            supabase
              .from("workout_plans")
              .select("title, status, start_date, end_date")
              .eq("client_id", access.userId)
              .eq("status", "active")
              .order("created_at", { ascending: false })
              .limit(1),
          )
        : Promise.resolve(null),
      supabase
        .from("appointments")
        .select("title, area, starts_at, status")
        .eq("client_id", access.userId)
        .eq("status", "scheduled")
        .gte("starts_at", now)
        .order("starts_at", { ascending: true })
        .limit(1),
    ]);
  const plans = [currentNutritionPlan, currentTrainingPlan];
  const dates = getPlanDates(plans);
  const activeStatuses = plans
    .map((plan) => plan?.status)
    .filter((status): status is PlanStatus => Boolean(status));

  return {
    activePlanLabel:
      access.hasNutritionService && access.hasTrainingService
        ? "Ambos planes"
        : access.hasNutritionService
          ? "Nutricion"
          : access.hasTrainingService
            ? "Entrenamiento"
            : "Sin plan activo",
    currentNutritionPlan,
    currentTrainingPlan,
    nextAppointment: appointmentResult.error
      ? null
      : ((appointmentResult.data ?? [])[0] ?? null),
    planEndDate: dates.endDate,
    planStartDate: dates.startDate,
    planStatusLabel:
      activeStatuses.length > 0
        ? activeStatuses
            .map((status) => PLAN_STATUS_LABELS[status])
            .filter((value, index, values) => values.indexOf(value) === index)
            .join(" / ")
        : "Sin plan activo",
  };
}

export async function getProfessionalProfileSummary(
  access: CurrentUserAccess,
): Promise<ProfessionalProfileSummary> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const nutritionQuery = supabase
    .from("client_profiles")
    .select("profile_id", { count: "exact", head: true })
    .eq("assigned_nutritionist_id", access.userId);
  const trainingQuery = supabase
    .from("client_profiles")
    .select("profile_id", { count: "exact", head: true })
    .eq("assigned_trainer_id", access.userId);
  const [
    activeClients,
    nutritionClients,
    trainingClients,
    nextAppointments,
    resourcesCreated,
    blogsCreated,
  ] = await Promise.all([
    resolveCount(
      supabase
        .from("client_profiles")
        .select("profile_id", { count: "exact", head: true })
        .or(
          `assigned_nutritionist_id.eq.${access.userId},assigned_trainer_id.eq.${access.userId}`,
        ),
    ),
    resolveCount(nutritionQuery),
    resolveCount(trainingQuery),
    resolveCount(
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", access.userId)
        .eq("status", "scheduled")
        .gte("starts_at", now),
    ),
    resolveCount(
      supabase
        .from("resources")
        .select("id", { count: "exact", head: true })
        .eq("uploaded_by", access.userId),
    ),
    resolveCount(
      supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("author_id", access.userId),
    ),
  ]);

  return {
    activeClients,
    blogsCreated,
    nextAppointments,
    nutritionClients,
    resourcesCreated,
    trainingClients,
  };
}

export function getAreaLabel(area: Enums<"service_area">) {
  return AREA_LABELS[area];
}

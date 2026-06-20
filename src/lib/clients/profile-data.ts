import "server-only";

import type { User } from "@supabase/supabase-js";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;
type PlanStatus = Enums<"plan_status">;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ClientAccountStatus =
  | "active"
  | "pending"
  | "suspended"
  | "unknown";

export type ClientPlanState =
  | "active"
  | "archived"
  | "draft"
  | "expired"
  | "upcoming";

export type ClientPlanSummary = {
  createdAt: string;
  description: string | null;
  detailAvailable: boolean;
  durationWeeks: number | null;
  endDate: string | null;
  id: string;
  routineId: string | null;
  startDate: string | null;
  state: ClientPlanState;
  status: PlanStatus;
  title: string;
};

export type ClientAdministrativeProfile = {
  accountStatus: ClientAccountStatus;
  assignedNutritionistName: string | null;
  assignedTrainerName: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  canViewNutritionPlans: boolean;
  canViewTrainingPlans: boolean;
  createdAt: string;
  email: string | null;
  fullName: string;
  gender: string | null;
  genderDescription: string | null;
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  heightCm: number | null;
  id: string;
  medicalConditions: string | null;
  nutritionPlans: ClientPlanSummary[];
  phone: string | null;
  role: "client";
  trainingPlans: ClientPlanSummary[];
  updatedAt: string;
  weightKg: number | null;
};

function isGeneralAdmin(access: CurrentUserAccess) {
  return access.role === "admin";
}

function getTodayDateKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function getPlanState(
  status: PlanStatus,
  startDate: string | null,
  endDate: string | null,
): ClientPlanState {
  if (status === "archived") {
    return "archived";
  }

  if (status === "draft") {
    return "draft";
  }

  const today = getTodayDateKey();

  if (endDate && endDate < today) {
    return "expired";
  }

  if (startDate && startDate > today) {
    return "upcoming";
  }

  return "active";
}

function getAccountStatus(user: User | null): ClientAccountStatus {
  if (!user) {
    return "unknown";
  }

  const bannedUntil = user.banned_until
    ? Date.parse(user.banned_until)
    : Number.NaN;

  if (Number.isFinite(bannedUntil) && bannedUntil > Date.now()) {
    return "suspended";
  }

  if (!user.confirmed_at && !user.email_confirmed_at) {
    return "pending";
  }

  return "active";
}

async function getAuthAccount(clientId: string) {
  if (!hasSupabaseAdminConfig()) {
    return {
      accountStatus: "unknown" as const,
      email: null,
    };
  }

  const { data, error } =
    await createAdminClient().auth.admin.getUserById(clientId);

  if (error || !data.user) {
    return {
      accountStatus: "unknown" as const,
      email: null,
    };
  }

  return {
    accountStatus: getAccountStatus(data.user),
    email: data.user.email ?? null,
  };
}

async function listDietPlans(
  supabase: ServerSupabase,
  clientId: string,
): Promise<ClientPlanSummary[]> {
  const { data, error } = await supabase
    .from("diet_plans")
    .select(
      "id, title, description, status, start_date, end_date, created_at",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los planes de nutricion.");
  }

  return (data ?? []).map((plan) => ({
    createdAt: plan.created_at,
    description: plan.description,
    detailAvailable: false,
    durationWeeks: null,
    endDate: plan.end_date,
    id: plan.id,
    routineId: null,
    startDate: plan.start_date,
    state: getPlanState(plan.status, plan.start_date, plan.end_date),
    status: plan.status,
    title: plan.title,
  }));
}

async function listTrainingPlans(
  supabase: ServerSupabase,
  clientId: string,
): Promise<ClientPlanSummary[]> {
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      "id, routine_id, routine_snapshot, template_snapshot, title, description, status, start_date, end_date, duration_weeks, created_at",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los planes de entrenamiento.");
  }

  return (data ?? []).map((plan) => ({
    createdAt: plan.created_at,
    description: plan.description,
    detailAvailable: Boolean(
      plan.routine_snapshot ||
        plan.template_snapshot ||
        plan.routine_id,
    ),
    durationWeeks: plan.duration_weeks,
    endDate: plan.end_date,
    id: plan.id,
    routineId: plan.routine_id,
    startDate: plan.start_date,
    state: getPlanState(plan.status, plan.start_date, plan.end_date),
    status: plan.status,
    title: plan.title,
  }));
}

export async function getClientAdministrativeProfile(
  clientId: string,
  access: CurrentUserAccess,
): Promise<ClientAdministrativeProfile | null> {
  if (
    access.isClient ||
    !access.canManageClientPlans ||
    !UUID_PATTERN.test(clientId)
  ) {
    return null;
  }

  const supabase = await createClient();
  const [profileResult, clientProfileResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, created_at, updated_at")
      .eq("id", clientId)
      .eq("role", "client")
      .maybeSingle(),
    supabase
      .from("client_profiles")
      .select(
        "profile_id, assigned_nutritionist_id, assigned_trainer_id, created_at, updated_at",
      )
      .eq("profile_id", clientId)
      .maybeSingle(),
  ]);

  if (profileResult.error || clientProfileResult.error) {
    throw new Error("No se pudo cargar el perfil del cliente.");
  }

  const profile = profileResult.data;
  const clientProfile = clientProfileResult.data;

  if (!profile) {
    return null;
  }

  const generalAdmin = isGeneralAdmin(access);
  const assignedNutritionistId =
    clientProfile?.assigned_nutritionist_id ?? null;
  const assignedTrainerId = clientProfile?.assigned_trainer_id ?? null;
  const isAssignedProfessional =
    assignedNutritionistId === access.userId ||
    assignedTrainerId === access.userId;

  if (!generalAdmin && !isAssignedProfessional) {
    return null;
  }

  const canViewNutritionPlans =
    generalAdmin || assignedNutritionistId === access.userId;
  const canViewTrainingPlans =
    generalAdmin || assignedTrainerId === access.userId;
  const professionalIds = [
    assignedNutritionistId,
    assignedTrainerId,
  ].filter((id): id is string => Boolean(id));

  const [
    professionalProfilesResult,
    personalDetailsResult,
    nutritionPlans,
    trainingPlans,
    auth,
  ] = await Promise.all([
      professionalIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", professionalIds)
        : Promise.resolve({
            data: [] as Pick<Tables<"profiles">, "full_name" | "id">[],
            error: null,
          }),
      supabase
        .from("profile_personal_details")
        .select(
          "phone, birth_date, gender, gender_description, weight_kg, height_cm, medical_conditions, updated_at",
        )
        .eq("profile_id", clientId)
        .maybeSingle(),
      canViewNutritionPlans
        ? listDietPlans(supabase, clientId)
        : Promise.resolve([]),
      canViewTrainingPlans
        ? listTrainingPlans(supabase, clientId)
        : Promise.resolve([]),
      getAuthAccount(clientId),
    ]);

  if (professionalProfilesResult.error || personalDetailsResult.error) {
    throw new Error("No se pudo completar el perfil administrativo.");
  }

  const personalDetails = personalDetailsResult.data;
  const professionalNameById = new Map(
    (professionalProfilesResult.data ?? []).map((professional) => [
      professional.id,
      professional.full_name ?? "Profesional sin nombre",
    ]),
  );

  return {
    accountStatus: auth.accountStatus,
    assignedNutritionistName: assignedNutritionistId
      ? professionalNameById.get(assignedNutritionistId) ?? null
      : null,
    assignedTrainerName: assignedTrainerId
      ? professionalNameById.get(assignedTrainerId) ?? null
      : null,
    avatarUrl: profile.avatar_url,
    birthDate: personalDetails?.birth_date ?? null,
    canViewNutritionPlans,
    canViewTrainingPlans,
    createdAt: profile.created_at,
    email: auth.email,
    fullName: profile.full_name ?? "Cliente sin nombre",
    gender: personalDetails?.gender ?? null,
    genderDescription: personalDetails?.gender_description ?? null,
    hasNutritionService: assignedNutritionistId !== null,
    hasTrainingService: assignedTrainerId !== null,
    heightCm: personalDetails?.height_cm ?? null,
    id: profile.id,
    medicalConditions: personalDetails?.medical_conditions ?? null,
    nutritionPlans,
    phone: personalDetails?.phone ?? null,
    role: "client",
    trainingPlans,
    updatedAt:
      personalDetails?.updated_at ??
      clientProfile?.updated_at ??
      profile.updated_at,
    weightKg: personalDetails?.weight_kg ?? null,
  };
}

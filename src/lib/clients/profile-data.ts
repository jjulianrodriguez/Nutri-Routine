import "server-only";

import type { User } from "@supabase/supabase-js";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
  getProfileDirectory,
  getProfileDisplayName,
} from "@/lib/auth/profile-directory";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/user-settings/data";
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
  assignedNutritionistId: string | null;
  assignedNutritionistName: string | null;
  assignedTrainerId: string | null;
  assignedTrainerName: string | null;
  allergies: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  bodyFatPercentage: number | null;
  bodyMeasurements: string | null;
  canViewNutritionPlans: boolean;
  canViewTrainingPlans: boolean;
  createdAt: string;
  dietaryRestrictions: string | null;
  email: string | null;
  fullName: string;
  gender: string | null;
  genderDescription: string | null;
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  healthDataHidden: boolean;
  heightCm: number | null;
  id: string;
  importantMedications: string | null;
  injuries: string | null;
  medicalConditions: string | null;
  nutritionPlans: ClientPlanSummary[];
  personalInfoHidden: boolean;
  phone: string | null;
  professionalNotes: string | null;
  role: "client";
  sensitiveNotesHidden: boolean;
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
    throw new Error("No se pudieron cargar los planes de nutrición.");
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
    professionalProfilesById,
    personalDetailsResult,
    privacySettings,
    nutritionPlans,
    trainingPlans,
    auth,
  ] = await Promise.all([
      getProfileDirectory(professionalIds, {
        includeEmails: true,
        includeProfessionalProfiles: true,
      }),
      supabase
        .from("profile_personal_details")
        .select(
          "phone, birth_date, gender, gender_description, weight_kg, height_cm, body_fat_percentage, body_measurements, medical_conditions, injuries, allergies, important_medications, dietary_restrictions, professional_notes, updated_at",
        )
        .eq("profile_id", clientId)
        .maybeSingle(),
      getUserSettings(clientId),
      canViewNutritionPlans
        ? listDietPlans(supabase, clientId)
        : Promise.resolve([]),
      canViewTrainingPlans
        ? listTrainingPlans(supabase, clientId)
        : Promise.resolve([]),
      getAuthAccount(clientId),
    ]);

  if (personalDetailsResult.error) {
    throw new Error("No se pudo completar el perfil administrativo.");
  }

  const personalDetails = personalDetailsResult.data;
  const canViewPersonalInfo =
    generalAdmin || privacySettings.allowAssignedProfessionalsPersonalInfo;
  const canViewHealthData =
    generalAdmin || privacySettings.allowAssignedProfessionalsHealthData;
  const canViewSensitiveNotes =
    generalAdmin || privacySettings.allowAssignedProfessionalsSensitiveNotes;

  return {
    accountStatus: auth.accountStatus,
    assignedNutritionistId,
    assignedNutritionistName: assignedNutritionistId
      ? getProfileDisplayName(
          professionalProfilesById.get(assignedNutritionistId),
        )
      : null,
    assignedTrainerId,
    assignedTrainerName: assignedTrainerId
      ? getProfileDisplayName(professionalProfilesById.get(assignedTrainerId))
      : null,
    allergies: canViewHealthData ? personalDetails?.allergies ?? null : null,
    avatarUrl: profile.avatar_url,
    birthDate: canViewPersonalInfo ? personalDetails?.birth_date ?? null : null,
    bodyFatPercentage: canViewHealthData
      ? personalDetails?.body_fat_percentage ?? null
      : null,
    bodyMeasurements: canViewHealthData
      ? personalDetails?.body_measurements ?? null
      : null,
    canViewNutritionPlans,
    canViewTrainingPlans,
    createdAt: profile.created_at,
    dietaryRestrictions: canViewHealthData
      ? personalDetails?.dietary_restrictions ?? null
      : null,
    email: canViewPersonalInfo ? auth.email : null,
    fullName:
      profile.full_name?.trim() ||
      (canViewPersonalInfo ? auth.email : null) ||
      "Perfil incompleto",
    gender: canViewPersonalInfo ? personalDetails?.gender ?? null : null,
    genderDescription: canViewPersonalInfo
      ? personalDetails?.gender_description ?? null
      : null,
    hasNutritionService: assignedNutritionistId !== null,
    hasTrainingService: assignedTrainerId !== null,
    healthDataHidden: !canViewHealthData,
    heightCm: canViewHealthData ? personalDetails?.height_cm ?? null : null,
    id: profile.id,
    importantMedications: canViewHealthData
      ? personalDetails?.important_medications ?? null
      : null,
    injuries: canViewHealthData ? personalDetails?.injuries ?? null : null,
    medicalConditions: canViewHealthData
      ? personalDetails?.medical_conditions ?? null
      : null,
    nutritionPlans,
    personalInfoHidden: !canViewPersonalInfo,
    phone: canViewPersonalInfo ? personalDetails?.phone ?? null : null,
    professionalNotes: canViewSensitiveNotes
      ? personalDetails?.professional_notes ?? null
      : null,
    role: "client",
    sensitiveNotesHidden: !canViewSensitiveNotes,
    trainingPlans,
    updatedAt:
      personalDetails?.updated_at ??
      clientProfile?.updated_at ??
      profile.updated_at,
    weightKg: canViewHealthData ? personalDetails?.weight_kg ?? null : null,
  };
}

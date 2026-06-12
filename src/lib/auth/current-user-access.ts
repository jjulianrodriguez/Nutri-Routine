import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import {
  canAccessRoute,
  getDefaultAppRoute,
  type AppRole,
  type CurrentUserAccess,
  type ProfessionalSpecialty,
} from "@/lib/auth/access-rules";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type ProfileRow = Pick<Tables<"profiles">, "full_name" | "role"> | null;
type ClientProfileRow =
  | Pick<
      Tables<"client_profiles">,
      "assigned_nutritionist_id" | "assigned_trainer_id"
    >
  | null;
type ProfessionalProfileRow =
  | Pick<Tables<"professional_profiles">, "specialty">
  | null;

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeRole(value: unknown): AppRole {
  const role = readString(value).toLowerCase();

  if (role === "admin" || role === "professional" || role === "client") {
    return role;
  }

  return "client";
}

function normalizeSpecialty(value: unknown): ProfessionalSpecialty | null {
  const specialty = readString(value).toLowerCase();

  if (
    specialty === "nutrition" ||
    specialty === "training" ||
    specialty === "both"
  ) {
    return specialty;
  }

  return null;
}

function getInitials(name: string, email: string) {
  const source = name || email;
  const parts = source
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "NC";
  }

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getDisplayName(user: User, profile: ProfileRow) {
  const metadata = user.user_metadata ?? {};

  return (
    readString(profile?.full_name) ||
    readString(metadata.full_name) ||
    readString(metadata.name) ||
    readString(user.email) ||
    "Cuenta"
  );
}

function getRoleLabel({
  hasNutritionService,
  hasTrainingService,
  isClientActivated,
  isClient,
  role,
  specialty,
}: {
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  isClientActivated: boolean;
  isClient: boolean;
  role: AppRole;
  specialty: ProfessionalSpecialty | null;
}) {
  if (isClient) {
    if (!isClientActivated) {
      return "Cuenta pendiente";
    }

    if (hasNutritionService && hasTrainingService) {
      return "Cliente integral";
    }

    if (hasNutritionService) {
      return "Cliente nutrici\u00f3n";
    }

    if (hasTrainingService) {
      return "Cliente entrenamiento";
    }

    return "Cliente";
  }

  const prefix = role === "admin" ? "Admin" : "Profesional";

  if (specialty === "nutrition") {
    return `${prefix} nutrici\u00f3n`;
  }

  if (specialty === "training") {
    return `${prefix} entrenamiento`;
  }

  if (specialty === "both") {
    return `${prefix} ambas \u00e1reas`;
  }

  return prefix;
}

async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function getClientProfile(userId: string): Promise<ClientProfileRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_profiles")
    .select("assigned_nutritionist_id, assigned_trainer_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

async function getProfessionalProfile(
  userId: string,
): Promise<ProfessionalProfileRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select("specialty")
    .eq("profile_id", userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

export const getCurrentUserAccess = cache(async () => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await getProfile(user.id);
  const role = normalizeRole(profile?.role);
  const isClient = role === "client";
  const isProfessional = role === "professional";
  const isAdmin = role === "admin" || isProfessional;
  const displayName = getDisplayName(user, profile);
  const email = readString(user.email);

  let clientProfile: ClientProfileRow = null;
  let professionalProfile: ProfessionalProfileRow = null;

  if (isClient) {
    clientProfile = await getClientProfile(user.id);
  } else {
    professionalProfile = await getProfessionalProfile(user.id);
  }

  const professionalSpecialty = normalizeSpecialty(professionalProfile?.specialty);
  const clientProfileExists = Boolean(clientProfile);
  const assignedNutritionistId = clientProfile?.assigned_nutritionist_id ?? null;
  const assignedTrainerId = clientProfile?.assigned_trainer_id ?? null;
  const hasNutritionService = assignedNutritionistId !== null;
  const hasTrainingService = assignedTrainerId !== null;
  const isClientActivated =
    isClient && (hasNutritionService || hasTrainingService);
  const canAccessOnlyBasicSettings = isClient && !isClientActivated;
  const canAccessApp = !isClient || isClientActivated;
  const isGeneralAdmin = role === "admin" && professionalSpecialty === null;
  const canManageNutrition =
    isAdmin &&
    (isGeneralAdmin ||
      professionalSpecialty === "nutrition" ||
      professionalSpecialty === "both");
  const canManageTraining =
    isAdmin &&
    (isGeneralAdmin ||
      professionalSpecialty === "training" ||
      professionalSpecialty === "both");
  const canManageClientPlans = canManageNutrition || canManageTraining;
  const canManageProfessionalAccounts = isGeneralAdmin;
  const canViewNutrition = isClient
    ? hasNutritionService
    : canManageNutrition;
  const canViewTraining = isClient ? hasTrainingService : canManageTraining;
  const specialty = isClient
    ? hasNutritionService && hasTrainingService
      ? "both"
      : hasNutritionService
        ? "nutrition"
        : hasTrainingService
          ? "training"
          : null
    : professionalSpecialty;

  return {
    assignedNutritionistId,
    assignedTrainerId,
    canAccessApp,
    canAccessOnlyBasicSettings,
    canManageClientPlans,
    canManageNutrition,
    canManageProfessionalAccounts,
    canManageTraining,
    canViewNutrition,
    canViewTraining,
    clientProfileExists,
    displayName,
    email,
    hasNutritionService,
    hasTrainingService,
    initials: getInitials(displayName, email),
    isAdmin,
    isClient,
    isClientActivated,
    isProfessional,
    role,
    roleLabel: getRoleLabel({
      hasNutritionService,
      hasTrainingService,
      isClientActivated,
      isClient,
      role,
      specialty,
    }),
    specialty,
    userId: user.id,
  } satisfies CurrentUserAccess;
});

export async function requireCurrentUserAccess() {
  const access = await getCurrentUserAccess();

  if (!access) {
    redirect("/login");
  }

  return access;
}

export async function requireRouteAccess(pathname: string) {
  const access = await requireCurrentUserAccess();

  if (!canAccessRoute(access, pathname)) {
    redirect(getDefaultAppRoute(access));
  }

  return access;
}

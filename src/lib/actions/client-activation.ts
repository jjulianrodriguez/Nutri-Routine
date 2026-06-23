"use server";

import { revalidatePath } from "next/cache";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
  getProfileDirectory,
  getProfileDisplayName,
} from "@/lib/auth/profile-directory";
import { createClient } from "@/lib/supabase/server";
import {
  clientActivationSchema,
  type ClientActivationService,
  type ClientActivationValues,
} from "@/lib/validations/client-activation";
import type { Enums, Tables } from "@/types/database";

const CLIENTS_PATH = "/app/clientes";
const DASHBOARD_PATH = "/app/dashboard";
const PENDING_PATH = "/app/pending";
const PRIVILEGED_ROLES = new Set<ProfileRole>(["admin", "professional"]);

type ProfileRole = Enums<"profile_role">;
type ProfessionalSpecialty = Enums<"professional_specialty">;
type ActivationSupabase = Awaited<ReturnType<typeof createClient>>;
type ClientActivationFieldErrors = Partial<
  Record<keyof ClientActivationValues, string>
>;

export type ClientAccountsFilter =
  | "active"
  | "all"
  | "both"
  | "none"
  | "nutrition"
  | "pending"
  | "training";

export type ClientActivationCounts = Record<ClientAccountsFilter, number> & {
  nutritionActive: number;
  trainingActive: number;
};

export type AssignableProfessional = {
  email: string;
  fullName: string;
  id: string;
  specialty: ProfessionalSpecialty;
};

export type ClientAccountListItem = {
  assignedNutritionistId: string | null;
  assignedNutritionistName: string | null;
  assignedTrainerId: string | null;
  assignedTrainerName: string | null;
  avatarUrl: string | null;
  clientProfileExists: boolean;
  createdAt: string;
  email: string;
  fullName: string;
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  id: string;
  isClientActivated: boolean;
  serviceType: "both" | "none" | "nutrition" | "training";
};

export type ClientActivationData = {
  canManageNutrition: boolean;
  canManageTraining: boolean;
  clients: ClientAccountListItem[];
  counts: ClientActivationCounts;
  currentUserId: string;
  error?: string;
  isAdmin: boolean;
  isProfessional: boolean;
  nutritionists: AssignableProfessional[];
  trainers: AssignableProfessional[];
};

export type ActivateClientAccountResult =
  | {
      message: string;
      status: "success";
    }
  | {
      fieldErrors?: ClientActivationFieldErrors;
      message: string;
      status: "error";
    };

function getFieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
      field,
      messages?.[0],
    ]),
  ) as ClientActivationFieldErrors;
}

function serviceNeeds(
  serviceType: ClientActivationService,
  service: "nutrition" | "training",
) {
  return serviceType === service || serviceType === "both";
}

function isProfessionalAllowedForService(
  specialty: ProfessionalSpecialty | null,
  service: "nutrition" | "training",
) {
  return specialty === service || specialty === "both";
}

function getServiceType({
  hasNutritionService,
  hasTrainingService,
}: {
  hasNutritionService: boolean;
  hasTrainingService: boolean;
}): ClientAccountListItem["serviceType"] {
  if (hasNutritionService && hasTrainingService) {
    return "both";
  }

  if (hasNutritionService) {
    return "nutrition";
  }

  if (hasTrainingService) {
    return "training";
  }

  return "none";
}

function normalizeFilter(filter?: string | null): ClientAccountsFilter {
  if (
    filter === "active" ||
    filter === "all" ||
    filter === "both" ||
    filter === "none" ||
    filter === "nutrition" ||
    filter === "pending" ||
    filter === "training"
  ) {
    return filter;
  }

  return "all";
}

function matchesFilter(
  client: ClientAccountListItem,
  filter: ClientAccountsFilter,
) {
  switch (filter) {
    case "active":
      return client.isClientActivated;
    case "all":
      return true;
    case "both":
    case "nutrition":
    case "training":
      return client.serviceType === filter;
    case "none":
    case "pending":
      return !client.isClientActivated;
  }
}

async function getCurrentActivationActor() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      activationSupabase: null,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: "",
      error: "Debes iniciar sesión para administrar clientes.",
      role: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      activationSupabase: supabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "No se pudo validar tu cuenta.",
      role: null,
    };
  }

  if (profile.role === "admin") {
    return {
      activationSupabase: supabase,
      canManageNutrition: true,
      canManageTraining: true,
      currentUserId: user.id,
      error: null,
      role: profile.role,
    };
  }

  if (profile.role !== "professional") {
    return {
      activationSupabase: supabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "Tu cuenta no tiene permisos para gestionar planes.",
      role: profile.role,
    };
  }

  const { data: professionalProfile, error: professionalProfileError } =
    await supabase
      .from("professional_profiles")
      .select("profile_id, specialty, is_active")
      .eq("profile_id", user.id)
      .maybeSingle();
  const isActiveProfessional =
    !professionalProfileError && professionalProfile?.is_active === true;

  if (!isActiveProfessional) {
    return {
      activationSupabase: supabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "Tu cuenta profesional esta inactiva.",
      role: profile.role,
    };
  }

  const specialty = professionalProfile?.specialty ?? null;
  const canManageNutrition =
    isProfessionalAllowedForService(specialty, "nutrition");
  const canManageTraining =
    isProfessionalAllowedForService(specialty, "training");

  if (!canManageNutrition && !canManageTraining) {
    return {
      activationSupabase: supabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "Tu cuenta no tiene una especialidad habilitada para gestionar planes.",
      role: profile.role,
    };
  }

  return {
    activationSupabase: supabase,
    canManageNutrition,
    canManageTraining,
    currentUserId: user.id,
    error: null,
    role: profile.role,
  };
}

async function getActivationActorFromAccess(access: CurrentUserAccess) {
  if (!access.canManageNutrition && !access.canManageTraining) {
    return {
      activationSupabase: null,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: access.userId,
      error: "Tu cuenta no puede gestionar planes de nutrición ni entrenamiento.",
      role: access.role,
    };
  }

  return {
    activationSupabase: await createClient(),
    canManageNutrition: access.canManageNutrition,
    canManageTraining: access.canManageTraining,
    currentUserId: access.userId,
    error: null,
    role: access.role,
  };
}

async function validateAssignableProfessional({
  activationSupabase,
  professionalId,
  service,
}: {
  activationSupabase: ActivationSupabase;
  professionalId: string;
  service: "nutrition" | "training";
}) {
  const { data: profile } = await activationSupabase
    .from("profiles")
    .select("id, role")
    .eq("id", professionalId)
    .maybeSingle();

  if (!profile) {
    return false;
  }

  if (profile.role === "admin") {
    return true;
  }

  const { data: professionalProfile } = await activationSupabase
    .from("professional_profiles")
    .select("profile_id, specialty, is_active")
    .eq("profile_id", professionalId)
    .maybeSingle();

  return Boolean(
    profile.role === "professional" &&
      professionalProfile?.is_active === true &&
      isProfessionalAllowedForService(professionalProfile.specialty, service),
  );
}

export async function activateClientAccount(
  values: ClientActivationValues,
): Promise<ActivateClientAccountResult> {
  const parsed = clientActivationSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: getFieldErrors(parsed.error),
      message: "Revisa los campos marcados.",
      status: "error",
    };
  }

  const actor = await getCurrentActivationActor();

  if (actor.error || !actor.activationSupabase || !actor.role) {
    return {
      message: actor.error ?? "No se pudo validar tu sesión.",
      status: "error",
    };
  }

  const wantsNutrition = serviceNeeds(parsed.data.serviceType, "nutrition");
  const wantsTraining = serviceNeeds(parsed.data.serviceType, "training");

  const { data: clientProfile, error: clientError } =
    await actor.activationSupabase
      .from("profiles")
      .select("id, role")
      .eq("id", parsed.data.clientId)
      .maybeSingle();

  if (clientError || !clientProfile || clientProfile.role !== "client") {
    return {
      message: "La cuenta seleccionada no es un cliente válido.",
      status: "error",
    };
  }

  const { data: existingAssignment, error: assignmentError } =
    await actor.activationSupabase
      .from("client_profiles")
      .select("assigned_nutritionist_id, assigned_trainer_id")
      .eq("profile_id", parsed.data.clientId)
      .maybeSingle();

  if (assignmentError) {
    return {
      message: "No se pudo consultar la activación actual del cliente.",
      status: "error",
    };
  }

  const nutritionistId = parsed.data.assignedNutritionistId || "";
  const trainerId = parsed.data.assignedTrainerId || "";
  const isAdmin = actor.role === "admin";
  const existingNutritionistId =
    existingAssignment?.assigned_nutritionist_id ?? null;
  const existingTrainerId = existingAssignment?.assigned_trainer_id ?? null;
  const nutritionBelongsToAnotherProfessional =
    existingNutritionistId !== null &&
    existingNutritionistId !== actor.currentUserId;
  const trainingBelongsToAnotherProfessional =
    existingTrainerId !== null && existingTrainerId !== actor.currentUserId;

  if (isAdmin && wantsNutrition && !nutritionistId) {
    return {
      fieldErrors: {
        assignedNutritionistId: "Selecciona un profesional en nutrición.",
      },
      message: "Selecciona un profesional en nutrición para activar el plan.",
      status: "error",
    };
  }

  if (isAdmin && wantsTraining && !trainerId) {
    return {
      fieldErrors: {
        assignedTrainerId: "Selecciona un profesional en entrenamiento.",
      },
      message:
        "Selecciona un profesional en entrenamiento para activar el plan.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    !actor.canManageNutrition &&
    wantsNutrition !== Boolean(existingNutritionistId)
  ) {
    return {
      message: "No tienes permisos para modificar el plan de nutrición.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    !actor.canManageTraining &&
    wantsTraining !== Boolean(existingTrainerId)
  ) {
    return {
      message: "No tienes permisos para modificar el plan de entrenamiento.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    !actor.canManageNutrition &&
    nutritionistId &&
    nutritionistId !== existingNutritionistId
  ) {
    return {
      fieldErrors: {
        assignedNutritionistId:
          "No puedes enviar otro profesional de nutrición.",
      },
      message: "No tienes permisos para modificar el plan de nutrición.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    !actor.canManageTraining &&
    trainerId &&
    trainerId !== existingTrainerId
  ) {
    return {
      fieldErrors: {
        assignedTrainerId: "No puedes enviar otro entrenador.",
      },
      message: "No tienes permisos para modificar el plan de entrenamiento.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    actor.canManageNutrition &&
    nutritionBelongsToAnotherProfessional &&
    !wantsNutrition
  ) {
    return {
      message:
        "No puedes quitar nutrición porque este cliente pertenece a otro profesional.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    actor.canManageTraining &&
    trainingBelongsToAnotherProfessional &&
    !wantsTraining
  ) {
    return {
      message:
        "No puedes quitar entrenamiento porque este cliente pertenece a otro profesional.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    actor.canManageNutrition &&
    nutritionBelongsToAnotherProfessional &&
    nutritionistId &&
    nutritionistId !== existingNutritionistId
  ) {
    return {
      fieldErrors: {
        assignedNutritionistId:
          "Este cliente ya tiene nutrición con otro profesional.",
      },
      message:
        "No puedes cambiar la asignación de nutrición de otro profesional.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    actor.canManageTraining &&
    trainingBelongsToAnotherProfessional &&
    trainerId &&
    trainerId !== existingTrainerId
  ) {
    return {
      fieldErrors: {
        assignedTrainerId:
          "Este cliente ya tiene entrenamiento con otro profesional.",
      },
      message:
        "No puedes cambiar la asignación de entrenamiento de otro profesional.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    actor.canManageNutrition &&
    !nutritionBelongsToAnotherProfessional &&
    wantsNutrition &&
    nutritionistId &&
    nutritionistId !== actor.currentUserId
  ) {
    return {
      fieldErrors: {
        assignedNutritionistId:
          "Solo puedes asignarte clientes de nutrición a tu propia cuenta.",
      },
      message:
        "Solo puedes asignar clientes de nutrición a tu propia cuenta.",
      status: "error",
    };
  }

  if (
    !isAdmin &&
    actor.canManageTraining &&
    !trainingBelongsToAnotherProfessional &&
    wantsTraining &&
    trainerId &&
    trainerId !== actor.currentUserId
  ) {
    return {
      fieldErrors: {
        assignedTrainerId:
          "Solo puedes asignarte clientes de entrenamiento a tu propia cuenta.",
      },
      message:
        "Solo puedes asignar clientes de entrenamiento a tu propia cuenta.",
      status: "error",
    };
  }

  if (
    isAdmin &&
    wantsNutrition &&
    !(await validateAssignableProfessional({
      activationSupabase: actor.activationSupabase,
      professionalId: nutritionistId,
      service: "nutrition",
    }))
  ) {
    return {
      fieldErrors: {
        assignedNutritionistId:
          "El profesional no tiene especialidad de nutrición.",
      },
      message: "El profesional en nutrición seleccionado no es válido.",
      status: "error",
    };
  }

  if (
    isAdmin &&
    wantsTraining &&
    !(await validateAssignableProfessional({
      activationSupabase: actor.activationSupabase,
      professionalId: trainerId,
      service: "training",
    }))
  ) {
    return {
      fieldErrors: {
        assignedTrainerId:
          "El profesional no tiene especialidad de entrenamiento.",
      },
      message: "El profesional en entrenamiento seleccionado no es válido.",
      status: "error",
    };
  }

  const assignedNutritionistId = isAdmin
    ? wantsNutrition
      ? nutritionistId
      : null
    : actor.canManageNutrition
      ? nutritionBelongsToAnotherProfessional
        ? existingNutritionistId
        : wantsNutrition
          ? actor.currentUserId
          : null
      : existingNutritionistId;
  const assignedTrainerId = isAdmin
    ? wantsTraining
      ? trainerId
      : null
    : actor.canManageTraining
      ? trainingBelongsToAnotherProfessional
        ? existingTrainerId
        : wantsTraining
          ? actor.currentUserId
          : null
      : existingTrainerId;

  let mutation;

  if (!assignedNutritionistId && !assignedTrainerId) {
    mutation = actor.activationSupabase
      .from("client_profiles")
      .delete()
      .eq("profile_id", parsed.data.clientId);
  } else if (existingAssignment) {
    mutation = actor.activationSupabase
      .from("client_profiles")
      .update({
        assigned_nutritionist_id: assignedNutritionistId,
        assigned_trainer_id: assignedTrainerId,
      })
      .eq("profile_id", parsed.data.clientId);
  } else {
    mutation = actor.activationSupabase.from("client_profiles").insert({
      assigned_nutritionist_id: assignedNutritionistId,
      assigned_trainer_id: assignedTrainerId,
      profile_id: parsed.data.clientId,
    });
  }

  const { error } = await mutation;

  if (error) {
    return {
      message: "No se pudo guardar la activacion del cliente.",
      status: "error",
    };
  }

  revalidatePath(CLIENTS_PATH);
  revalidatePath(DASHBOARD_PATH);
  revalidatePath(PENDING_PATH);
  revalidatePath("/app", "layout");

  return {
    message: "Planes del usuario actualizados correctamente.",
    status: "success",
  };
}

function emptyClientActivationData(error: string): ClientActivationData {
  return {
    canManageNutrition: false,
    canManageTraining: false,
    clients: [],
    counts: {
      active: 0,
      all: 0,
      both: 0,
      none: 0,
      nutrition: 0,
      nutritionActive: 0,
      pending: 0,
      training: 0,
      trainingActive: 0,
    },
    currentUserId: "",
    error,
    isAdmin: false,
    isProfessional: false,
    nutritionists: [],
    trainers: [],
  };
}

function buildCounts(clients: ClientAccountListItem[]) {
  return {
    active: clients.filter((client) => client.isClientActivated).length,
    all: clients.length,
    both: clients.filter((client) => client.serviceType === "both").length,
    none: clients.filter((client) => !client.isClientActivated).length,
    nutrition: clients.filter((client) => client.serviceType === "nutrition")
      .length,
    nutritionActive: clients.filter((client) => client.hasNutritionService)
      .length,
    pending: clients.filter((client) => !client.isClientActivated).length,
    training: clients.filter((client) => client.serviceType === "training")
      .length,
    trainingActive: clients.filter((client) => client.hasTrainingService)
      .length,
  } satisfies ClientActivationCounts;
}

export async function listClientActivationData(
  rawFilter?: string | null,
  access?: CurrentUserAccess,
): Promise<ClientActivationData> {
  const filter = normalizeFilter(rawFilter);
  const actor = access
    ? await getActivationActorFromAccess(access)
    : await getCurrentActivationActor();

  if (actor.error || !actor.activationSupabase) {
    return emptyClientActivationData(actor.error ?? "No se pudo validar tu sesión.");
  }

  if (!actor.canManageNutrition && !actor.canManageTraining) {
    return emptyClientActivationData(
      "Tu cuenta no puede gestionar planes de nutrición ni entrenamiento.",
    );
  }

  const [
    { data: profileRows, error: profilesError },
    { data: clientAssignments, error: assignmentsError },
    { data: professionalRows, error: professionalsError },
  ] = await Promise.all([
    actor.activationSupabase
      .from("profiles")
      .select("id, full_name, avatar_url, created_at, role")
      .in("role", ["admin", "client", "professional"])
      .order("created_at", { ascending: false }),
    actor.activationSupabase
      .from("client_profiles")
      .select("profile_id, assigned_nutritionist_id, assigned_trainer_id"),
    actor.activationSupabase
      .from("professional_profiles")
      .select("profile_id, specialty, is_active"),
  ]);

  if (profilesError || assignmentsError || professionalsError) {
    return emptyClientActivationData("No se pudo cargar la lista de clientes.");
  }

  const clientProfiles = (profileRows ?? []).filter(
    (profile) => profile.role === "client",
  );
  const professionalProfiles = (profileRows ?? []).filter(
    (profile) => profile.role === "admin" || profile.role === "professional",
  );

  const professionalById = new Map<
    string,
    Pick<
      Tables<"professional_profiles">,
      "is_active" | "profile_id" | "specialty"
    > & {
      specialty: ProfessionalSpecialty;
    }
  >();

  for (const item of professionalRows ?? []) {
    if (item.specialty) {
      professionalById.set(item.profile_id, {
        is_active: item.is_active,
        profile_id: item.profile_id,
        specialty: item.specialty,
      });
    }
  }

  for (const profile of professionalProfiles ?? []) {
    if (profile.role === "admin") {
      professionalById.set(profile.id, {
        is_active: true,
        profile_id: profile.id,
        specialty: "both",
      });
    }
  }

  const professionals = Array.from(professionalById.values());
  const profilesById = await getProfileDirectory(
    [
      ...clientProfiles.map((profile) => profile.id),
      ...professionals.map((professional) => professional.profile_id),
    ],
    {
      includeEmails: true,
      includeProfessionalProfiles: true,
    },
  );
  const professionalNameById = new Map(
    professionals.map((item) => {
      const profile = profilesById.get(item.profile_id);
      return [
        item.profile_id,
        getProfileDisplayName(profile) ?? "Perfil incompleto",
      ];
    }),
  );
  const assignmentsByClientId = new Map(
    (clientAssignments ?? []).map((assignment) => [
      assignment.profile_id,
      assignment,
    ]),
  );
  const assignableProfessionals = professionals
    .map((item) => {
      const profile = profilesById.get(item.profile_id);

      if (
        !profile ||
        !PRIVILEGED_ROLES.has(profile.role) ||
        !item.is_active
      ) {
        return null;
      }

      if (actor.role !== "admin" && item.profile_id !== actor.currentUserId) {
        return null;
      }

      return {
        email: profile.email ?? "",
        fullName: getProfileDisplayName(profile) ?? "Perfil incompleto",
        id: item.profile_id,
        specialty: item.specialty,
      } satisfies AssignableProfessional;
    })
    .filter(Boolean) as AssignableProfessional[];

  const allClients = (clientProfiles ?? []).map((profile) => {
    const profileEntry = profilesById.get(profile.id);
    const assignment = assignmentsByClientId.get(profile.id);
    const assignedNutritionistId =
      assignment?.assigned_nutritionist_id ?? null;
    const assignedTrainerId = assignment?.assigned_trainer_id ?? null;
    const hasNutritionService = assignedNutritionistId !== null;
    const hasTrainingService = assignedTrainerId !== null;

    return {
      assignedNutritionistId,
      assignedNutritionistName: assignedNutritionistId
        ? professionalNameById.get(assignedNutritionistId) ?? null
        : null,
      assignedTrainerId,
      assignedTrainerName: assignedTrainerId
        ? professionalNameById.get(assignedTrainerId) ?? null
        : null,
      avatarUrl: profile.avatar_url,
      clientProfileExists: Boolean(assignment),
      createdAt: profile.created_at,
      email: profileEntry?.email ?? "",
      fullName: getProfileDisplayName(profileEntry) ?? "Perfil incompleto",
      hasNutritionService,
      hasTrainingService,
      id: profile.id,
      isClientActivated: hasNutritionService || hasTrainingService,
      serviceType: getServiceType({
        hasNutritionService,
        hasTrainingService,
      }),
    } satisfies ClientAccountListItem;
  });
  const clientsWithEmails = allClients;
  const professionalsWithEmails = assignableProfessionals;
  const counts = buildCounts(clientsWithEmails);

  return {
    canManageNutrition: actor.canManageNutrition,
    canManageTraining: actor.canManageTraining,
    clients: clientsWithEmails.filter((client) =>
      matchesFilter(client, filter),
    ),
    counts,
    currentUserId: actor.currentUserId,
    isAdmin: actor.role === "admin",
    isProfessional: actor.role === "professional",
    nutritionists: professionalsWithEmails.filter((professional) =>
      isProfessionalAllowedForService(professional.specialty, "nutrition"),
    ),
    trainers: professionalsWithEmails.filter((professional) =>
      isProfessionalAllowedForService(professional.specialty, "training"),
    ),
  };
}

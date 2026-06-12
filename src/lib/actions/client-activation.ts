"use server";

import { revalidatePath } from "next/cache";

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
      error: "Debes iniciar sesion para administrar clientes.",
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
      error: "No se pudo validar tu perfil administrativo.",
      role: null,
    };
  }

  const { data: professionalProfile, error: professionalProfileError } =
    await supabase
      .from("professional_profiles")
      .select("profile_id, specialty")
      .eq("profile_id", user.id)
      .maybeSingle();

  if (!PRIVILEGED_ROLES.has(profile.role) || professionalProfileError) {
    return {
      activationSupabase: supabase,
      canManageNutrition: false,
      canManageTraining: false,
      currentUserId: user.id,
      error: "Tu cuenta no tiene permisos para gestionar planes.",
      role: profile.role,
    };
  }

  const isGeneralAdmin = profile.role === "admin" && !professionalProfile;
  const specialty = professionalProfile?.specialty ?? null;
  const canManageNutrition =
    isGeneralAdmin || isProfessionalAllowedForService(specialty, "nutrition");
  const canManageTraining =
    isGeneralAdmin || isProfessionalAllowedForService(specialty, "training");

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

async function validateAssignableProfessional({
  activationSupabase,
  professionalId,
  service,
}: {
  activationSupabase: ActivationSupabase;
  professionalId: string;
  service: "nutrition" | "training";
}) {
  const [{ data: profile }, { data: professionalProfile }] = await Promise.all([
    activationSupabase
      .from("profiles")
      .select("id, role")
      .eq("id", professionalId)
      .maybeSingle(),
    activationSupabase
      .from("professional_profiles")
      .select("profile_id, specialty")
      .eq("profile_id", professionalId)
      .maybeSingle(),
  ]);

  return Boolean(
    profile &&
      PRIVILEGED_ROLES.has(profile.role) &&
      isProfessionalAllowedForService(
        professionalProfile?.specialty ??
          (profile.role === "admin" ? "both" : null),
        service,
      ),
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
      message: actor.error ?? "No se pudo validar tu sesion.",
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
      message: "La cuenta seleccionada no es un cliente valido.",
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
      message: "No se pudo consultar la activacion actual del cliente.",
      status: "error",
    };
  }

  const nutritionistId = parsed.data.assignedNutritionistId || "";
  const trainerId = parsed.data.assignedTrainerId || "";

  if (actor.canManageNutrition && wantsNutrition && !nutritionistId) {
    return {
      fieldErrors: {
        assignedNutritionistId: "Selecciona un profesional en nutricion.",
      },
      message: "Selecciona un profesional en nutricion para activar el plan.",
      status: "error",
    };
  }

  if (actor.canManageTraining && wantsTraining && !trainerId) {
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
    actor.canManageNutrition &&
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
          "El profesional no tiene especialidad de nutricion.",
      },
      message: "El profesional en nutricion seleccionado no es valido.",
      status: "error",
    };
  }

  if (
    actor.canManageTraining &&
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
      message: "El profesional en entrenamiento seleccionado no es valido.",
      status: "error",
    };
  }

  const assignedNutritionistId = actor.canManageNutrition
    ? wantsNutrition
      ? nutritionistId
      : null
    : existingAssignment?.assigned_nutritionist_id ?? null;
  const assignedTrainerId = actor.canManageTraining
    ? wantsTraining
      ? trainerId
      : null
    : existingAssignment?.assigned_trainer_id ?? null;

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
): Promise<ClientActivationData> {
  const filter = normalizeFilter(rawFilter);
  const actor = await getCurrentActivationActor();

  if (actor.error || !actor.activationSupabase) {
    return emptyClientActivationData(actor.error ?? "No se pudo validar tu sesion.");
  }

  if (!actor.canManageNutrition && !actor.canManageTraining) {
    return emptyClientActivationData(
      "Tu perfil administrativo no tiene permisos de nutricion ni entrenamiento.",
    );
  }

  const [
    { data: clientProfiles, error: clientsError },
    { data: clientAssignments, error: assignmentsError },
    { data: professionalRows, error: professionalsError },
  ] = await Promise.all([
    actor.activationSupabase
      .from("profiles")
      .select("id, full_name, created_at, role")
      .eq("role", "client")
      .order("created_at", { ascending: false }),
    actor.activationSupabase
      .from("client_profiles")
      .select("profile_id, assigned_nutritionist_id, assigned_trainer_id"),
    actor.activationSupabase
      .from("professional_profiles")
      .select("profile_id, specialty"),
  ]);

  if (clientsError || assignmentsError || professionalsError) {
    return emptyClientActivationData("No se pudo cargar la lista de clientes.");
  }

  const professionalById = new Map<
    string,
    Pick<Tables<"professional_profiles">, "profile_id" | "specialty"> & {
      specialty: ProfessionalSpecialty;
    }
  >();

  for (const item of professionalRows ?? []) {
    if (item.specialty) {
      professionalById.set(item.profile_id, {
        profile_id: item.profile_id,
        specialty: item.specialty,
      });
    }
  }

  const { data: professionalProfiles, error: professionalProfilesError } =
    await actor.activationSupabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["admin", "professional"]);

  if (professionalProfilesError) {
    return emptyClientActivationData(
      "No se pudo cargar la lista de profesionales.",
    );
  }

  for (const profile of professionalProfiles ?? []) {
    if (profile.role === "admin" && !professionalById.has(profile.id)) {
      professionalById.set(profile.id, {
        profile_id: profile.id,
        specialty: "both",
      });
    }
  }

  const professionals = Array.from(professionalById.values());
  const profileById = new Map(
    (professionalProfiles ?? []).map((profile) => [profile.id, profile]),
  );
  const professionalNameById = new Map(
    professionals.map((item) => {
      const profile = profileById.get(item.profile_id);
      return [item.profile_id, profile?.full_name ?? "Profesional sin nombre"];
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
      const profile = profileById.get(item.profile_id);

      if (!profile || !PRIVILEGED_ROLES.has(profile.role)) {
        return null;
      }

      return {
        email: "",
        fullName: profile.full_name ?? "Profesional sin nombre",
        id: item.profile_id,
        specialty: item.specialty,
      } satisfies AssignableProfessional;
    })
    .filter(Boolean) as AssignableProfessional[];

  const allClients = (clientProfiles ?? []).map((profile) => {
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
      clientProfileExists: Boolean(assignment),
      createdAt: profile.created_at,
      email: "",
      fullName: profile.full_name ?? "Cliente sin nombre",
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
  const counts = buildCounts(allClients);

  return {
    canManageNutrition: actor.canManageNutrition,
    canManageTraining: actor.canManageTraining,
    clients: allClients.filter((client) => matchesFilter(client, filter)),
    counts,
    currentUserId: actor.currentUserId,
    nutritionists: assignableProfessionals.filter((professional) =>
      isProfessionalAllowedForService(professional.specialty, "nutrition"),
    ),
    trainers: assignableProfessionals.filter((professional) =>
      isProfessionalAllowedForService(professional.specialty, "training"),
    ),
  };
}

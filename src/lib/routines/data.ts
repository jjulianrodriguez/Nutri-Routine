import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { parseRoutineSnapshot } from "@/lib/routines/snapshot";
import { createClient } from "@/lib/supabase/server";
import { parseWorkoutTemplateSnapshot } from "@/lib/workout-templates/snapshot";
import type { Json } from "@/types/database";
import type { ExerciseOption } from "@/types/exercise";
import type {
  AssignableTrainingClient,
  ClientTrainingOverview,
  RoutineAssignmentDetail,
  RoutineAssignmentState,
  RoutineAssignmentSummary,
  RoutineDetail,
  RoutineDifficulty,
  RoutineManagementOverview,
} from "@/types/routine";

function normalizeDifficulty(value: string | null): RoutineDifficulty {
  if (
    value === "beginner" ||
    value === "intermediate" ||
    value === "advanced"
  ) {
    return value;
  }

  return "beginner";
}

function mapExercise(exercise: {
  category: string;
  description: string | null;
  difficulty: string | null;
  exercise_type: string;
  id: string;
  is_active: boolean;
  multimedia_url: string | null;
  muscle_group: string;
  name: string;
}): ExerciseOption {
  return {
    category: exercise.category,
    description: exercise.description,
    difficulty:
      exercise.difficulty === "beginner" ||
      exercise.difficulty === "intermediate" ||
      exercise.difficulty === "advanced"
        ? exercise.difficulty
        : null,
    exerciseType: exercise.exercise_type,
    id: exercise.id,
    isActive: exercise.is_active,
    multimediaUrl: exercise.multimedia_url,
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
  };
}

async function getRoutineIdentifiers(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const { data, error } = await supabase.rpc(
    "list_manageable_routine_identifiers",
  );

  if (error) {
    throw new Error("No se pudieron cargar los identificadores de rutinas.");
  }

  return new Map(
    (data ?? []).map((routine) => [routine.id, routine.identifier]),
  );
}

export async function listExerciseOptions(): Promise<ExerciseOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, name, description, category, difficulty, muscle_group, exercise_type, multimedia_url, is_active",
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error("No se pudo cargar el catalogo de ejercicios.");
  }

  return (data ?? []).map(mapExercise);
}

export async function getRoutineManagementOverview(): Promise<RoutineManagementOverview> {
  const supabase = await createClient();
  const [
    routinesResult,
    relationsResult,
    exercisesResult,
    routineIdentifiers,
  ] = await Promise.all([
    supabase
      .from("routines")
      .select(
        "id, name, description, difficulty, category, target_audience, is_active, creator_id, created_at, updated_at",
      )
      .order("updated_at", { ascending: false }),
    supabase.from("routine_exercises").select("routine_id"),
    supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    getRoutineIdentifiers(supabase),
  ]);

  if (routinesResult.error || relationsResult.error || exercisesResult.error) {
    throw new Error("No se pudo cargar la gestion de rutinas.");
  }

  const routines = routinesResult.data ?? [];
  const creatorIds = [...new Set(routines.map((routine) => routine.creator_id))];
  const creatorsResult =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [], error: null };

  if (creatorsResult.error) {
    throw new Error("No se pudieron cargar los creadores de las rutinas.");
  }

  const creators = new Map(
    (creatorsResult.data ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Profesional",
    ]),
  );
  const exerciseCounts = new Map<string, number>();

  (relationsResult.data ?? []).forEach((relation) => {
    exerciseCounts.set(
      relation.routine_id,
      (exerciseCounts.get(relation.routine_id) ?? 0) + 1,
    );
  });

  return {
    activeCount: routines.filter((routine) => routine.is_active).length,
    exerciseCount: exercisesResult.count ?? 0,
    routines: routines.map((routine) => ({
      category: routine.category,
      createdAt: routine.created_at,
      creatorName: creators.get(routine.creator_id) ?? "Profesional",
      description: routine.description,
      difficulty: normalizeDifficulty(routine.difficulty),
      exerciseCount: exerciseCounts.get(routine.id) ?? 0,
      id: routine.id,
      identifier: routineIdentifiers.get(routine.id) ?? null,
      isActive: routine.is_active,
      name: routine.name,
      targetAudience: routine.target_audience,
      updatedAt: routine.updated_at,
    })),
  };
}

export async function getRoutineDetail(
  routineId: string,
): Promise<RoutineDetail | null> {
  const supabase = await createClient();
  const [routineResult, routineIdentifiers] = await Promise.all([
    supabase
      .from("routines")
      .select(
        "id, name, description, difficulty, category, target_audience, is_active, creator_id, created_at, updated_at",
      )
      .eq("id", routineId)
      .maybeSingle(),
    getRoutineIdentifiers(supabase),
  ]);
  const { data: routine, error: routineError } = routineResult;

  if (routineError) {
    throw new Error("No se pudo cargar la rutina.");
  }

  if (!routine) {
    return null;
  }

  const [relationsResult, creatorResult] = await Promise.all([
    supabase
      .from("routine_exercises")
      .select(
        "id, exercise_id, series, repetitions, rest_seconds, duration_minutes, notes, position",
      )
      .eq("routine_id", routine.id)
      .order("position"),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", routine.creator_id)
      .maybeSingle(),
  ]);

  if (relationsResult.error || creatorResult.error) {
    throw new Error("No se pudo cargar el detalle de la rutina.");
  }

  const relations = relationsResult.data ?? [];
  const exerciseIds = relations.map((relation) => relation.exercise_id);
  const exercisesResult =
    exerciseIds.length > 0
      ? await supabase
          .from("exercises")
          .select(
            "id, name, description, category, difficulty, muscle_group, exercise_type, multimedia_url, is_active",
          )
          .in("id", exerciseIds)
      : { data: [], error: null };

  if (exercisesResult.error) {
    throw new Error("No se pudieron cargar los ejercicios de la rutina.");
  }

  const exercises = new Map(
    (exercisesResult.data ?? []).map((exercise) => [
      exercise.id,
      mapExercise(exercise),
    ]),
  );

  return {
    category: routine.category,
    createdAt: routine.created_at,
    creatorId: routine.creator_id,
    creatorName: creatorResult.data?.full_name ?? "Profesional",
    description: routine.description,
    difficulty: normalizeDifficulty(routine.difficulty),
    exercises: relations.flatMap((relation) => {
      const exercise = exercises.get(relation.exercise_id);

      return exercise
        ? [
            {
              durationMinutes: relation.duration_minutes,
              exercise,
              id: relation.id,
              notes: relation.notes,
              position: relation.position,
              repetitions: relation.repetitions,
              restSeconds: relation.rest_seconds,
              series: relation.series,
            },
          ]
        : [];
    }),
    id: routine.id,
    identifier: routineIdentifiers.get(routine.id) ?? null,
    isActive: routine.is_active,
    name: routine.name,
    targetAudience: routine.target_audience,
    updatedAt: routine.updated_at,
  };
}

function isGeneralAdmin(access: CurrentUserAccess) {
  return access.role === "admin";
}

function getAssignmentState(
  status: "active" | "archived" | "draft",
  startDate: string | null,
  endDate: string | null,
  today: string,
): RoutineAssignmentState {
  if (status === "archived") {
    return "archived";
  }

  if (endDate && endDate < today) {
    return "expired";
  }

  if (startDate && startDate > today) {
    return "upcoming";
  }

  return status === "active" ? "active" : "archived";
}

function getDaysRemaining(
  endDate: string | null,
  state: RoutineAssignmentState,
) {
  if (!endDate || state !== "active") {
    return null;
  }

  const today = new Date();
  const todayUtc = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const [year, month, day] = endDate.split("-").map(Number);
  const endUtc = Date.UTC(year, month - 1, day);

  return Math.max(0, Math.round((endUtc - todayUtc) / 86_400_000));
}

function getTodayDateKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

type AssignmentSummaryRow = {
  created_at: string;
  description: string | null;
  duration_weeks: number | null;
  end_date: string | null;
  id: string;
  routine_id: string | null;
  routine_snapshot: Json | null;
  start_date: string | null;
  status: "active" | "archived" | "draft";
  template_id: string | null;
  template_snapshot: Json | null;
  title: string;
};

function mapAssignmentSummary(
  plan: AssignmentSummaryRow,
  today: string,
): RoutineAssignmentSummary {
  const routineSnapshot = parseRoutineSnapshot(plan.routine_snapshot);
  const state = getAssignmentState(
    plan.status,
    plan.start_date,
    plan.end_date,
    today,
  );

  return {
    assignmentType: plan.template_snapshot
      ? "template"
      : "legacy-training",
    createdAt: plan.created_at,
    daysRemaining: getDaysRemaining(plan.end_date, state),
    description: routineSnapshot?.routine.description ?? plan.description,
    detailAvailable: Boolean(
      plan.template_snapshot ||
        routineSnapshot ||
        plan.routine_id,
    ),
    durationWeeks: plan.duration_weeks,
    endDate: plan.end_date,
    id: plan.id,
    routineId: plan.routine_id,
    startDate: plan.start_date,
    state,
    templateId: plan.template_id,
    title: routineSnapshot?.routine.name ?? plan.title,
  };
}

export async function listAssignableTrainingClients(
  access: CurrentUserAccess,
): Promise<AssignableTrainingClient[]> {
  const supabase = await createClient();
  let clientIds: string[];

  if (isGeneralAdmin(access)) {
    const { data: clientProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "client");

    if (profilesError) {
      throw new Error("No se pudieron cargar los clientes.");
    }

    clientIds = (clientProfiles ?? []).map((profile) => profile.id);
  } else {
    const { data: clientAssignments, error: assignmentsError } = await supabase
      .from("client_profiles")
      .select("profile_id")
      .eq("assigned_trainer_id", access.userId);

    if (assignmentsError) {
      throw new Error("No se pudieron cargar los clientes asignados.");
    }

    clientIds = (clientAssignments ?? []).map(
      (assignment) => assignment.profile_id,
    );
  }

  if (clientIds.length === 0) {
    return [];
  }

  const [profilesResult, plansResult, personalDetailsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", clientIds),
    supabase
      .from("workout_plans")
      .select(
        "id, client_id, routine_id, routine_snapshot, template_id, template_snapshot, title, description, status, start_date, end_date, duration_weeks, created_at",
      )
      .in("client_id", clientIds)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("profile_personal_details")
      .select("profile_id, phone")
      .in("profile_id", clientIds),
  ]);

  if (
    profilesResult.error ||
    plansResult.error ||
    personalDetailsResult.error
  ) {
    throw new Error("No se pudo completar la lista de clientes.");
  }

  const currentAssignmentByClient = new Map<
    string,
    RoutineAssignmentSummary
  >();
  const contactByClient = new Map(
    (personalDetailsResult.data ?? []).map((details) => [
      details.profile_id,
      details.phone,
    ]),
  );
  const today = getTodayDateKey();

  (plansResult.data ?? []).forEach((plan) => {
    if (currentAssignmentByClient.has(plan.client_id)) {
      return;
    }

    currentAssignmentByClient.set(
      plan.client_id,
      mapAssignmentSummary(plan, today),
    );
  });

  return (profilesResult.data ?? [])
    .map((profile) => ({
      avatarUrl: profile.avatar_url,
      contact: contactByClient.get(profile.id) ?? null,
      currentAssignment: currentAssignmentByClient.get(profile.id) ?? null,
      id: profile.id,
      name: profile.full_name ?? "Cliente",
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "es"));
}

export async function getClientTrainingOverview(
  clientId: string,
): Promise<ClientTrainingOverview> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_plans")
    .select(
      "id, routine_id, routine_snapshot, template_id, template_snapshot, title, description, status, start_date, end_date, duration_weeks, created_at",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar tus rutinas asignadas.");
  }

  const routineIds = [
    ...new Set(
      (data ?? []).flatMap((plan) =>
        plan.routine_id ? [plan.routine_id] : [],
      ),
    ),
  ];
  const availableRoutineIds = new Set<string>();

  if (routineIds.length > 0) {
    const { data: availableRoutines, error: routinesError } = await supabase
      .from("routines")
      .select("id")
      .in("id", routineIds);

    if (routinesError) {
      throw new Error("No se pudo verificar el historial de rutinas.");
    }

    (availableRoutines ?? []).forEach((routine) => {
      availableRoutineIds.add(routine.id);
    });
  }

  const planRows = data ?? [];
  const routineSnapshots = planRows.map((plan) =>
    parseRoutineSnapshot(plan.routine_snapshot),
  );
  const today = getTodayDateKey();
  const assignments: RoutineAssignmentSummary[] = planRows.map((plan, index) => {
    const assignment = mapAssignmentSummary(plan, today);

    return {
      ...assignment,
      detailAvailable: assignment.templateId
        ? Boolean(plan.template_snapshot)
        : Boolean(
            routineSnapshots[index] ||
              (assignment.routineId &&
                availableRoutineIds.has(assignment.routineId)),
          ),
      routineId:
        assignment.routineId &&
        availableRoutineIds.has(assignment.routineId)
          ? assignment.routineId
          : null,
    };
  });
  const currentIndex = assignments.findIndex(
    (assignment) =>
      assignment.state === "active" ||
      assignment.state === "expired" ||
      assignment.state === "upcoming",
  );
  const currentAssignment =
    currentIndex >= 0 ? assignments[currentIndex] : null;
  const currentRoutine =
    (currentIndex >= 0
      ? routineSnapshots[currentIndex]?.routine
      : null) ??
    (currentAssignment?.routineId
      ? await getRoutineDetail(currentAssignment.routineId)
      : null);
  const currentTemplate =
    currentIndex >= 0
      ? parseWorkoutTemplateSnapshot(
          planRows[currentIndex]?.template_snapshot ?? null,
        )
      : null;

  return {
    currentAssignment,
    currentRoutine,
    currentTemplate,
    history: assignments.filter((_, index) => index !== currentIndex),
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getRoutineAssignmentDetail(
  assignmentId: string,
  access: CurrentUserAccess,
): Promise<RoutineAssignmentDetail | null> {
  if (!UUID_PATTERN.test(assignmentId)) {
    return null;
  }

  const supabase = await createClient();
  const { data: plan, error } = await supabase
    .from("workout_plans")
    .select(
      "id, client_id, trainer_id, routine_id, routine_snapshot, template_id, template_snapshot, title, description, status, start_date, end_date, duration_weeks, created_at",
    )
    .eq("id", assignmentId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la asignacion de rutina.");
  }

  if (!plan) {
    return null;
  }

  const canReadAssignment = access.isClient
    ? plan.client_id === access.userId
    : access.canManageTraining &&
      (isGeneralAdmin(access) || plan.trainer_id === access.userId);

  if (!canReadAssignment) {
    return null;
  }

  const template = parseWorkoutTemplateSnapshot(plan.template_snapshot);

  if (template) {
    return {
      assignment: mapAssignmentSummary(plan, getTodayDateKey()),
      routine: null,
      routineSource: null,
      template,
    };
  }

  const routineSnapshot = parseRoutineSnapshot(plan.routine_snapshot);

  if (routineSnapshot) {
    return {
      assignment: mapAssignmentSummary(plan, getTodayDateKey()),
      routine: routineSnapshot.routine,
      routineSource: "snapshot",
      template: null,
    };
  }

  const routine = plan.routine_id
    ? await getRoutineDetail(plan.routine_id)
    : null;

  return {
    assignment: mapAssignmentSummary(plan, getTodayDateKey()),
    routine,
    routineSource: routine ? "live" : null,
    template: null,
  };
}

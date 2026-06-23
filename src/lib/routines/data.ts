import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
  getProfileDirectory,
  getProfileDisplayName,
} from "@/lib/auth/profile-directory";
import { normalizeExerciseMultimediaUrls } from "@/lib/exercises/multimedia";
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
  WorkoutDayProgressSummary,
} from "@/types/routine";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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
  multimedia_urls: string[] | null;
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
    multimediaUrls: normalizeExerciseMultimediaUrls(
      exercise.multimedia_urls,
      exercise.multimedia_url,
    ),
    muscleGroup: exercise.muscle_group,
    name: exercise.name,
  };
}

export async function listExerciseOptions(): Promise<ExerciseOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select(
      "id, name, description, category, difficulty, muscle_group, exercise_type, multimedia_url, multimedia_urls, is_active",
    )
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error("No se pudo cargar el catálogo de ejercicios.");
  }

  return (data ?? []).map(mapExercise);
}

export async function getRoutineManagementOverview(): Promise<RoutineManagementOverview> {
  const supabase = await createClient();
  const [routinesResult, relationsResult, exercisesResult] = await Promise.all([
    supabase
      .from("routines")
      .select(
        "id, name, description, difficulty, category, target_audience, is_active, creator_id, created_at, updated_at",
      )
      .order("updated_at", { ascending: false }),
    supabase
      .from("routine_exercises")
      .select("routine_id, exercise_id"),
    supabase
      .from("exercises")
      .select("id, is_active"),
  ]);

  if (routinesResult.error || relationsResult.error || exercisesResult.error) {
    throw new Error("No se pudo cargar la gestión de rutinas.");
  }

  const routines = routinesResult.data ?? [];
  const creatorIds = [...new Set(routines.map((routine) => routine.creator_id))];
  const creators = await getProfileDirectory(creatorIds, {
    includeEmails: true,
    includeProfessionalProfiles: true,
  });
  const exerciseCounts = new Map<string, number>();
  const inactiveExerciseCounts = new Map<string, number>();
  const exerciseStatusById = new Map(
    (exercisesResult.data ?? []).map((exercise) => [
      exercise.id,
      exercise.is_active,
    ]),
  );

  (relationsResult.data ?? []).forEach((relation) => {
    exerciseCounts.set(
      relation.routine_id,
      (exerciseCounts.get(relation.routine_id) ?? 0) + 1,
    );

    if (exerciseStatusById.get(relation.exercise_id) === false) {
      inactiveExerciseCounts.set(
        relation.routine_id,
        (inactiveExerciseCounts.get(relation.routine_id) ?? 0) + 1,
      );
    }
  });

  return {
    activeCount: routines.filter((routine) => routine.is_active).length,
    exerciseCount: (exercisesResult.data ?? []).filter(
      (exercise) => exercise.is_active,
    ).length,
    routines: routines.map((routine) => ({
      category: routine.category,
      createdAt: routine.created_at,
      creatorName:
        getProfileDisplayName(creators.get(routine.creator_id)) ??
        "Perfil incompleto",
      description: routine.description,
      difficulty: normalizeDifficulty(routine.difficulty),
      exerciseCount: exerciseCounts.get(routine.id) ?? 0,
      id: routine.id,
      inactiveExerciseCount:
        inactiveExerciseCounts.get(routine.id) ?? 0,
      isActive: routine.is_active,
      name: routine.name,
      targetAudience: routine.target_audience,
      updatedAt: routine.updated_at,
    })),
  };
}

export async function getRoutineDetails(
  routineIds: string[],
): Promise<Map<string, RoutineDetail>> {
  const uniqueRoutineIds = [...new Set(routineIds.filter(Boolean))];

  if (uniqueRoutineIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const [routinesResult, relationsResult] = await Promise.all([
    supabase
      .from("routines")
      .select(
        "id, name, description, difficulty, category, target_audience, is_active, creator_id, created_at, updated_at",
      )
      .in("id", uniqueRoutineIds),
    supabase
      .from("routine_exercises")
      .select(
        "id, routine_id, exercise_id, series, repetitions, rest_seconds, duration_minutes, notes, position",
      )
      .in("routine_id", uniqueRoutineIds)
      .order("position"),
  ]);

  if (routinesResult.error || relationsResult.error) {
    throw new Error("No se pudieron cargar los entrenamientos.");
  }

  const routines = routinesResult.data ?? [];
  const relations = relationsResult.data ?? [];
  const creatorIds = [
    ...new Set(routines.map((routine) => routine.creator_id)),
  ];
  const exerciseIds = [
    ...new Set(relations.map((relation) => relation.exercise_id)),
  ];
  const [creators, exercisesResult] = await Promise.all([
    getProfileDirectory(creatorIds, {
      includeEmails: true,
      includeProfessionalProfiles: true,
    }),
    exerciseIds.length > 0
      ? supabase
          .from("exercises")
          .select(
            "id, name, description, category, difficulty, muscle_group, exercise_type, multimedia_url, multimedia_urls, is_active",
          )
          .in("id", exerciseIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (exercisesResult.error) {
    throw new Error("No se pudo completar el detalle de los entrenamientos.");
  }
  const exercises = new Map(
    (exercisesResult.data ?? []).map((exercise) => [
      exercise.id,
      mapExercise(exercise),
    ]),
  );
  const relationsByRoutineId = new Map<string, typeof relations>();

  relations.forEach((relation) => {
    const current = relationsByRoutineId.get(relation.routine_id) ?? [];
    current.push(relation);
    relationsByRoutineId.set(relation.routine_id, current);
  });

  return new Map(
    routines.map((routine) => [
      routine.id,
      {
        category: routine.category,
        createdAt: routine.created_at,
        creatorId: routine.creator_id,
        creatorName:
          getProfileDisplayName(creators.get(routine.creator_id)) ??
          "Perfil incompleto",
        description: routine.description,
        difficulty: normalizeDifficulty(routine.difficulty),
        exercises: (relationsByRoutineId.get(routine.id) ?? []).flatMap(
          (relation) => {
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
          },
        ),
        id: routine.id,
        isActive: routine.is_active,
        name: routine.name,
        targetAudience: routine.target_audience,
        updatedAt: routine.updated_at,
      },
    ]),
  );
}

export async function getRoutineDetail(
  routineId: string,
): Promise<RoutineDetail | null> {
  const routines = await getRoutineDetails([routineId]);

  return routines.get(routineId) ?? null;
}

export async function getRoutineManagementStats(): Promise<{
  exerciseCount: number;
  routineCount: number;
}> {
  const supabase = await createClient();
  const [routinesResult, exercisesResult] = await Promise.all([
    supabase
      .from("routines")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("exercises")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  if (routinesResult.error || exercisesResult.error) {
    throw new Error("No se pudieron cargar las estadisticas de entrenamiento.");
  }

  return {
    exerciseCount: exercisesResult.count ?? 0,
    routineCount: routinesResult.count ?? 0,
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

type WorkoutDayProgressRow = {
  completed_at: string | null;
  completed_exercise_ids: string[];
  cycle_day: number;
  id: string;
  workout_date: string;
  workout_plan_id: string;
};

function mapWorkoutDayProgress(
  row: WorkoutDayProgressRow,
): WorkoutDayProgressSummary {
  return {
    completedAt: row.completed_at,
    completedExerciseIds: row.completed_exercise_ids ?? [],
    cycleDay: row.cycle_day,
    id: row.id,
    workoutDate: row.workout_date,
    workoutPlanId: row.workout_plan_id,
  };
}

function getCompletedDayCountMap(
  progressRows: WorkoutDayProgressSummary[],
) {
  const completedDaysByPlan = new Map<string, Set<string>>();

  progressRows.forEach((row) => {
    if (!row.completedAt) {
      return;
    }

    const completedDays =
      completedDaysByPlan.get(row.workoutPlanId) ?? new Set<string>();

    completedDays.add(`${row.workoutDate}:${row.cycleDay}`);
    completedDaysByPlan.set(row.workoutPlanId, completedDays);
  });

  return new Map(
    [...completedDaysByPlan.entries()].map(([planId, days]) => [
      planId,
      days.size,
    ]),
  );
}

async function getCompletedDayCountForPlan(
  supabase: SupabaseServerClient,
  clientId: string,
  workoutPlanId: string,
) {
  const { data, error } = await supabase
    .from("workout_day_progress")
    .select("workout_date, cycle_day")
    .eq("client_id", clientId)
    .eq("workout_plan_id", workoutPlanId)
    .not("completed_at", "is", null);

  if (error) {
    throw new Error("No se pudo cargar el avance del entrenamiento.");
  }

  return new Set(
    (data ?? []).map((row) => `${row.workout_date}:${row.cycle_day}`),
  ).size;
}

function mapAssignmentSummary(
  plan: AssignmentSummaryRow,
  today: string,
  completedDayCount = 0,
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
    completedDayCount,
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
  let clientAssignments: {
    assigned_trainer_id: string | null;
    profile_id: string;
  }[];

  if (isGeneralAdmin(access)) {
    const { data, error } = await supabase
      .from("client_profiles")
      .select("profile_id, assigned_trainer_id")
      .not("assigned_trainer_id", "is", null);

    if (error) {
      throw new Error("No se pudieron cargar los clientes.");
    }

    clientAssignments = data ?? [];
  } else {
    const { data, error } = await supabase
      .from("client_profiles")
      .select("profile_id, assigned_trainer_id")
      .eq("assigned_trainer_id", access.userId);

    if (error) {
      throw new Error("No se pudieron cargar los clientes asignados.");
    }

    clientAssignments = data ?? [];
  }

  const trainerIdByClientId = new Map(
    clientAssignments
      .filter((assignment) => assignment.assigned_trainer_id)
      .map((assignment) => [
        assignment.profile_id,
        assignment.assigned_trainer_id as string,
      ]),
  );
  const clientIds = [...trainerIdByClientId.keys()];

  if (clientIds.length === 0) {
    return [];
  }

  const trainerIds = [...new Set(trainerIdByClientId.values())];
  const [profilesById, plansResult] =
    await Promise.all([
      getProfileDirectory([...clientIds, ...trainerIds], {
        includeEmails: true,
        includeProfessionalProfiles: true,
      }),
      supabase
        .from("workout_plans")
        .select(
          "id, client_id, routine_id, routine_snapshot, template_id, template_snapshot, title, description, status, start_date, end_date, duration_weeks, created_at",
        )
        .in("client_id", clientIds)
        .eq("status", "active")
        .order("created_at", { ascending: false }),
    ]);

  if (plansResult.error) {
    throw new Error("No se pudo completar la lista de clientes.");
  }
  const currentAssignmentByClient = new Map<
    string,
    RoutineAssignmentSummary
  >();
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

  return clientIds
    .map((clientId) => {
      const profile = profilesById.get(clientId);
      const trainerId = trainerIdByClientId.get(clientId) ?? null;

      if (profile?.role !== "client") {
        return null;
      }

      return {
        avatarUrl: profile.avatarUrl,
        assignedTrainerId: trainerId,
        assignedTrainerName: trainerId
          ? getProfileDisplayName(profilesById.get(trainerId))
          : null,
        contact: profile.email,
        currentAssignment: currentAssignmentByClient.get(clientId) ?? null,
        id: clientId,
        name: getProfileDisplayName(profile) ?? "Perfil incompleto",
        trainingPlanStatus: "active" as const,
      } satisfies AssignableTrainingClient;
    })
    .filter((client): client is AssignableTrainingClient => Boolean(client))
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
    throw new Error("No se pudieron cargar tus planes de entrenamiento.");
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
      throw new Error(
        "No se pudo verificar el historial de entrenamientos.",
      );
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
  const planIds = planRows.map((plan) => plan.id);
  const progressResult =
    planIds.length > 0
      ? await supabase
          .from("workout_day_progress")
          .select(
            "id, workout_plan_id, workout_date, cycle_day, completed_exercise_ids, completed_at",
          )
          .eq("client_id", clientId)
          .in("workout_plan_id", planIds)
          .order("workout_date", { ascending: false })
      : { data: [], error: null };

  if (progressResult.error) {
    throw new Error("No se pudo cargar el avance de entrenamiento.");
  }

  const progress = (progressResult.data ?? []).map(mapWorkoutDayProgress);
  const completedDayCountByPlan = getCompletedDayCountMap(progress);
  const assignments: RoutineAssignmentSummary[] = planRows.map((plan, index) => {
    const assignment = mapAssignmentSummary(
      plan,
      today,
      completedDayCountByPlan.get(plan.id) ?? 0,
    );

    return {
      ...assignment,
      detailAvailable: Boolean(
        plan.template_snapshot ||
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
    progress,
    today,
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
    throw new Error("No se pudo cargar la asignación de entrenamiento.");
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

  const completedDayCount = await getCompletedDayCountForPlan(
    supabase,
    plan.client_id,
    plan.id,
  );
  const assignment = mapAssignmentSummary(
    plan,
    getTodayDateKey(),
    completedDayCount,
  );
  const template = parseWorkoutTemplateSnapshot(plan.template_snapshot);

  if (template) {
    return {
      assignment,
      routine: null,
      routineSource: null,
      template,
    };
  }

  const routineSnapshot = parseRoutineSnapshot(plan.routine_snapshot);

  if (routineSnapshot) {
    return {
      assignment,
      routine: routineSnapshot.routine,
      routineSource: "snapshot",
      template: null,
    };
  }

  const routine = plan.routine_id
    ? await getRoutineDetail(plan.routine_id)
    : null;

  return {
    assignment,
    routine,
    routineSource: routine ? "live" : null,
    template: null,
  };
}

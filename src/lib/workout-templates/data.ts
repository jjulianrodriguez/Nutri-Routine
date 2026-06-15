import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getRoutineDetail } from "@/lib/routines/data";
import type {
  AssignableWorkoutTemplate,
  WorkoutTemplateDetail,
  WorkoutTemplateListItem,
} from "@/types/workout-template";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listWorkoutTemplates(): Promise<
  WorkoutTemplateListItem[]
> {
  const supabase = await createClient();
  const { data: templates, error } = await supabase
    .from("workout_templates")
    .select(
      "id, name, description, cycle_days, is_active, creator_id, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar las plantillas.");
  }

  const creatorIds = [
    ...new Set((templates ?? []).map((template) => template.creator_id)),
  ];
  const creatorsResult =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [], error: null };

  if (creatorsResult.error) {
    throw new Error("No se pudieron cargar los creadores de las plantillas.");
  }

  const creatorNames = new Map(
    (creatorsResult.data ?? []).map((creator) => [
      creator.id,
      creator.full_name?.trim() || "Profesional",
    ]),
  );

  return (templates ?? []).map((template) => ({
    createdAt: template.created_at,
    creatorId: template.creator_id,
    creatorName:
      creatorNames.get(template.creator_id) ?? "Profesional",
    cycleDays: template.cycle_days,
    description: template.description,
    id: template.id,
    isActive: template.is_active,
    name: template.name,
    updatedAt: template.updated_at,
  }));
}

export async function listAssignableWorkoutTemplates(): Promise<
  AssignableWorkoutTemplate[]
> {
  const supabase = await createClient();
  const { data: templates, error } = await supabase
    .from("workout_templates")
    .select("id, name, description, cycle_days")
    .eq("is_active", true)
    .order("name");

  if (error) {
    throw new Error("No se pudieron cargar las plantillas disponibles.");
  }

  return (templates ?? []).map((template) => ({
    cycleDays: template.cycle_days,
    description: template.description,
    id: template.id,
    name: template.name,
  }));
}

export async function getWorkoutTemplateDetail(
  templateId: string,
): Promise<WorkoutTemplateDetail | null> {
  if (!UUID_PATTERN.test(templateId)) {
    return null;
  }

  const supabase = await createClient();
  const { data: template, error } = await supabase
    .from("workout_templates")
    .select(
      "id, name, description, cycle_days, is_active, creator_id, created_at, updated_at",
    )
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la plantilla.");
  }

  if (!template) {
    return null;
  }

  const [daysResult, creatorResult] = await Promise.all([
    supabase
      .from("workout_template_days")
      .select("id, day_number, routine_id")
      .eq("template_id", template.id)
      .order("day_number"),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", template.creator_id)
      .maybeSingle(),
  ]);

  if (daysResult.error || creatorResult.error) {
    throw new Error("No se pudo cargar el detalle de la plantilla.");
  }

  const routineIds = [
    ...new Set((daysResult.data ?? []).map((day) => day.routine_id)),
  ];
  const routineEntries = await Promise.all(
    routineIds.map(async (routineId) => [
      routineId,
      await getRoutineDetail(routineId),
    ] as const),
  );
  const routines = new Map(
    routineEntries.filter(
      (
        entry,
      ): entry is readonly [
        string,
        NonNullable<(typeof entry)[1]>,
      ] => entry[1] !== null,
    ),
  );

  return {
    createdAt: template.created_at,
    creatorId: template.creator_id,
    creatorName: creatorResult.data?.full_name?.trim() || "Profesional",
    cycleDays: template.cycle_days,
    days: (daysResult.data ?? []).flatMap((day) => {
      const routine = routines.get(day.routine_id);

      return routine
        ? [
            {
              dayNumber: day.day_number,
              id: day.id,
              routine,
            },
          ]
        : [];
    }),
    description: template.description,
    id: template.id,
    isActive: template.is_active,
    name: template.name,
    updatedAt: template.updated_at,
  };
}

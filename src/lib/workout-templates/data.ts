import "server-only";

import {
 getProfileDirectory,
 getProfileDisplayName,
} from "@/lib/auth/profile-directory";
import { createClient } from "@/lib/supabase/server";
import { getRoutineDetails } from "@/lib/routines/data";
import { parseWorkoutWeekday } from "@/lib/workout-templates/weekdays";
import type {
 AssignableWorkoutTemplate,
 WorkoutTemplateCompleteness,
 WorkoutTemplateDetail,
 WorkoutTemplateListItem,
} from "@/types/workout-template";

const UUID_PATTERN =
 /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const IDENTIFIER_TIMEOUT_MS = 2_500;
const TEMPLATE_IDENTIFIER_WARNING =
 "Las plantillas cargaron, pero no pudimos mostrar sus identificadores internos. Intenta recargar la sección.";

type WorkoutTemplateIdentifierResult = {
 identifiers: Map<string, string | null>;
 warning: string | null;
};

export type WorkoutTemplateListResult = {
 templates: WorkoutTemplateListItem[];
 warning: string | null;
};

export type AssignableWorkoutTemplateListResult = {
 templates: AssignableWorkoutTemplate[];
 warning: string | null;
};

export type WorkoutTemplateDetailResult = {
 template: WorkoutTemplateDetail | null;
 warning: string | null;
};

function timeoutIdentifierLoad() {
 return new Promise<never>((_, reject) => {
 setTimeout(() => {
 reject(new Error("Timeout cargando identificadores de plantillas."));
 }, IDENTIFIER_TIMEOUT_MS);
 });
}

function getCompleteness(
 cycleDays: number,
 assignedDayCount: number,
): WorkoutTemplateCompleteness {
 const normalizedAssignedDayCount = Math.min(
 Math.max(assignedDayCount, 0),
 cycleDays,
 );
 const missingDayCount = Math.max(
 cycleDays - normalizedAssignedDayCount,
 0,
 );

 return {
 assignedDayCount: normalizedAssignedDayCount,
 isComplete: missingDayCount === 0,
 missingDayCount,
 };
}

async function getWorkoutTemplateIdentifiers(
 supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<WorkoutTemplateIdentifierResult> {
 try {
 const { data, error } = await Promise.race([
 supabase.rpc("list_manageable_workout_template_identifiers"),
 timeoutIdentifierLoad(),
 ]);

 if (error) {
 console.warn(
 "[workout-templates] No se pudieron cargar identificadores.",
 error.message,
 );

 return {
 identifiers: new Map(),
 warning: TEMPLATE_IDENTIFIER_WARNING,
 };
 }

 return {
 identifiers: new Map(
 (data ?? []).map((template) => [template.id, template.identifier]),
 ),
 warning: null,
 };
 } catch (error) {
 console.warn(
 "[workout-templates] Carga de identificadores omitida.",
 error instanceof Error ? error.message : error,
 );

 return {
 identifiers: new Map(),
 warning: TEMPLATE_IDENTIFIER_WARNING,
 };
 }
}

export async function getWorkoutTemplateStats(): Promise<{
 activeCount: number;
 totalCount: number;
}> {
 const supabase = await createClient();
 const [totalResult, activeResult] = await Promise.all([
 supabase
 .from("workout_templates")
 .select("id", { count: "exact", head: true }),
 supabase
 .from("workout_templates")
 .select("id", { count: "exact", head: true })
 .eq("is_active", true),
 ]);

 if (totalResult.error || activeResult.error) {
 throw new Error("No se pudieron cargar las estadisticas de plantillas.");
 }

 return {
 activeCount: activeResult.count ?? 0,
 totalCount: totalResult.count ?? 0,
 };
}

export async function listWorkoutTemplatesWithMeta(): Promise<WorkoutTemplateListResult> {
 const supabase = await createClient();
 const [templatesResult, daysResult, identifierResult] = await Promise.all([
 supabase
 .from("workout_templates")
 .select(
 "id, name, description, cycle_days, is_active, creator_id, created_at, updated_at",
 )
 .order("updated_at", { ascending: false }),
 supabase
 .from("workout_template_days")
 .select("template_id"),
 getWorkoutTemplateIdentifiers(supabase),
 ]);
 const { data: templates, error } = templatesResult;

 if (error || daysResult.error) {
 throw new Error("No se pudieron cargar las plantillas.");
 }

 const creatorIds = [
 ...new Set((templates ?? []).map((template) => template.creator_id)),
 ];
 const creatorProfiles = await getProfileDirectory(creatorIds, {
 includeEmails: true,
 includeProfessionalProfiles: true,
 });
 const assignedDayCounts = new Map<string, number>();

 (daysResult.data ?? []).forEach((day) => {
 assignedDayCounts.set(
 day.template_id,
 (assignedDayCounts.get(day.template_id) ?? 0) + 1,
 );
 });

 return {
 templates: (templates ?? []).map((template) => {
 const completeness = getCompleteness(
 template.cycle_days,
 assignedDayCounts.get(template.id) ?? 0,
 );

 return {
 ...completeness,
 createdAt: template.created_at,
 creatorId: template.creator_id,
 creatorName:
 getProfileDisplayName(creatorProfiles.get(template.creator_id)) ??
 "Perfil incompleto",
 cycleDays: template.cycle_days,
 description: template.description,
 id: template.id,
 identifier: identifierResult.identifiers.get(template.id) ?? null,
 isActive: template.is_active,
 name: template.name,
 updatedAt: template.updated_at,
 };
 }),
 warning: identifierResult.warning,
 };
}

export async function listWorkoutTemplates(): Promise<
 WorkoutTemplateListItem[]
> {
 const result = await listWorkoutTemplatesWithMeta();

 return result.templates;
}

export async function listAssignableWorkoutTemplatesWithMeta(): Promise<
 AssignableWorkoutTemplateListResult
> {
 const supabase = await createClient();
 const [templatesResult, daysResult, identifierResult] = await Promise.all([
 supabase
 .from("workout_templates")
 .select("id, name, description, cycle_days")
 .eq("is_active", true)
 .order("name"),
 supabase
 .from("workout_template_days")
 .select("template_id"),
 getWorkoutTemplateIdentifiers(supabase),
 ]);
 const { data: templates, error } = templatesResult;

 if (error || daysResult.error) {
 throw new Error("No se pudieron cargar las plantillas disponibles.");
 }
 const assignedDayCounts = new Map<string, number>();

 (daysResult.data ?? []).forEach((day) => {
 assignedDayCounts.set(
 day.template_id,
 (assignedDayCounts.get(day.template_id) ?? 0) + 1,
 );
 });
 const mappedTemplates = (templates ?? []).map((template) => {
 const completeness = getCompleteness(
 template.cycle_days,
 assignedDayCounts.get(template.id) ?? 0,
 );

 return {
 ...completeness,
 cycleDays: template.cycle_days,
 description: template.description,
 id: template.id,
 identifier: identifierResult.identifiers.get(template.id) ?? null,
 name: template.name,
 };
 });
 const completeTemplates = mappedTemplates.filter(
 (template) => template.isComplete,
 );
 const incompleteCount = mappedTemplates.length - completeTemplates.length;
 const warnings = [
 identifierResult.warning,
 incompleteCount > 0
 ? `${incompleteCount} plantilla${
 incompleteCount === 1 ? "" : "s"
 } activa${
 incompleteCount === 1 ? "" : "s"
 } no aparece${
 incompleteCount === 1 ? "" : "n"
 } para asignar porque tiene días pendientes.`
 : null,
 ].filter(Boolean);

 return {
 templates: completeTemplates,
 warning: warnings.length > 0 ? warnings.join(" ") : null,
 };
}

export async function listAssignableWorkoutTemplates(): Promise<
 AssignableWorkoutTemplate[]
> {
 const result = await listAssignableWorkoutTemplatesWithMeta();

 return result.templates;
}

export async function getWorkoutTemplateDetailWithMeta(
 templateId: string,
): Promise<WorkoutTemplateDetailResult> {
 if (!UUID_PATTERN.test(templateId)) {
 return {
 template: null,
 warning: null,
 };
 }

 const supabase = await createClient();
 const [templateResult, identifierResult] = await Promise.all([
 supabase
 .from("workout_templates")
 .select(
 "id, name, description, cycle_days, is_active, creator_id, created_at, updated_at",
 )
 .eq("id", templateId)
 .maybeSingle(),
 getWorkoutTemplateIdentifiers(supabase),
 ]);
 const { data: template, error } = templateResult;

 if (error) {
 throw new Error("No se pudo cargar la plantilla.");
 }

 if (!template) {
 return {
 template: null,
 warning: identifierResult.warning,
 };
 }

 const [daysResult, creatorProfiles] = await Promise.all([
 supabase
 .from("workout_template_days")
 .select("id, day_number, routine_id, weekday")
 .eq("template_id", template.id)
 .order("day_number"),
 getProfileDirectory([template.creator_id], {
 includeEmails: true,
 includeProfessionalProfiles: true,
 }),
 ]);

 if (daysResult.error) {
 throw new Error("No se pudo cargar el detalle de la plantilla.");
 }

 const routineIds = [
 ...new Set((daysResult.data ?? []).map((day) => day.routine_id)),
 ];
 const routines = await getRoutineDetails(routineIds);
 const resolvedDays = (daysResult.data ?? []).flatMap((day) => {
 const routine = routines.get(day.routine_id);

 return routine
 ? [
 {
 dayNumber: day.day_number,
 id: day.id,
 routine,
 weekday: parseWorkoutWeekday(day.weekday),
 },
 ]
 : [];
 });
 const completeness = getCompleteness(
 template.cycle_days,
 resolvedDays.length,
 );

 return {
 template: {
 ...completeness,
 createdAt: template.created_at,
 creatorId: template.creator_id,
 creatorName:
 getProfileDisplayName(creatorProfiles.get(template.creator_id)) ??
 "Perfil incompleto",
 cycleDays: template.cycle_days,
 days: resolvedDays,
 description: template.description,
 id: template.id,
 identifier: identifierResult.identifiers.get(template.id) ?? null,
 isActive: template.is_active,
 name: template.name,
 updatedAt: template.updated_at,
 },
 warning: identifierResult.warning,
 };
}

export async function getWorkoutTemplateDetail(
 templateId: string,
): Promise<WorkoutTemplateDetail | null> {
 const result = await getWorkoutTemplateDetailWithMeta(templateId);

 return result.template;
}

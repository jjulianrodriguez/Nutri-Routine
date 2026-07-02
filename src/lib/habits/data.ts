import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
 getProfileDirectory,
 getProfileDisplayName,
} from "@/lib/auth/profile-directory";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import {
 getCurrentHabitWeek,
 isAssignmentInDate,
 type HabitAssignmentSummary,
 type HabitClientOption,
 type HabitProgressCell,
 type HabitSummary,
 type HabitWeekDay,
 type HabitWeekStats,
 type NutritionHabitTrackerData,
} from "./utils";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

type HabitRow = Tables<"habits">;
type HabitAssignmentRow = Tables<"habit_assignments">;
type HabitProgressRow = Tables<"habit_progress">;
type ClientProfileRow = Pick<
 Tables<"client_profiles">,
 "assigned_nutritionist_id" | "profile_id"
>;
type AssignmentHabitRow = Pick<
 HabitRow,
 "active" | "created_by" | "description" | "id" | "title"
>;

function logHabitTrackerQueryError(label: string, error: unknown) {
 const e = error as Record<string, unknown> | null;
 const message = typeof e?.message === "string" ? e.message : "Error desconocido";
 
 console.error(`${label}: ${message}`, {
 code: e?.code,
 details: e?.details,
 hint: e?.hint,
 message: e?.message,
 name: e?.name,
 });
}

function normalizeDaysOfWeek(value: number[] | null) {
 const uniqueDays = Array.from(
 new Set((value ?? []).filter((day) => day >= 1 && day <= 7)),
 );

 return uniqueDays.length > 0 ? uniqueDays.sort((a, b) => a - b) : [1, 2, 3, 4, 5, 6, 7];
}

function mapHabit(row: HabitRow): HabitSummary {
 return {
 active: row.active,
 createdBy: row.created_by,
 description: row.description,
 id: row.id,
 title: row.title,
 };
}

function buildStats(
 assignments: HabitAssignmentSummary[],
 weekDays: HabitWeekDay[],
): HabitWeekStats {
 let total = 0;
 let completed = 0;
 const markedDates = new Set<string>();

 for (const assignment of assignments) {
 for (const day of weekDays) {
 if (
 assignment.active &&
 assignment.daysOfWeek.includes(day.dayNumber) &&
 isAssignmentInDate(assignment, day.date)
 ) {
 total += 1;

 if (assignment.progressByDate[day.date]?.completed) {
 completed += 1;
 markedDates.add(day.date);
 }
 }
 }
 }

 return {
 completed,
 markedDays: markedDates.size,
 pending: Math.max(total - completed, 0),
 percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
 total,
 };
}

async function listNutritionClients(
 supabase: ServerSupabase,
 access: CurrentUserAccess,
): Promise<HabitClientOption[]> {
 if (!access.canManageNutrition) {
 return [];
 }

 const query = access.isAdmin
 ? supabase.from("client_profiles").select("profile_id, assigned_nutritionist_id")
 : supabase
 .from("client_profiles")
 .select("profile_id, assigned_nutritionist_id")
 .eq("assigned_nutritionist_id", access.userId);

 const { data, error } = await query;

 if (error) {
 logHabitTrackerQueryError(
 "Error loading nutrition clients for habit tracker",
 error,
 );

 return [];
 }

 const visibleClients = ((data ?? []) as ClientProfileRow[]).filter((client) =>
 access.isAdmin
 ? true
 : client.assigned_nutritionist_id === access.userId,
 );
 const profiles = await getProfileDirectory(
 visibleClients.map((client) => client.profile_id),
 );

 return visibleClients
 .map((client) => ({
 assignedNutritionistId: client.assigned_nutritionist_id,
 fullName:
 getProfileDisplayName(profiles.get(client.profile_id)) ??
 "Perfil incompleto",
 id: client.profile_id,
 }))
 .sort((a, b) => a.fullName.localeCompare(b.fullName, "es"));
}

async function listHabits(
 supabase: ServerSupabase,
 access: CurrentUserAccess,
): Promise<HabitSummary[]> {
 if (!access.canManageNutrition) {
 return [];
 }

 const { data, error } = await supabase
 .from("habits")
 .select("id, title, description, created_by, active")
 .order("active", { ascending: false })
 .order("title", { ascending: true });

 if (error) {
 logHabitTrackerQueryError("Error loading habits for habit tracker", error);

 return [];
 }

 return ((data ?? []) as HabitRow[]).map(mapHabit);
}

async function listHabitsById(
 supabase: ServerSupabase,
 habitIds: string[],
) {
 const uniqueIds = Array.from(new Set(habitIds.filter(Boolean)));

 if (uniqueIds.length === 0) {
 return new Map<string, HabitSummary>();
 }

 const { data, error } = await supabase
 .from("habits")
 .select("id, title, description, created_by, active")
 .in("id", uniqueIds);

 if (error) {
 logHabitTrackerQueryError(
 "Error loading assigned habit details for habit tracker",
 error,
 );

 return new Map<string, HabitSummary>();
 }

 return new Map(
 ((data ?? []) as AssignmentHabitRow[]).map((habit) => [
 habit.id,
 mapHabit(habit as HabitRow),
 ]),
 );
}

async function listAssignmentsForWeek({
 supabase,
 clientId,
 weekEnd,
 weekStart,
}: {
 clientId: string;
 supabase: ServerSupabase;
 weekEnd: string;
 weekStart: string;
}) {
 const { data, error } = await supabase
 .from("habit_assignments")
 .select(
 "id, habit_id, client_id, assigned_by, active, days_of_week, start_date, end_date",
 )
 .eq("client_id", clientId)
 .lte("start_date", weekEnd)
 .or(`end_date.is.null,end_date.gte.${weekStart}`)
 .order("start_date", { ascending: false });

 if (error) {
 logHabitTrackerQueryError(
 "Error loading habit assignments for habit tracker",
 error,
 );

 return [];
 }

 return (data ?? []) as HabitAssignmentRow[];
}

async function listProgressForWeek({
 clientId,
 supabase,
 weekEnd,
 weekStart,
}: {
 clientId: string;
 supabase: ServerSupabase;
 weekEnd: string;
 weekStart: string;
}) {
 const { data, error } = await supabase
 .from("habit_progress")
 .select("id, habit_assignment_id, client_id, date, completed, completed_at")
 .eq("client_id", clientId)
 .gte("date", weekStart)
 .lte("date", weekEnd);

 if (error) {
 logHabitTrackerQueryError(
 "Error loading habit progress for habit tracker",
 error,
 );

 return [];
 }

 return (data ?? []) as Pick<
 HabitProgressRow,
 "client_id" | "completed" | "completed_at" | "date" | "habit_assignment_id" | "id"
 >[];
}

export async function getNutritionHabitTrackerData(
 access: CurrentUserAccess,
 selectedClientId?: string | null,
): Promise<NutritionHabitTrackerData> {
 const supabase = await createClient();
 const week = getCurrentHabitWeek();
 const canManage = access.canManageNutrition;
 const clients = await listNutritionClients(supabase, access);
 const selectedClient = access.isClient
 ? {
 assignedNutritionistId: access.assignedNutritionistId,
 fullName: access.displayName,
 id: access.userId,
 }
 : clients.find((client) => client.id === selectedClientId) ??
 clients[0] ??
 null;
 const targetClientId = access.isClient ? access.userId : selectedClient?.id;
 const [habits, assignmentRows, progressRows] = await Promise.all([
 listHabits(supabase, access),
 targetClientId
 ? listAssignmentsForWeek({
 clientId: targetClientId,
 supabase,
 weekEnd: week.weekEnd,
 weekStart: week.weekStart,
 })
 : Promise.resolve([]),
 targetClientId
 ? listProgressForWeek({
 clientId: targetClientId,
 supabase,
 weekEnd: week.weekEnd,
 weekStart: week.weekStart,
 })
 : Promise.resolve([]),
 ]);
 const assignedHabitsById = await listHabitsById(
 supabase,
 assignmentRows.map((assignment) => assignment.habit_id),
 );
 const progressByAssignment = new Map<string, HabitProgressRow[]>();

 for (const progress of progressRows) {
 const group = progressByAssignment.get(progress.habit_assignment_id) ?? [];
 group.push(progress as HabitProgressRow);
 progressByAssignment.set(progress.habit_assignment_id, group);
 }

 const assignments = assignmentRows
 .map((assignment) => {
 const habit = assignedHabitsById.get(assignment.habit_id);

 if (!habit) {
 return null;
 }

 const progressByDate = Object.fromEntries(
 (progressByAssignment.get(assignment.id) ?? []).map((progress) => [
 progress.date,
 {
 completed: progress.completed,
 completedAt: progress.completed_at,
 id: progress.id,
 } satisfies HabitProgressCell,
 ]),
 );

 return {
 active: assignment.active,
 assignedBy: assignment.assigned_by,
 clientId: assignment.client_id,
 daysOfWeek: normalizeDaysOfWeek(assignment.days_of_week),
 endDate: assignment.end_date,
 habit,
 id: assignment.id,
 progressByDate,
 startDate: assignment.start_date,
 } satisfies HabitAssignmentSummary;
 })
 .filter(Boolean) as HabitAssignmentSummary[];

 return {
 assignments,
 canManage,
 clients,
 currentUserId: access.userId,
 habits,
 selectedClient,
 stats: buildStats(assignments, week.weekDays),
 today: week.today,
 weekDays: week.weekDays,
 weekEnd: week.weekEnd,
 weekStart: week.weekStart,
 };
}

import "server-only";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import {
 getProfileDirectory,
 getProfileDisplayName,
 type ProfileDirectoryEntry,
} from "@/lib/auth/profile-directory";
import {
 AREA_LABELS,
 CALENDAR_AREAS,
 CALENDAR_STATUSES,
 STATUS_LABELS,
 TIME_ZONE,
} from "@/lib/calendar/constants";
import type {
 CalendarArea,
 CalendarClientOption,
 CalendarEventItem,
 CalendarFilters,
 CalendarPageData,
 CalendarProfessionalOption,
 CalendarStatus,
} from "@/lib/calendar/types";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings } from "@/lib/user-settings/data";
import type { Enums, Tables } from "@/types/database";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;
type AppointmentRow = Pick<
 Tables<"appointments">,
 | "area"
 | "client_id"
 | "created_by"
 | "description"
 | "ends_at"
 | "event_type"
 | "id"
 | "professional_id"
 | "starts_at"
 | "status"
 | "title"
>;

type ClientProfileRow = Pick<
 Tables<"client_profiles">,
 "assigned_nutritionist_id" | "assigned_trainer_id" | "profile_id"
>;
type ProfessionalProfileRow = Pick<
 Tables<"professional_profiles">,
 "is_active" | "profile_id" | "specialty"
>;

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function pad(value: number) {
 return String(value).padStart(2, "0");
}

function formatMonthKey(date: Date) {
 return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function normalizeMonth(value?: string | null) {
 if (value && MONTH_PATTERN.test(value)) {
 return value;
 }

 return formatMonthKey(new Date());
}

function addMonths(monthKey: string, amount: number) {
 const [year, month] = monthKey.split("-").map(Number);
 const date = new Date(year, month - 1 + amount, 1);

 return formatMonthKey(date);
}

function getMonthBounds(monthKey: string) {
 const [year, month] = monthKey.split("-").map(Number);
 const start = new Date(year, month - 1, 1);
 const end = new Date(year, month, 1);

 return {
 end,
 start,
 };
}

function getUpcomingBounds() {
 const start = new Date();
 start.setHours(0, 0, 0, 0);

 const end = new Date(start);
 end.setDate(start.getDate() + 90);

 return {
 end,
 start,
 };
}

function getDatePart(value: string, part: Intl.DateTimeFormatPartTypes) {
 return new Intl.DateTimeFormat("en-US", {
 day: "2-digit",
 month: "2-digit",
 timeZone: TIME_ZONE,
 year: "numeric",
 })
 .formatToParts(new Date(value))
 .find((datePart) => datePart.type === part)?.value;
}

function formatDateKey(value: string) {
 const year = getDatePart(value, "year");
 const month = getDatePart(value, "month");
 const day = getDatePart(value, "day");

 return `${year}-${month}-${day}`;
}

function formatTime(value: string | null) {
 if (!value) {
 return null;
 }

 const parts = new Intl.DateTimeFormat("en-US", {
 hour: "2-digit",
 hour12: false,
 minute: "2-digit",
 timeZone: TIME_ZONE,
 }).formatToParts(new Date(value));
 const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
 const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

 return `${hour}:${minute}`;
}

function getManageableAreas(access: CurrentUserAccess): CalendarArea[] {
 if (access.isAdmin) {
 return ["training", "nutrition", "general"];
 }

 const areas: CalendarArea[] = [];

 if (access.canManageTraining) {
 areas.push("training");
 }

 if (access.canManageNutrition) {
 areas.push("nutrition");
 }

 if (access.canManageTraining && access.canManageNutrition) {
 areas.push("general");
 }

 return areas;
}

function normalizeArea(value: string | undefined): CalendarArea | "all" {
 return CALENDAR_AREAS.includes(value as CalendarArea)
 ? (value as CalendarArea)
 : "all";
}

function normalizeStatus(value: string | undefined): CalendarStatus | "all" {
 return CALENDAR_STATUSES.includes(value as CalendarStatus)
 ? (value as CalendarStatus)
 : "all";
}

function normalizeId(value: string | undefined) {
 return /^[0-9a-f-]{36}$/i.test(value ?? "") ? value ?? "" : "";
}

function getServiceAreas(assignment: ClientProfileRow, access: CurrentUserAccess) {
 const areas: CalendarArea[] = [];
 const canUseTraining =
 access.isAdmin || assignment.assigned_trainer_id === access.userId;
 const canUseNutrition =
 access.isAdmin || assignment.assigned_nutritionist_id === access.userId;

 if (assignment.assigned_trainer_id && canUseTraining) {
 areas.push("training");
 }

 if (assignment.assigned_nutritionist_id && canUseNutrition) {
 areas.push("nutrition");
 }

 if (
 assignment.assigned_trainer_id &&
 assignment.assigned_nutritionist_id &&
 canUseTraining &&
 canUseNutrition
 ) {
 areas.push("general");
 }

 return areas;
}

function getServiceSummary(areas: CalendarArea[]) {
 if (areas.includes("general")) {
 return "Nutrición y entrenamiento";
 }

 if (areas.length === 0) {
 return "Sin servicios activos";
 }

 return areas.map((area) => AREA_LABELS[area]).join(", ");
}

async function getProfiles(profileIds: string[]) {
 const uniqueIds = Array.from(new Set(profileIds.filter(Boolean)));

 if (uniqueIds.length === 0) {
 return new Map<string, ProfileDirectoryEntry>();
 }

 return getProfileDirectory(uniqueIds, {
 includeEmails: true,
 includeProfessionalProfiles: true,
 });
}

async function getClientOptions(
 supabase: SupabaseClient,
 access: CurrentUserAccess,
): Promise<CalendarClientOption[]> {
 if (access.isClient || (!access.isAdmin && !access.canManageClientPlans)) {
 return [];
 }

 let query = supabase
 .from("client_profiles")
 .select("profile_id, assigned_nutritionist_id, assigned_trainer_id")
 .order("profile_id", { ascending: true });

 if (!access.isAdmin) {
 const filters = [];

 if (access.canManageNutrition) {
 filters.push(`assigned_nutritionist_id.eq.${access.userId}`);
 }

 if (access.canManageTraining) {
 filters.push(`assigned_trainer_id.eq.${access.userId}`);
 }

 if (filters.length === 0) {
 return [];
 }

 query = query.or(filters.join(","));
 }

 const { data, error } = await query;

 if (error || !data) {
 return [];
 }

 const clientIds = data.map((assignment) => assignment.profile_id);
 const profilesById = await getProfiles(clientIds);

 return data
 .map((assignment) => {
 const availableAreas = getServiceAreas(assignment, access);

 return {
 availableAreas,
 email: profilesById.get(assignment.profile_id)?.email ?? null,
 fullName:
 getProfileDisplayName(profilesById.get(assignment.profile_id)) ??
 "Perfil incompleto",
 id: assignment.profile_id,
 serviceSummary: getServiceSummary(availableAreas),
 };
 })
 .filter((client) => client.availableAreas.length > 0)
 .sort((first, second) => first.fullName.localeCompare(second.fullName));
}

async function getProfessionalOptions(
 supabase: SupabaseClient,
 access: CurrentUserAccess,
): Promise<CalendarProfessionalOption[]> {
 if (access.isClient) {
 return [];
 }

 if (!access.isAdmin) {
 return [
 {
 fullName: access.displayName,
 id: access.userId,
 specialty: access.specialty ?? "both",
 },
 ];
 }

 const [{ data: profiles }, { data: professionalProfiles }] =
 await Promise.all([
 supabase
 .from("profiles")
 .select("id, full_name, role")
 .in("role", ["admin", "professional"]),
 supabase
 .from("professional_profiles")
 .select("profile_id, specialty, is_active"),
 ]);
 const profileById = new Map(
 (professionalProfiles ?? []).map((profile: ProfessionalProfileRow) => [
 profile.profile_id,
 profile,
 ]),
 );
 const profilesById = await getProfiles((profiles ?? []).map((profile) => profile.id));

 return (profiles ?? [])
 .map((profile) => {
 const profileEntry = profilesById.get(profile.id);

 if (profile.role === "admin") {
 return {
 fullName: getProfileDisplayName(profileEntry) ?? "Admin universal",
 id: profile.id,
 specialty: "admin" as const,
 };
 }

 const professional = profileById.get(profile.id);

 if (!professional?.is_active) {
 return null;
 }

 return {
 fullName: getProfileDisplayName(profileEntry) ?? "Perfil incompleto",
 id: profile.id,
 specialty: professional.specialty,
 };
 })
 .filter((option): option is CalendarProfessionalOption => Boolean(option))
 .sort((first, second) => first.fullName.localeCompare(second.fullName));
}

function canManageEvents(access: CurrentUserAccess) {
 return (
 access.isAdmin ||
 (access.isProfessional &&
 access.isProfessionalActive &&
 (access.canManageNutrition || access.canManageTraining))
 );
}

function normalizeFilters({
 access,
 area,
 client,
 month,
 professional,
 status,
}: {
 access: CurrentUserAccess;
 area?: string;
 client?: string;
 month?: string;
 professional?: string;
 status?: string;
}): CalendarFilters {
 return {
 area: access.isClient ? "all" : normalizeArea(area),
 clientId: access.isClient ? "" : normalizeId(client),
 month: normalizeMonth(month),
 professionalId: access.isAdmin ? normalizeId(professional) : "",
 status: access.isClient ? "all" : normalizeStatus(status),
 };
}

async function applyAppointmentFilters<
 Query extends {
 eq: (column: string, value: string) => Query;
 gte: (column: string, value: string) => Query;
 lt: (column: string, value: string) => Query;
 },
>(
 query: Query,
 access: CurrentUserAccess,
 filters: CalendarFilters,
 bounds?: { end: Date; start: Date },
) {
 let nextQuery = query;

 if (bounds) {
 nextQuery = nextQuery
 .gte("starts_at", bounds.start.toISOString())
 .lt("starts_at", bounds.end.toISOString());
 }

 if (access.isClient) {
 return nextQuery.eq("client_id", access.userId);
 }

 if (!access.isAdmin) {
 nextQuery = nextQuery.eq("professional_id", access.userId);
 }

 if (filters.clientId) {
 nextQuery = nextQuery.eq("client_id", filters.clientId);
 }

 if (filters.professionalId && access.isAdmin) {
 nextQuery = nextQuery.eq("professional_id", filters.professionalId);
 }

 if (filters.area !== "all") {
 nextQuery = nextQuery.eq("area", filters.area);
 }

 if (filters.status !== "all") {
 nextQuery = nextQuery.eq("status", filters.status);
 }

 return nextQuery;
}

function toEventItem(
 row: AppointmentRow,
 names: Map<string, ProfileDirectoryEntry>,
): CalendarEventItem {
 return {
 area: row.area,
 clientEmail: names.get(row.client_id)?.email ?? null,
 clientId: row.client_id,
 clientName:
 getProfileDisplayName(names.get(row.client_id)) ?? "Perfil incompleto",
 createdBy: row.created_by,
 dateKey: formatDateKey(row.starts_at),
 description: row.description,
 endsAt: row.ends_at,
 endTime: formatTime(row.ends_at),
 eventType: row.event_type,
 id: row.id,
 professionalId: row.professional_id,
 professionalName:
 getProfileDisplayName(names.get(row.professional_id)) ??
 "Perfil incompleto",
 startsAt: row.starts_at,
 startTime: formatTime(row.starts_at) ?? "00:00",
 status: row.status,
 title: row.title,
 };
}

function getDefaultSelectedDate(monthKey: string, events: CalendarEventItem[]) {
 const today = formatDateKey(new Date().toISOString());

 if (today.startsWith(`${monthKey}-`)) {
 return today;
 }

 return events[0]?.dateKey ?? `${monthKey}-01`;
}

export async function getCalendarPageData(
 access: CurrentUserAccess,
 params: {
 area?: string;
 client?: string;
 month?: string;
 professional?: string;
 status?: string;
 },
): Promise<CalendarPageData> {
 const supabase = await createClient();
 const settings = await getUserSettings(access.userId);
 const filters = normalizeFilters({ access, ...params });
 const monthKey = filters.month;
 const bounds = getMonthBounds(monthKey);
 const upcomingBounds = getUpcomingBounds();
 const rangeBounds = {
 end: getMonthBounds(addMonths(monthKey, 7)).start,
 start: getMonthBounds(addMonths(monthKey, -6)).start,
 };
 const scheduledFilters = {
 ...filters,
 status: "scheduled" as const,
 };

 const [clientOptions, professionalOptions] = await Promise.all([
 getClientOptions(supabase, access),
 getProfessionalOptions(supabase, access),
 ]);

 const rowsQuery = await applyAppointmentFilters(
 supabase
 .from("appointments")
 .select(
 "id, title, description, event_type, area, client_id, professional_id, created_by, starts_at, ends_at, status",
 )
 .order("starts_at", { ascending: true }),
 access,
 filters,
 bounds,
 );
 const monthsQuery = await applyAppointmentFilters(
 supabase
 .from("appointments")
 .select("starts_at")
 .order("starts_at", { ascending: true })
 .limit(250),
 access,
 filters,
 rangeBounds,
 );
 const upcomingQuery = await applyAppointmentFilters(
 supabase
 .from("appointments")
 .select(
 "id, title, description, event_type, area, client_id, professional_id, created_by, starts_at, ends_at, status",
 )
 .order("starts_at", { ascending: true })
 .limit(6),
 access,
 scheduledFilters,
 upcomingBounds,
 );

 const [
 { data: rows, error },
 { data: monthRows },
 { data: upcomingRows },
 ] = await Promise.all([
 rowsQuery,
 monthsQuery,
 upcomingQuery,
 ]);

 if (error || !rows) {
 return {
 canFilter: !access.isClient,
 canManageEvents: canManageEvents(access),
 clientOptions,
 currentUserId: access.userId,
 defaultSelectedDate: `${monthKey}-01`,
 error: "No pudimos cargar los eventos del calendario.",
 eventMonthKeys: [monthKey],
 events: [],
 filters,
 isAdmin: access.isAdmin,
 manageableAreas: getManageableAreas(access),
 monthKey,
 nextMonthKey: addMonths(monthKey, 1),
 previousMonthKey: addMonths(monthKey, -1),
 professionalOptions,
 timeFormat: settings.timeFormat,
 upcomingEvents: [],
 };
 }

 const profileNames = await getProfiles(
 [...rows, ...(upcomingRows ?? [])].flatMap((row) => [
 row.client_id,
 row.professional_id,
 ]),
 );
 const events = rows.map((row) => toEventItem(row, profileNames));
 const upcomingEvents = (upcomingRows ?? []).map((row) =>
 toEventItem(row, profileNames),
 );
 const eventMonthKeys = Array.from(
 new Set(
 (monthRows ?? []).map((row) => formatDateKey(row.starts_at).slice(0, 7)),
 ),
 );

 if (!eventMonthKeys.includes(monthKey)) {
 eventMonthKeys.push(monthKey);
 }

 return {
 canFilter: !access.isClient,
 canManageEvents: canManageEvents(access),
 clientOptions,
 currentUserId: access.userId,
 defaultSelectedDate: getDefaultSelectedDate(monthKey, events),
 error: null,
 eventMonthKeys: eventMonthKeys.sort(),
 events,
 filters,
 isAdmin: access.isAdmin,
 manageableAreas: getManageableAreas(access),
 monthKey,
 nextMonthKey: addMonths(monthKey, 1),
 previousMonthKey: addMonths(monthKey, -1),
 professionalOptions,
 timeFormat: settings.timeFormat,
 upcomingEvents,
 };
}

export function getStatusLabel(status: Enums<"appointment_status">) {
 return STATUS_LABELS[status];
}

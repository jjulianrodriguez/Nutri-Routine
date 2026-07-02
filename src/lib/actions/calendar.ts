"use server";

import { revalidatePath } from "next/cache";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";
import { getCurrentUserAccess } from "@/lib/auth/current-user-access";
import type { CalendarArea } from "@/lib/calendar/types";
import { createClient } from "@/lib/supabase/server";
import {
 calendarDeleteSchema,
 calendarEventValuesSchema,
 calendarUpdateValuesSchema,
 combineLocalDateTime,
 type CalendarEventValues,
} from "@/lib/validations/calendar";
import type { Database, Enums } from "@/types/database";

const CALENDAR_PATH = "/app/calendario";
const DASHBOARD_PATH = "/app/dashboard";
const NOTIFICATIONS_PATH = "/app/notificaciones";

type CalendarFieldErrors = Partial<Record<keyof CalendarEventValues, string>>;
type CalendarSupabase = Awaited<ReturnType<typeof createClient>>;
type ProfessionalSpecialty = Enums<"professional_specialty">;
type SupabaseMutationError = {
 code?: string;
 details?: string | null;
 hint?: string | null;
 message?: string;
};

export type CalendarActionResult =
 | {
 id?: string;
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: CalendarFieldErrors;
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
 ) as CalendarFieldErrors;
}

function revalidateCalendarPaths() {
 revalidatePath(CALENDAR_PATH);
 revalidatePath(DASHBOARD_PATH);
 revalidatePath(NOTIFICATIONS_PATH);
 revalidatePath("/app", "layout");
}

function canManageArea(access: CurrentUserAccess, area: CalendarArea) {
 if (access.isAdmin) {
 return true;
 }

 if (area === "general") {
 return access.canManageNutrition && access.canManageTraining;
 }

 if (area === "nutrition") {
 return access.canManageNutrition;
 }

 return access.canManageTraining;
}

function specialtyAllowsArea(
 specialty: ProfessionalSpecialty | null,
 area: CalendarArea,
) {
 if (area === "general") {
 return specialty === "both";
 }

 return specialty === area || specialty === "both";
}

function getCalendarErrorMessage(code?: string) {
 if (code === "42501") {
 return "No tienes permisos para gestionar este evento.";
 }

 if (code === "23503") {
 return "El cliente o profesional seleccionado no está disponible.";
 }

 if (code === "23514") {
 return "Revisa la fecha, hora y titulo del evento.";
 }

 return "No se pudo guardar el evento. Inténtalo de nuevo.";
}

function logCalendarMutationError(
 action: "create" | "delete" | "update",
 error: SupabaseMutationError | null | undefined,
) {
 if (!error) {
 return;
 }

 console.error(`[calendar:${action}] Supabase mutation failed`, {
 code: error.code,
 details: error.details,
 hint: error.hint,
 message: error.message,
 });
}

async function getCalendarManagerContext() {
 const supabase = await createClient();
 const access = await getCurrentUserAccess();

 if (!access) {
 return {
 access: null,
 error: "Debes iniciar sesión para gestionar el calendario.",
 supabase,
 };
 }

 const canManage =
 access.isAdmin ||
 (access.isProfessional &&
 access.isProfessionalActive &&
 (access.canManageNutrition || access.canManageTraining));

 if (!canManage) {
 return {
 access: null,
 error: "No tienes permisos para crear o modificar eventos.",
 supabase,
 };
 }

 return {
 access,
 error: null,
 supabase,
 };
}

async function validateClientAssignment({
 access,
 area,
 clientId,
 supabase,
}: {
 access: CurrentUserAccess;
 area: CalendarArea;
 clientId: string;
 supabase: CalendarSupabase;
}) {
 const [{ data: client }, { data: assignment, error: assignmentError }] =
 await Promise.all([
 supabase
 .from("profiles")
 .select("id, role")
 .eq("id", clientId)
 .maybeSingle(),
 supabase
 .from("client_profiles")
 .select("assigned_nutritionist_id, assigned_trainer_id")
 .eq("profile_id", clientId)
 .maybeSingle(),
 ]);

 if (!client || client.role !== "client") {
 return "Selecciona una cuenta de cliente válida.";
 }

 if (access.isAdmin) {
 return null;
 }

 if (assignmentError || !assignment) {
 return "El cliente seleccionado no está asignado a tu cuenta.";
 }

 if (
 area === "nutrition" &&
 assignment.assigned_nutritionist_id !== access.userId
 ) {
 return "Solo puedes crear eventos de nutrición para tus clientes asignados.";
 }

 if (area === "training" && assignment.assigned_trainer_id !== access.userId) {
 return "Solo puedes crear eventos de entrenamiento para tus clientes asignados.";
 }

 if (
 area === "general" &&
 (assignment.assigned_nutritionist_id !== access.userId ||
 assignment.assigned_trainer_id !== access.userId)
 ) {
 return "Para eventos de ambas áreas el cliente debe estar asignado a ti en nutrición y entrenamiento.";
 }

 return null;
}

async function validateProfessional({
 access,
 area,
 professionalId,
 supabase,
}: {
 access: CurrentUserAccess;
 area: CalendarArea;
 professionalId: string;
 supabase: CalendarSupabase;
}) {
 if (!access.isAdmin) {
 return professionalId === access.userId
 ? null
 : "Solo puedes crear eventos con tu cuenta profesional.";
 }

 const { data: profile } = await supabase
 .from("profiles")
 .select("id, role")
 .eq("id", professionalId)
 .maybeSingle();

 if (!profile) {
 return "Selecciona un profesional válido.";
 }

 if (profile.role === "admin") {
 return null;
 }

 if (profile.role !== "professional") {
 return "El perfil seleccionado no puede asignarse como profesional.";
 }

 const { data: professional } = await supabase
 .from("professional_profiles")
 .select("profile_id, specialty, is_active")
 .eq("profile_id", professionalId)
 .maybeSingle();

 if (!professional?.is_active) {
 return "El profesional seleccionado esta inactivo.";
 }

 if (!specialtyAllowsArea(professional.specialty, area)) {
 return "El profesional seleccionado no cubre el área del evento.";
 }

 return null;
}

async function validateCalendarMutation({
 access,
 clientId,
 area,
 professionalId,
 supabase,
}: {
 access: CurrentUserAccess;
 area: CalendarArea;
 clientId: string;
 professionalId: string;
 supabase: CalendarSupabase;
}) {
 if (!canManageArea(access, area)) {
 return {
 field: "area" as const,
 message: "No tienes permisos para gestionar eventos en esta área.",
 };
 }

 const clientError = await validateClientAssignment({
 access,
 area,
 clientId,
 supabase,
 });

 if (clientError) {
 return {
 field: "clientId" as const,
 message: clientError,
 };
 }

 const professionalError = await validateProfessional({
 access,
 area,
 professionalId,
 supabase,
 });

 if (professionalError) {
 return {
 field: "professionalId" as const,
 message: professionalError,
 };
 }

 return null;
}

function buildAppointmentPayload(
 values: CalendarEventValues,
 access: CurrentUserAccess,
) {
 const startsAt = combineLocalDateTime(values.date, values.startTime);
 const endsAt = values.endTime
 ? combineLocalDateTime(values.date, values.endTime)
 : null;
 const professionalId = access.isAdmin
 ? values.professionalId
 : access.userId;

 return {
 area: values.area,
 client_id: values.clientId,
 created_by: access.userId,
 description: values.description || null,
 ends_at: endsAt ? endsAt.toISOString() : null,
 event_type: values.eventType,
 professional_id: professionalId,
 starts_at: startsAt.toISOString(),
 status: values.status,
 title: values.title,
 } satisfies Database["public"]["Tables"]["appointments"]["Insert"];
}

export async function createCalendarEvent(
 values: CalendarEventValues,
): Promise<CalendarActionResult> {
 const parsed = calendarEventValuesSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const context = await getCalendarManagerContext();

 if (context.error || !context.access) {
 return {
 message: context.error ?? "No se pudo validar tu sesión.",
 status: "error",
 };
 }

 const professionalId = context.access.isAdmin
 ? parsed.data.professionalId
 : context.access.userId;

 if (!professionalId) {
 return {
 fieldErrors: {
 professionalId: "Selecciona un profesional.",
 },
 message: "Selecciona un profesional para el evento.",
 status: "error",
 };
 }

 const validationError = await validateCalendarMutation({
 access: context.access,
 area: parsed.data.area,
 clientId: parsed.data.clientId,
 professionalId,
 supabase: context.supabase,
 });

 if (validationError) {
 return {
 fieldErrors: {
 [validationError.field]: validationError.message,
 },
 message: validationError.message,
 status: "error",
 };
 }

 const { data, error } = await context.supabase
 .from("appointments")
 .insert(buildAppointmentPayload(parsed.data, context.access))
 .select("id")
 .single();

 if (error || !data) {
 logCalendarMutationError("create", error);

 return {
 message: getCalendarErrorMessage(error?.code),
 status: "error",
 };
 }

 revalidateCalendarPaths();

 return {
 id: data.id,
 message: "Evento creado correctamente.",
 status: "success",
 };
}

export async function updateCalendarEvent(
 values: CalendarEventValues & { id: string },
): Promise<CalendarActionResult> {
 const parsed = calendarUpdateValuesSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const context = await getCalendarManagerContext();

 if (context.error || !context.access) {
 return {
 message: context.error ?? "No se pudo validar tu sesión.",
 status: "error",
 };
 }

 const professionalId = context.access.isAdmin
 ? parsed.data.professionalId
 : context.access.userId;

 if (!professionalId) {
 return {
 fieldErrors: {
 professionalId: "Selecciona un profesional.",
 },
 message: "Selecciona un profesional para el evento.",
 status: "error",
 };
 }

 const validationError = await validateCalendarMutation({
 access: context.access,
 area: parsed.data.area,
 clientId: parsed.data.clientId,
 professionalId,
 supabase: context.supabase,
 });

 if (validationError) {
 return {
 fieldErrors: {
 [validationError.field]: validationError.message,
 },
 message: validationError.message,
 status: "error",
 };
 }

 const payload = buildAppointmentPayload(parsed.data, context.access);
 const { data, error } = await context.supabase
 .from("appointments")
 .update({
 area: payload.area,
 client_id: payload.client_id,
 description: payload.description,
 ends_at: payload.ends_at,
 event_type: payload.event_type,
 professional_id: payload.professional_id,
 starts_at: payload.starts_at,
 status: payload.status,
 title: payload.title,
 })
 .eq("id", parsed.data.id)
 .select("id")
 .maybeSingle();

 if (error || !data) {
 logCalendarMutationError("update", error);

 return {
 message: getCalendarErrorMessage(error?.code),
 status: "error",
 };
 }

 revalidateCalendarPaths();

 return {
 id: data.id,
 message: "Evento actualizado correctamente.",
 status: "success",
 };
}

export async function deleteCalendarEvent(
 id: string,
): Promise<CalendarActionResult> {
 const parsed = calendarDeleteSchema.safeParse({ id });

 if (!parsed.success) {
 return {
 message: "El evento seleccionado no es válido.",
 status: "error",
 };
 }

 const context = await getCalendarManagerContext();

 if (context.error || !context.access) {
 return {
 message: context.error ?? "No se pudo validar tu sesión.",
 status: "error",
 };
 }

 const { data, error } = await context.supabase
 .from("appointments")
 .delete()
 .eq("id", parsed.data.id)
 .select("id")
 .maybeSingle();

 if (error || !data) {
 logCalendarMutationError("delete", error);

 return {
 message:
 error?.code === "42501"
 ? "No tienes permisos para eliminar este evento."
 : "No se pudo eliminar el evento.",
 status: "error",
 };
 }

 revalidateCalendarPaths();

 return {
 id: data.id,
 message: "Evento eliminado correctamente.",
 status: "success",
 };
}

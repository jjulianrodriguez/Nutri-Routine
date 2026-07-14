"use server";

import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth/authenticated-user";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
 createProfessionalAccountSchema,
 professionalIdSchema,
 updateProfessionalAccountSchema,
 type CreateProfessionalAccountValues,
 type ProfessionalSpecialty,
 type UpdateProfessionalAccountValues,
} from "@/lib/validations/professional-accounts";

const CONFIGURATION_PATH = "/app/configuracion";
const PROFESSIONAL_ACCOUNTS_PATH = "/app/configuracion/profesionales";

type ProfessionalAccountFieldErrors = Partial<
 Record<keyof CreateProfessionalAccountValues, string>
>;
type UpdateProfessionalAccountFieldErrors = Partial<
 Record<keyof UpdateProfessionalAccountValues, string>
>;

export type CreateProfessionalAccountResult =
 | {
 createdUserId: string;
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: ProfessionalAccountFieldErrors;
 message: string;
 status: "error";
 };

export type ProfessionalAccountListItem = {
 assignedNutritionClients: number;
 assignedTrainingClients: number;
 bio: string;
 createdAt: string;
 email: string;
 fullName: string;
 id: string;
 isActive: boolean;
 specialty: ProfessionalSpecialty;
 updatedAt: string;
};

export type ProfessionalAccountListResult = {
 error?: string;
 items: ProfessionalAccountListItem[];
};

export type ProfessionalAccountDetailResult = {
 error?: string;
 item: ProfessionalAccountListItem | null;
};

export type ProfessionalAccountMutationResult =
 | {
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: UpdateProfessionalAccountFieldErrors;
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
 ) as ProfessionalAccountFieldErrors;
}

function getUpdateFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as UpdateProfessionalAccountFieldErrors;
}

function isValidAccessCode(candidate: string, expected: string) {
 const candidateBuffer = Buffer.from(candidate);
 const expectedBuffer = Buffer.from(expected);

 return (
 candidateBuffer.length === expectedBuffer.length &&
 timingSafeEqual(candidateBuffer, expectedBuffer)
 );
}

function getAdminAuthErrorMessage(message: string, code?: string) {
 const normalized = `${code ?? ""} ${message}`.toLowerCase();

 if (
 normalized.includes("already") ||
 normalized.includes("exists") ||
 normalized.includes("registered")
 ) {
 return "Ya existe una cuenta con este email.";
 }

 if (normalized.includes("password")) {
 return "La contraseña temporal no cumple los requisitos de seguridad.";
 }

 if (normalized.includes("email")) {
 return "El email no pudo usarse para crear la cuenta.";
 }

 return "No se pudo crear la cuenta profesional. Inténtalo de nuevo.";
}

function isProfessionalSpecialty(
 specialty: unknown,
): specialty is ProfessionalSpecialty {
 return (
 specialty === "nutrition" ||
 specialty === "training" ||
 specialty === "both"
 );
}

async function getCurrentUniversalAdminProfile() {
 const supabase = await createClient();
 const user = await getAuthenticatedUser(supabase);

 if (!user) {
 return {
 error: "Debes iniciar sesión para crear cuentas profesionales.",
 profile: null,
 user: null,
 };
 }

 const { data: profile, error: profileError } = await supabase
 .from("profiles")
 .select("id, role")
 .eq("id", user.id)
 .maybeSingle();

 if (profileError) {
 return {
 error: "No se pudo validar tu perfil actual.",
 profile: null,
 user,
 };
 }

 if (!profile) {
 return {
 error: "Tu usuario no tiene un perfil asociado.",
 profile: null,
 user,
 };
 }

 if (profile.role !== "admin") {
 return {
 error:
 "Solo la cuenta administradora universal puede gestionar cuentas profesionales.",
 profile: null,
 user,
 };
 }

 return {
 error: null,
 profile,
 user,
 };
}

async function deleteCreatedUser(userId: string) {
 try {
 await createAdminClient().auth.admin.deleteUser(userId);
 } catch {
 // The user creation flow reports the original database error.
 }
}

export async function createProfessionalAccount(
 values: CreateProfessionalAccountValues,
): Promise<CreateProfessionalAccountResult> {
 const parsed = createProfessionalAccountSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const privilegedContext = await getCurrentUniversalAdminProfile();

 if (privilegedContext.error) {
 return {
 message: privilegedContext.error,
 status: "error",
 };
 }

 const expectedAdminCode =
 process.env.PROFESSIONAL_REGISTER_ACCESS_CODE?.trim();

 if (!expectedAdminCode) {
 return {
 message:
 "La creación de cuentas profesionales no está disponible en este momento.",
 status: "error",
 };
 }

 if (!isValidAccessCode(parsed.data.adminAccessCode, expectedAdminCode)) {
 return {
 fieldErrors: {
 adminAccessCode: "Código administrativo inválido.",
 },
 message: "Código administrativo inválido.",
 status: "error",
 };
 }

 if (!hasSupabaseAdminConfig()) {
 return {
 message:
 "La creación de cuentas profesionales no está disponible en este momento.",
 status: "error",
 };
 }

 const adminSupabase = createAdminClient();
 const { data: authData, error: authError } =
 await adminSupabase.auth.admin.createUser({
 email: parsed.data.email,
 email_confirm: true,
 password: parsed.data.temporaryPassword,
 user_metadata: {
 full_name: parsed.data.fullName,
 },
 });

 if (authError) {
 return {
 message: getAdminAuthErrorMessage(authError.message, authError.code),
 status: "error",
 };
 }

 const createdUser = authData.user;

 if (!createdUser) {
 return {
 message: "No se pudo completar la creación de la cuenta profesional.",
 status: "error",
 };
 }

 const { error: profileError } = await adminSupabase.from("profiles").upsert(
 {
 full_name: parsed.data.fullName,
 id: createdUser.id,
 role: "professional",
 },
 {
 onConflict: "id",
 },
 );

 if (profileError) {
 await deleteCreatedUser(createdUser.id);

 return {
 message: "No se pudo completar la configuración de la cuenta profesional.",
 status: "error",
 };
 }

 const { error: professionalProfileError } = await adminSupabase
 .from("professional_profiles")
 .upsert(
 {
 profile_id: createdUser.id,
 is_active: true,
 specialty: parsed.data.specialty,
 },
 {
 onConflict: "profile_id",
 },
 );

 if (professionalProfileError) {
 await deleteCreatedUser(createdUser.id);

 return {
 message: "No se pudo guardar el área profesional seleccionada.",
 status: "error",
 };
 }

 revalidatePath(CONFIGURATION_PATH);
 revalidatePath(PROFESSIONAL_ACCOUNTS_PATH);

 return {
 createdUserId: createdUser.id,
 message: "Cuenta profesional creada correctamente.",
 status: "success",
 };
}

export async function listProfessionalAccounts(): Promise<ProfessionalAccountListResult> {
 const privilegedContext = await getCurrentUniversalAdminProfile();

 if (privilegedContext.error) {
 return {
 error: privilegedContext.error,
 items: [],
 };
 }

 if (!hasSupabaseAdminConfig()) {
 return {
 error: "La lista de profesionales no está disponible en este momento.",
 items: [],
 };
 }

 const adminSupabase = createAdminClient();
 const { data: professionalProfiles, error: professionalProfilesError } =
 await adminSupabase
 .from("professional_profiles")
 .select(
 "profile_id, specialty, bio, is_active, created_at, updated_at",
 )
 .order("created_at", { ascending: false });

 if (professionalProfilesError) {
 return {
 error: "No se pudo cargar la lista de profesionales.",
 items: [],
 };
 }

 const allProfessionalRows = professionalProfiles ?? [];
 const professionalRows = allProfessionalRows.filter(
 (
 item,
 ): item is (typeof allProfessionalRows)[number] & {
 specialty: ProfessionalSpecialty;
 } => isProfessionalSpecialty(item.specialty),
 );
 const profileIds = professionalRows.map((item) => item.profile_id);

 if (profileIds.length === 0) {
 return {
 items: [],
 };
 }

 const [
 { data: profiles, error: profilesError },
 { data: authUsers },
 { data: nutritionAssignmentRows, error: nutritionAssignmentsError },
 { data: trainingAssignmentRows, error: trainingAssignmentsError },
 ] =
 await Promise.all([
 adminSupabase
 .from("profiles")
 .select("id, full_name, role")
 .in("id", profileIds),
 adminSupabase.auth.admin.listUsers({
 page: 1,
 perPage: 1000,
 }),
 adminSupabase
 .from("client_profiles")
 .select("assigned_nutritionist_id")
 .in("assigned_nutritionist_id", profileIds),
 adminSupabase
 .from("client_profiles")
 .select("assigned_trainer_id")
 .in("assigned_trainer_id", profileIds),
 ]);

 if (profilesError || nutritionAssignmentsError || trainingAssignmentsError) {
 return {
 error: "No se pudieron cargar los perfiles profesionales.",
 items: [],
 };
 }

 const emailsById = new Map(
 (authUsers?.users ?? []).map((user) => [user.id, user.email ?? ""]),
 );
 const profilesById = new Map(
 profiles
 .filter((profile) => profile.role === "professional")
 .map((profile) => [
 profile.id,
 profile.full_name?.trim() ||
 emailsById.get(profile.id) ||
 "Perfil incompleto",
 ]),
 );
 const nutritionAssignments = new Map<string, number>();
 const trainingAssignments = new Map<string, number>();

 for (const assignment of nutritionAssignmentRows ?? []) {
 if (assignment.assigned_nutritionist_id) {
 nutritionAssignments.set(
 assignment.assigned_nutritionist_id,
 (nutritionAssignments.get(assignment.assigned_nutritionist_id) ?? 0) + 1,
 );
 }
 }

 for (const assignment of trainingAssignmentRows ?? []) {
 if (assignment.assigned_trainer_id) {
 trainingAssignments.set(
 assignment.assigned_trainer_id,
 (trainingAssignments.get(assignment.assigned_trainer_id) ?? 0) + 1,
 );
 }
 }

 return {
 items: professionalRows
 .filter((item) => profilesById.has(item.profile_id))
 .map((item) => ({
 assignedNutritionClients:
 nutritionAssignments.get(item.profile_id) ?? 0,
 assignedTrainingClients:
 trainingAssignments.get(item.profile_id) ?? 0,
 bio: item.bio ?? "",
 createdAt: item.created_at,
 email: emailsById.get(item.profile_id) ?? "",
 fullName: profilesById.get(item.profile_id) ?? "Perfil incompleto",
 id: item.profile_id,
 isActive: item.is_active,
 specialty: item.specialty,
 updatedAt: item.updated_at,
 })),
 };
}

export async function getProfessionalAccount(
 professionalId: string,
): Promise<ProfessionalAccountDetailResult> {
 const parsedId = professionalIdSchema.safeParse(professionalId);

 if (!parsedId.success) {
 return {
 error: parsedId.error.issues[0]?.message,
 item: null,
 };
 }

 const result = await listProfessionalAccounts();

 if (result.error) {
 return {
 error: result.error,
 item: null,
 };
 }

 const item = result.items.find(
 (professional) => professional.id === parsedId.data,
 );

 return item
 ? { item }
 : {
 error: "La cuenta profesional no existe.",
 item: null,
 };
}

function getProfessionalUpdateError(code?: string, message?: string) {
 if (code === "23514") {
 if (message?.includes("nutricion")) {
 return "Reasigna primero los clientes de nutrición antes de cambiar la especialidad.";
 }

 if (message?.includes("entrenamiento")) {
 return "Reasigna primero los clientes de entrenamiento antes de cambiar la especialidad.";
 }
 }

 return "No se pudo actualizar la cuenta profesional.";
}

export async function updateProfessionalAccount(
 values: UpdateProfessionalAccountValues,
): Promise<ProfessionalAccountMutationResult> {
 const parsed = updateProfessionalAccountSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getUpdateFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const privilegedContext = await getCurrentUniversalAdminProfile();

 if (privilegedContext.error) {
 return {
 message: privilegedContext.error,
 status: "error",
 };
 }

 if (!hasSupabaseAdminConfig()) {
 return {
 message: "La gestión de profesionales no está disponible.",
 status: "error",
 };
 }

 const adminSupabase = createAdminClient();
 const { data: targetProfile } = await adminSupabase
 .from("profiles")
 .select("id, role")
 .eq("id", parsed.data.professionalId)
 .maybeSingle();

 if (targetProfile?.role !== "professional") {
 return {
 message: "La cuenta indicada no es una cuenta profesional gestionable.",
 status: "error",
 };
 }

 const { error: professionalError } = await adminSupabase
 .from("professional_profiles")
 .update({
 bio: parsed.data.bio || null,
 specialty: parsed.data.specialty,
 })
 .eq("profile_id", parsed.data.professionalId);

 if (professionalError) {
 return {
 message: getProfessionalUpdateError(
 professionalError.code,
 professionalError.message,
 ),
 status: "error",
 };
 }

 const { error: profileError } = await adminSupabase
 .from("profiles")
 .update({ full_name: parsed.data.fullName })
 .eq("id", parsed.data.professionalId);

 if (profileError) {
 return {
 message: "La especialidad se actualizo, pero no se pudo guardar el nombre.",
 status: "error",
 };
 }

 revalidatePath(CONFIGURATION_PATH);
 revalidatePath(PROFESSIONAL_ACCOUNTS_PATH);
 revalidatePath(`${PROFESSIONAL_ACCOUNTS_PATH}/${parsed.data.professionalId}`);

 return {
 message: "Cuenta profesional actualizada correctamente.",
 status: "success",
 };
}

export async function setProfessionalActive(
 professionalId: string,
 isActive: boolean,
): Promise<ProfessionalAccountMutationResult> {
 const parsedId = professionalIdSchema.safeParse(professionalId);

 if (!parsedId.success) {
 return {
 message: parsedId.error.issues[0]?.message ?? "Cuenta inválida.",
 status: "error",
 };
 }

 const privilegedContext = await getCurrentUniversalAdminProfile();

 if (privilegedContext.error || !hasSupabaseAdminConfig()) {
 return {
 message:
 privilegedContext.error ??
 "La gestión de profesionales no está disponible.",
 status: "error",
 };
 }

 const adminSupabase = createAdminClient();
 const { data: targetProfile, error: targetProfileError } = await adminSupabase
 .from("profiles")
 .select("id, role")
 .eq("id", parsedId.data)
 .maybeSingle();

 if (targetProfileError || targetProfile?.role !== "professional") {
 return {
 message: "La cuenta indicada no es una cuenta profesional gestionable.",
 status: "error",
 };
 }

 const { data, error } = await adminSupabase
 .from("professional_profiles")
 .update({ is_active: isActive })
 .eq("profile_id", parsedId.data)
 .select("profile_id")
 .maybeSingle();

 if (error || !data) {
 return {
 message: "No se pudo cambiar el estado del profesional.",
 status: "error",
 };
 }

 revalidatePath(CONFIGURATION_PATH);
 revalidatePath(PROFESSIONAL_ACCOUNTS_PATH);
 revalidatePath(`${PROFESSIONAL_ACCOUNTS_PATH}/${parsedId.data}`);

 return {
 message: isActive
 ? "Profesional activado correctamente."
 : "Profesional desactivado. Sus asignaciones se conservaron.",
 status: "success",
 };
}

async function countRows(
 query: PromiseLike<{ count: number | null; error: unknown }>,
) {
 const { count, error } = await query;

 return error ? 1 : count ?? 0;
}

async function getProfessionalDependencyCount(
 adminSupabase: ReturnType<typeof createAdminClient>,
 professionalId: string,
) {
 const counts = await Promise.all([
 countRows(
 adminSupabase
 .from("client_profiles")
 .select("profile_id", { count: "exact", head: true })
 .or(
 `assigned_nutritionist_id.eq.${professionalId},assigned_trainer_id.eq.${professionalId}`,
 ),
 ),
 countRows(
 adminSupabase
 .from("appointments")
 .select("id", { count: "exact", head: true })
 .eq("professional_id", professionalId),
 ),
 countRows(
 adminSupabase
 .from("diet_plans")
 .select("id", { count: "exact", head: true })
 .eq("nutritionist_id", professionalId),
 ),
 countRows(
 adminSupabase
 .from("workout_plans")
 .select("id", { count: "exact", head: true })
 .eq("trainer_id", professionalId),
 ),
 countRows(
 adminSupabase
 .from("resources")
 .select("id", { count: "exact", head: true })
 .eq("uploaded_by", professionalId),
 ),
 countRows(
 adminSupabase
 .from("progress_entries")
 .select("id", { count: "exact", head: true })
 .eq("recorded_by", professionalId),
 ),
 countRows(
 adminSupabase
 .from("exercises")
 .select("id", { count: "exact", head: true })
 .eq("created_by", professionalId),
 ),
 countRows(
 adminSupabase
 .from("routines")
 .select("id", { count: "exact", head: true })
 .eq("creator_id", professionalId),
 ),
 countRows(
 adminSupabase
 .from("blog_posts")
 .select("id", { count: "exact", head: true })
 .eq("author_id", professionalId),
 ),
 ]);

 return counts.reduce((total, count) => total + count, 0);
}

export async function deleteProfessionalAccount(
 professionalId: string,
): Promise<ProfessionalAccountMutationResult> {
 const parsedId = professionalIdSchema.safeParse(professionalId);

 if (!parsedId.success) {
 return {
 message: parsedId.error.issues[0]?.message ?? "Cuenta inválida.",
 status: "error",
 };
 }

 const privilegedContext = await getCurrentUniversalAdminProfile();

 if (privilegedContext.error || !hasSupabaseAdminConfig()) {
 return {
 message:
 privilegedContext.error ??
 "La gestión de profesionales no está disponible.",
 status: "error",
 };
 }

 const adminSupabase = createAdminClient();
 const { data: profile } = await adminSupabase
 .from("profiles")
 .select("id, role")
 .eq("id", parsedId.data)
 .maybeSingle();

 if (profile?.role !== "professional") {
 return {
 message: "La cuenta indicada no es una cuenta profesional gestionable.",
 status: "error",
 };
 }

 const dependencyCount = await getProfessionalDependencyCount(
 adminSupabase,
 parsedId.data,
 );

 if (dependencyCount > 0) {
 return {
 message:
 "No se puede eliminar: conserva clientes asignados o registros profesionales. Desactiva la cuenta o reasigna primero sus datos.",
 status: "error",
 };
 }

 const { error } = await adminSupabase.auth.admin.deleteUser(parsedId.data);

 if (error) {
 return {
 message: "No se pudo eliminar la cuenta profesional de forma segura.",
 status: "error",
 };
 }

 revalidatePath(CONFIGURATION_PATH);
 revalidatePath(PROFESSIONAL_ACCOUNTS_PATH);

 return {
 message: "Cuenta profesional eliminada correctamente.",
 status: "success",
 };
}

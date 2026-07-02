"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
 changePasswordSchema,
 type ChangePasswordValues,
 updateBasicAccountSchema,
 type UpdateBasicAccountValues,
} from "@/lib/validations/account";
import {
 personalDetailsSchema,
 type PersonalDetailsValues,
} from "@/lib/validations/personal-details";

type AccountFieldErrors = Partial<Record<keyof UpdateBasicAccountValues, string>>;
type ChangePasswordFieldErrors = Partial<
 Record<keyof ChangePasswordValues, string>
>;

export type UpdateBasicAccountResult =
 | {
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: AccountFieldErrors;
 message: string;
 status: "error";
 };

export type ChangePasswordResult =
 | {
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: ChangePasswordFieldErrors;
 message: string;
 status: "error";
 };

type PersonalDetailsFieldErrors = Partial<
 Record<keyof PersonalDetailsValues, string>
>;

export type PersonalDetailsActionResult =
 | {
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: PersonalDetailsFieldErrors;
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
 ) as AccountFieldErrors;
}

function getChangePasswordFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as ChangePasswordFieldErrors;
}

function getPersonalDetailsFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as PersonalDetailsFieldErrors;
}

function nullableText(value: string) {
 const normalized = value.trim();

 return normalized || null;
}

function nullableNumber(value: string) {
 const normalized = value.trim();

 return normalized ? Number(normalized.replace(",", ".")) : null;
}

function revalidateAccountPaths() {
 revalidatePath("/app/pending");
 revalidatePath("/app/configuracion");
 revalidatePath("/app/perfil");
 revalidatePath("/app", "layout");
}

function getPasswordUpdateError(message: string, code?: string) {
 const normalized = `${code ?? ""} ${message}`.toLowerCase();

 if (
 normalized.includes("current_password") ||
 normalized.includes("current password") ||
 (normalized.includes("current") && normalized.includes("password"))
 ) {
 return {
 fieldErrors: {
 currentPassword: "Revisa la contraseña actual.",
 },
 message: "La contraseña actual no es correcta o es requerida.",
 };
 }

 if (
 normalized.includes("same_password") ||
 normalized.includes("different from")
 ) {
 return {
 fieldErrors: {
 newPassword: "Usa una contraseña diferente a la actual.",
 },
 message: "La nueva contraseña debe ser diferente a la actual.",
 };
 }

 if (
 normalized.includes("weak_password") ||
 normalized.includes("weak password") ||
 normalized.includes("password requirements") ||
 normalized.includes("password should") ||
 normalized.includes("at least")
 ) {
 return {
 fieldErrors: {
 newPassword: "La nueva contraseña no cumple los requisitos.",
 },
 message: "La nueva contraseña no cumple los requisitos de seguridad.",
 };
 }

 if (
 normalized.includes("reauth") ||
 normalized.includes("nonce") ||
 normalized.includes("recently")
 ) {
 return {
 message:
 "Por seguridad, vuelve a iniciar sesión e intenta cambiar la contraseña de nuevo.",
 };
 }

 if (
 normalized.includes("session") ||
 normalized.includes("jwt") ||
 normalized.includes("not logged")
 ) {
 return {
 message: "Debes iniciar sesión para actualizar tu contraseña.",
 };
 }

 if (normalized.includes("missing supabase")) {
 return {
 message: "El servicio de acceso no está disponible en este momento.",
 };
 }

 return {
 message: "No se pudo actualizar tu contraseña. Inténtalo de nuevo.",
 };
}

export async function updateBasicAccount(
 values: UpdateBasicAccountValues,
): Promise<UpdateBasicAccountResult> {
 const parsed = updateBasicAccountSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const {
 data: { user },
 error: userError,
 } = await supabase.auth.getUser();

 if (userError || !user) {
 return {
 message: "Debes iniciar sesión para actualizar tu cuenta.",
 status: "error",
 };
 }

 const { error } = await supabase
 .from("profiles")
 .update({
 full_name: parsed.data.fullName,
 })
 .eq("id", user.id);

 if (error) {
 return {
 message: "No se pudo actualizar tu nombre. Inténtalo de nuevo.",
 status: "error",
 };
 }

 revalidateAccountPaths();

 return {
 message: "Cuenta actualizada correctamente.",
 status: "success",
 };
}

export async function changePassword(
 values: ChangePasswordValues,
): Promise<ChangePasswordResult> {
 const parsed = changePasswordSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getChangePasswordFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const {
 data: { user },
 error: userError,
 } = await supabase.auth.getUser();

 if (userError || !user) {
 return {
 message: "Debes iniciar sesión para actualizar tu contraseña.",
 status: "error",
 };
 }

 const { error } = await supabase.auth.updateUser({
 current_password: parsed.data.currentPassword || undefined,
 password: parsed.data.newPassword,
 });

 if (error) {
 const mappedError = getPasswordUpdateError(error.message, error.code);

 return {
 ...mappedError,
 status: "error",
 };
 }

 revalidatePath("/app/configuracion");

 return {
 message: "Contraseña actualizada correctamente.",
 status: "success",
 };
}

export async function updatePersonalDetails(
 values: PersonalDetailsValues,
): Promise<PersonalDetailsActionResult> {
 const parsed = personalDetailsSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getPersonalDetailsFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const {
 data: { user },
 error: userError,
 } = await supabase.auth.getUser();

 if (userError || !user) {
 return {
 message: "Debes iniciar sesión para actualizar tu información.",
 status: "error",
 };
 }

 const details = {
 allergies: nullableText(parsed.data.allergies),
 birth_date: nullableText(parsed.data.birthDate),
 body_fat_percentage: nullableNumber(parsed.data.bodyFatPercentage),
 body_measurements: nullableText(parsed.data.bodyMeasurements),
 dietary_restrictions: nullableText(parsed.data.dietaryRestrictions),
 gender: nullableText(parsed.data.gender),
 gender_description:
 parsed.data.gender === "self_described"
 ? nullableText(parsed.data.genderDescription)
 : null,
 height_cm: nullableNumber(parsed.data.heightCm),
 important_medications: nullableText(parsed.data.importantMedications),
 injuries: nullableText(parsed.data.injuries),
 medical_conditions: nullableText(parsed.data.medicalConditions),
 phone: nullableText(parsed.data.phone),
 professional_notes: nullableText(parsed.data.professionalNotes),
 weight_kg: nullableNumber(parsed.data.weightKg),
 };
 const hasDetails = Object.values(details).some((value) => value !== null);

 const { error } = hasDetails
 ? await supabase.from("profile_personal_details").upsert(
 {
 ...details,
 profile_id: user.id,
 },
 { onConflict: "profile_id" },
 )
 : await supabase
 .from("profile_personal_details")
 .delete()
 .eq("profile_id", user.id);

 if (error) {
 return {
 message:
 "No se pudo guardar tu información personal. Revisa los datos e inténtalo de nuevo.",
 status: "error",
 };
 }

 revalidateAccountPaths();

 return {
 message: hasDetails
 ? "Información personal actualizada."
 : "Información personal eliminada.",
 status: "success",
 };
}

export async function deletePersonalDetails(): Promise<PersonalDetailsActionResult> {
 const supabase = await createClient();
 const {
 data: { user },
 error: userError,
 } = await supabase.auth.getUser();

 if (userError || !user) {
 return {
 message: "Debes iniciar sesión para eliminar tu información.",
 status: "error",
 };
 }

 const { error } = await supabase
 .from("profile_personal_details")
 .delete()
 .eq("profile_id", user.id);

 if (error) {
 return {
 message: "No se pudo eliminar tu información personal.",
 status: "error",
 };
 }

 revalidateAccountPaths();

 return {
 message: "Información personal eliminada.",
 status: "success",
 };
}

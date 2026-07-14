"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth/authenticated-user";
import { createClient } from "@/lib/supabase/server";
import {
 professionalProfileSchema,
 type ProfessionalProfileValues,
} from "@/lib/validations/professional-profile";

type ProfessionalProfileFieldErrors = Partial<
 Record<keyof ProfessionalProfileValues, string>
>;

export type ProfessionalProfileActionResult =
 | {
 message: string;
 status: "success";
 }
 | {
 fieldErrors?: ProfessionalProfileFieldErrors;
 message: string;
 status: "error";
 };

function getProfessionalProfileFieldErrors(error: {
 flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
 return Object.fromEntries(
 Object.entries(error.flatten().fieldErrors).map(([field, messages]) => [
 field,
 messages?.[0],
 ]),
 ) as ProfessionalProfileFieldErrors;
}

function nullableText(value: string) {
 const normalized = value.trim();

 return normalized || null;
}

export async function updateOwnProfessionalProfile(
 values: ProfessionalProfileValues,
): Promise<ProfessionalProfileActionResult> {
 const parsed = professionalProfileSchema.safeParse(values);

 if (!parsed.success) {
 return {
 fieldErrors: getProfessionalProfileFieldErrors(parsed.error),
 message: "Revisa los campos marcados.",
 status: "error",
 };
 }

 const supabase = await createClient();
 const user = await getAuthenticatedUser(supabase);

 if (!user) {
 return {
 message: "Debes iniciar sesion para actualizar tu perfil profesional.",
 status: "error",
 };
 }

 const { data: profile, error: profileError } = await supabase
 .from("profiles")
 .select("id, role")
 .eq("id", user.id)
 .maybeSingle();

 if (profileError || profile?.role !== "professional") {
 return {
 message: "Solo las cuentas profesionales pueden editar estos datos.",
 status: "error",
 };
 }

 const { error } = await supabase
 .from("professional_profiles")
 .update({
 availability_days: nullableText(parsed.data.availabilityDays),
 availability_note: nullableText(parsed.data.availabilityNote),
 availability_schedule: nullableText(parsed.data.availabilitySchedule),
 bio: nullableText(parsed.data.bio),
 certifications: nullableText(parsed.data.certifications),
 experience: nullableText(parsed.data.experience),
 focus_areas: parsed.data.focusAreas,
 professional_links: nullableText(parsed.data.professionalLinks),
 professional_phone: nullableText(parsed.data.professionalPhone),
 })
 .eq("profile_id", user.id);

 if (error) {
 return {
 message: "No se pudo guardar tu informacion profesional.",
 status: "error",
 };
 }

 revalidatePath("/app/perfil");
 revalidatePath("/app/configuracion");
 revalidatePath("/app", "layout");

 return {
 message: "Perfil profesional actualizado correctamente.",
 status: "success",
 };
}

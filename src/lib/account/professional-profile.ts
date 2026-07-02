import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
 professionalFocusAreaOptions,
 type ProfessionalProfileValues,
} from "@/lib/validations/professional-profile";
import type { Enums } from "@/types/database";

export const emptyProfessionalProfile: ProfessionalProfileValues = {
 availabilityDays: "",
 availabilityNote: "",
 availabilitySchedule: "",
 bio: "",
 certifications: "",
 experience: "",
 focusAreas: [],
 professionalLinks: "",
 professionalPhone: "",
};

const baseProfessionalProfileSelect = "specialty, is_active";

const extendedProfessionalProfileSelect = `${baseProfessionalProfileSelect}, bio, professional_phone, professional_links, experience, certifications, focus_areas, availability_schedule, availability_days, availability_note`;

export type OwnProfessionalProfile = {
 isActive: boolean;
 specialty: Enums<"professional_specialty"> | null;
 values: ProfessionalProfileValues;
};

function normalizeFocusAreas(values: string[] | null) {
 const allowed = new Set<string>(professionalFocusAreaOptions);

 return (values ?? []).filter(
 (
 value,
 ): value is ProfessionalProfileValues["focusAreas"][number] =>
 allowed.has(value),
 );
}

type ProfessionalProfileRow = {
 availability_days?: string | null;
 availability_note?: string | null;
 availability_schedule?: string | null;
 bio?: string | null;
 certifications?: string | null;
 experience?: string | null;
 focus_areas?: string[] | null;
 is_active: boolean;
 professional_links?: string | null;
 professional_phone?: string | null;
 specialty: Enums<"professional_specialty"> | null;
};

function toProfessionalProfile(data: ProfessionalProfileRow) {
 return {
 isActive: data.is_active,
 specialty: data.specialty,
 values: {
 availabilityDays: data.availability_days ?? "",
 availabilityNote: data.availability_note ?? "",
 availabilitySchedule: data.availability_schedule ?? "",
 bio: data.bio ?? "",
 certifications: data.certifications ?? "",
 experience: data.experience ?? "",
 focusAreas: normalizeFocusAreas(data.focus_areas ?? null),
 professionalLinks: data.professional_links ?? "",
 professionalPhone: data.professional_phone ?? "",
 },
 } satisfies OwnProfessionalProfile;
}

export async function getOwnProfessionalProfile(
 profileId: string,
): Promise<OwnProfessionalProfile | null> {
 const supabase = await createClient();
 const { data, error } = await supabase
 .from("professional_profiles")
 .select(extendedProfessionalProfileSelect)
 .eq("profile_id", profileId)
 .maybeSingle();
 const fallbackResult = error
 ? await supabase
 .from("professional_profiles")
 .select(baseProfessionalProfileSelect)
 .eq("profile_id", profileId)
 .maybeSingle()
 : null;
 const resolvedData = data ?? fallbackResult?.data ?? null;

 if (error && fallbackResult?.error) {
 throw new Error("No se pudo cargar la informacion profesional.");
 }

 if (!resolvedData) {
 return null;
 }

 return toProfessionalProfile(resolvedData);
}

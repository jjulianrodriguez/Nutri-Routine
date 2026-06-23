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

export async function getOwnProfessionalProfile(
  profileId: string,
): Promise<OwnProfessionalProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select(
      "specialty, is_active, bio, professional_phone, professional_links, experience, certifications, focus_areas, availability_schedule, availability_days, availability_note",
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la informacion profesional.");
  }

  if (!data) {
    return null;
  }

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
      focusAreas: normalizeFocusAreas(data.focus_areas),
      professionalLinks: data.professional_links ?? "",
      professionalPhone: data.professional_phone ?? "",
    },
  };
}

import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PersonalDetailsValues } from "@/lib/validations/personal-details";

export const emptyPersonalDetails: PersonalDetailsValues = {
  allergies: "",
  birthDate: "",
  bodyFatPercentage: "",
  bodyMeasurements: "",
  dietaryRestrictions: "",
  gender: "",
  genderDescription: "",
  heightCm: "",
  importantMedications: "",
  injuries: "",
  medicalConditions: "",
  phone: "",
  professionalNotes: "",
  weightKg: "",
};

function normalizeGender(
  value: string | null,
): PersonalDetailsValues["gender"] {
  switch (value) {
    case "male":
    case "female":
    case "non_binary":
    case "prefer_not_to_say":
    case "self_described":
      return value;
    default:
      return "";
  }
}

export async function getPersonalDetails(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_personal_details")
    .select(
      "phone, birth_date, gender, gender_description, weight_kg, height_cm, body_fat_percentage, body_measurements, medical_conditions, injuries, allergies, important_medications, dietary_restrictions, professional_notes",
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la información personal.");
  }

  if (!data) {
    return {
      hasSavedDetails: false,
      values: emptyPersonalDetails,
    };
  }

  return {
    hasSavedDetails: true,
    values: {
      allergies: data.allergies ?? "",
      birthDate: data.birth_date ?? "",
      bodyFatPercentage:
        data.body_fat_percentage === null ||
        data.body_fat_percentage === undefined
          ? ""
          : String(data.body_fat_percentage),
      bodyMeasurements: data.body_measurements ?? "",
      dietaryRestrictions: data.dietary_restrictions ?? "",
      gender: normalizeGender(data.gender),
      genderDescription: data.gender_description ?? "",
      heightCm:
        data.height_cm === null || data.height_cm === undefined
          ? ""
          : String(data.height_cm),
      importantMedications: data.important_medications ?? "",
      injuries: data.injuries ?? "",
      medicalConditions: data.medical_conditions ?? "",
      phone: data.phone ?? "",
      professionalNotes: data.professional_notes ?? "",
      weightKg:
        data.weight_kg === null || data.weight_kg === undefined
          ? ""
          : String(data.weight_kg),
    } satisfies PersonalDetailsValues,
  };
}

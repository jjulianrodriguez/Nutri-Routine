import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PersonalDetailsValues } from "@/lib/validations/personal-details";

export const emptyPersonalDetails: PersonalDetailsValues = {
  birthDate: "",
  gender: "",
  genderDescription: "",
  heightCm: "",
  medicalConditions: "",
  phone: "",
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
      "phone, birth_date, gender, gender_description, weight_kg, height_cm, medical_conditions",
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo cargar la informacion personal.");
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
      birthDate: data.birth_date ?? "",
      gender: normalizeGender(data.gender),
      genderDescription: data.gender_description ?? "",
      heightCm:
        data.height_cm === null || data.height_cm === undefined
          ? ""
          : String(data.height_cm),
      medicalConditions: data.medical_conditions ?? "",
      phone: data.phone ?? "",
      weightKg:
        data.weight_kg === null || data.weight_kg === undefined
          ? ""
          : String(data.weight_kg),
    } satisfies PersonalDetailsValues,
  };
}

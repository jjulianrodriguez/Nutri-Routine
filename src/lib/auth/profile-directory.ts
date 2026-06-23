import "server-only";

import { listAuthEmailsByUserId } from "@/lib/auth/auth-user-emails";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Tables } from "@/types/database";

type ProfileRole = Enums<"profile_role">;
type ProfessionalSpecialty = Enums<"professional_specialty">;
type ProfileRow = Pick<
  Tables<"profiles">,
  "avatar_url" | "created_at" | "full_name" | "id" | "role" | "updated_at"
>;
type ProfessionalProfileRow = Pick<
  Tables<"professional_profiles">,
  "is_active" | "profile_id" | "specialty"
>;

export type ProfileDirectoryEntry = {
  avatarUrl: string | null;
  createdAt: string;
  email: string | null;
  fullName: string | null;
  id: string;
  isProfessionalActive: boolean | null;
  role: ProfileRole;
  specialty: ProfessionalSpecialty | null;
  updatedAt: string;
};

type ProfileDirectoryOptions = {
  includeEmails?: boolean;
  includeProfessionalProfiles?: boolean;
};

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function createProfileReadClient() {
  if (hasSupabaseAdminConfig()) {
    return createAdminClient();
  }

  return createClient();
}

export function getProfileDisplayName(
  profile: ProfileDirectoryEntry | null | undefined,
) {
  return profile?.fullName ?? profile?.email ?? null;
}

export async function getProfileDirectory(
  userIds: string[],
  options: ProfileDirectoryOptions = {},
) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return new Map<string, ProfileDirectoryEntry>();
  }

  const supabase = await createProfileReadClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, created_at, updated_at")
    .in("id", uniqueIds);

  if (error) {
    return new Map<string, ProfileDirectoryEntry>();
  }

  const professionalIds =
    options.includeProfessionalProfiles === false
      ? []
      : (profiles ?? [])
          .filter(
            (profile) =>
              profile.role === "admin" || profile.role === "professional",
          )
          .map((profile) => profile.id);
  const [professionalProfilesResult, emailsById] = await Promise.all([
    professionalIds.length > 0
      ? supabase
          .from("professional_profiles")
          .select("profile_id, specialty, is_active")
          .in("profile_id", professionalIds)
      : Promise.resolve({
          data: [] as ProfessionalProfileRow[],
          error: null,
        }),
    options.includeEmails
      ? listAuthEmailsByUserId(uniqueIds)
      : Promise.resolve(new Map<string, string>()),
  ]);
  const professionalById = new Map(
    ((professionalProfilesResult.data ?? []) as ProfessionalProfileRow[]).map(
      (profile) => [profile.profile_id, profile],
    ),
  );

  return new Map(
    ((profiles ?? []) as ProfileRow[]).map((profile) => {
      const professional = professionalById.get(profile.id);

      return [
        profile.id,
        {
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
          email: readString(emailsById.get(profile.id)),
          fullName: readString(profile.full_name),
          id: profile.id,
          isProfessionalActive:
            profile.role === "admin"
              ? true
              : professional?.is_active ?? null,
          role: profile.role,
          specialty:
            profile.role === "admin"
              ? "both"
              : professional?.specialty ?? null,
          updatedAt: profile.updated_at,
        },
      ];
    }),
  );
}

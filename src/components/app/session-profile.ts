import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/lib/auth/access-rules";
import type { Tables } from "@/types/database";

type ProfileRow = Pick<Tables<"profiles">, "full_name" | "role"> | null;

export type AppUserProfile = {
  displayName: string;
  email: string;
  initials: string;
  role: AppRole;
  roleLabel: string;
};

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function normalizeRole(value: unknown): AppRole {
  const role = readString(value).toLowerCase();

  if (role === "admin" || role === "professional" || role === "client") {
    return role;
  }

  return "client";
}

function getInitials(name: string, email: string) {
  const source = name || email;
  const parts = source
    .split(/[.\s_-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "NC";
  }

  return parts.map((part) => part[0]?.toUpperCase()).join("");
}

function getRoleLabel(role: AppRole) {
  if (role === "client") {
    return "Cliente";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "Profesional";
}

export function getAppUserProfile(
  user: User,
  profile: ProfileRow = null,
): AppUserProfile {
  const metadata = user.user_metadata ?? {};
  const displayName =
    readString(profile?.full_name) ||
    readString(metadata.full_name) ||
    readString(metadata.name) ||
    readString(user.email) ||
    "Profesional";
  const email = readString(user.email);
  const role = normalizeRole(profile?.role);

  return {
    displayName,
    email,
    initials: getInitials(displayName, email),
    role,
    roleLabel: getRoleLabel(role),
  };
}

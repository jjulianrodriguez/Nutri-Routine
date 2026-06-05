import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/components/app/SidebarNav";
import type { Tables } from "@/types/database";

const DEV_ROLE_OVERRIDE: AppRole | null = null;

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

  if (role === "client") {
    return "client";
  }

  return "professional";
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

function getRoleLabel(role: AppRole, displayName: string) {
  if (role === "client") {
    return "Cliente";
  }

  const normalizedName = displayName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedName.includes("camila")) {
    return "Entrenadora Personal";
  }

  if (normalizedName.includes("mariana")) {
    return "Nutricionista funcional";
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
  const role =
    DEV_ROLE_OVERRIDE ?? normalizeRole(profile?.role ?? metadata.role ?? metadata.app_role);

  return {
    displayName,
    email,
    initials: getInitials(displayName, email),
    role,
    roleLabel: readString(metadata.role_label) || getRoleLabel(role, displayName),
  };
}

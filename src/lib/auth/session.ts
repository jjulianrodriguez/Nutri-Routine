import { redirect } from "next/navigation";
import { cache } from "react";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
});

export const getCurrentUserContext = cache(async () => {
  const user = await getCurrentUser();

  if (!user) {
    return {
      profile: null,
      role: null,
      user: null,
    };
  }

  const profile = await getCurrentProfile();

  return {
    profile,
    role: profile?.role ?? null,
    user,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireUserContext() {
  const context = await getCurrentUserContext();

  if (!context.user) {
    redirect("/login");
  }

  return {
    profile: context.profile,
    role: context.role,
    user: context.user,
  };
}

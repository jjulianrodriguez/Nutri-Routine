import "server-only";

import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/admin";

const AUTH_USERS_PAGE_SIZE = 1000;
const MAX_AUTH_USERS_PAGES = 20;

export async function listAuthEmailsByUserId(userIds: string[]) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueUserIds.length === 0 || !hasSupabaseAdminConfig()) {
    return new Map<string, string>();
  }

  const remainingIds = new Set(uniqueUserIds);
  const emailsById = new Map<string, string>();
  const adminSupabase = createAdminClient();

  for (let page = 1; page <= MAX_AUTH_USERS_PAGES; page += 1) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PAGE_SIZE,
    });

    if (error) {
      return emailsById;
    }

    const users = data.users ?? [];

    for (const user of users) {
      if (!remainingIds.has(user.id)) {
        continue;
      }

      emailsById.set(user.id, user.email ?? "");
      remainingIds.delete(user.id);
    }

    if (remainingIds.size === 0 || users.length < AUTH_USERS_PAGE_SIZE) {
      break;
    }
  }

  return emailsById;
}

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createClient() {
  const { anonKey, url } = getSupabaseConfig();

  return createBrowserClient<Database>(
    url,
    anonKey,
  );
}

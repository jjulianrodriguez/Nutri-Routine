import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAdminKey =
 process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export function hasSupabaseAdminConfig() {
 return Boolean(supabaseUrl && supabaseAdminKey);
}

export function createAdminClient() {
 if (!supabaseUrl || !supabaseAdminKey) {
 throw new Error(
 "Missing Supabase admin environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY.",
 );
 }

 return createSupabaseClient<Database>(supabaseUrl, supabaseAdminKey, {
 auth: {
 autoRefreshToken: false,
 persistSession: false,
 },
 });
}

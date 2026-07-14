import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type AuthenticatedUserClient = Pick<SupabaseClient<Database>, "auth">;

export type AuthenticatedUser = {
 email?: string;
 id: string;
 user_metadata: Record<string, unknown>;
};

function getUserMetadata(value: unknown) {
 if (!value || typeof value !== "object" || Array.isArray(value)) {
 return {};
 }

 return value as Record<string, unknown>;
}

export async function getAuthenticatedUser(
 supabase: AuthenticatedUserClient,
): Promise<AuthenticatedUser | null> {
 const { data, error } = await supabase.auth.getClaims();
 const claims = data?.claims;

 if (error || !claims?.sub) {
 return null;
 }

 return {
 email: typeof claims.email === "string" ? claims.email : undefined,
 id: claims.sub,
 user_metadata: getUserMetadata(claims.user_metadata),
 };
}

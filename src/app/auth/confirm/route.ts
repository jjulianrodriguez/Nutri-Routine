import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT = "/app";

function getSafeRedirect(value: string | null) {
  if (value?.startsWith("/app") || value === "/reset-password") {
    return value;
  }

  return DEFAULT_REDIRECT;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const redirectTo = new URL(
    getSafeRedirect(searchParams.get("next")),
    request.url,
  );

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("authError", "confirmation");

  return NextResponse.redirect(loginUrl);
}

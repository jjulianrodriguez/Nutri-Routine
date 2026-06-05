import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  getSupabaseConfig,
  hasSupabaseConfig,
} from "@/lib/supabase/config";
import type { Database } from "@/types/database";

const DASHBOARD_PATH = "/app/dashboard";
const AUTH_PATHS = new Set(["/login", "/register"]);

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });

  return to;
}

function isAuthPath(pathname: string) {
  return AUTH_PATHS.has(pathname);
}

function isPrivatePath(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authPath = isAuthPath(pathname);
  const privatePath = isPrivatePath(pathname);

  if (!hasSupabaseConfig()) {
    if (privatePath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { anonKey, url } = getSupabaseConfig();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(!error && data?.claims?.sub);

  if (!isAuthenticated && privatePath) {
    return copyCookies(
      supabaseResponse,
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }

  if (isAuthenticated && authPath) {
    return copyCookies(
      supabaseResponse,
      NextResponse.redirect(new URL(DASHBOARD_PATH, request.url)),
    );
  }

  return supabaseResponse;
}

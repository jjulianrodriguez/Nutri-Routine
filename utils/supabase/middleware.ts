import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  getSupabaseConfig,
  hasSupabaseConfig,
} from "@/lib/supabase/config";
import type { Database } from "../../types/database";

const APP_PATH = "/app";
const AUTH_PATHS = new Set(["/login", "/register"]);

function isAuthPath(pathname: string) {
  return AUTH_PATHS.has(pathname);
}

function isPrivatePath(pathname: string) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function copySessionResponse(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    to.cookies.set(name, value, options);
  });

  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = from.headers.get(header);

    if (value) {
      to.headers.set(header, value);
    }
  });

  return to;
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
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(!error && data?.claims?.sub);

  if (!isAuthenticated && privatePath) {
    return copySessionResponse(
      supabaseResponse,
      NextResponse.redirect(new URL("/login", request.url)),
    );
  }

  if (isAuthenticated && authPath) {
    return copySessionResponse(
      supabaseResponse,
      NextResponse.redirect(new URL(APP_PATH, request.url)),
    );
  }

  return supabaseResponse;
}

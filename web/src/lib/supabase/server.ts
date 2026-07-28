// Server-side Supabase client. One instance per request. Used by:
//   - Server Components (RSC)
//   - Server Actions
//   - Route Handlers
//
// Why we await `cookies()`: Next.js 15+ made the cookies store async, so
// every read/write is a Promise. The @supabase/ssr API is the canonical
// adapter that wires that up to Supabase's cookie-based auth.
//
// We never export the `supabase` variable — only a function. Otherwise
// cross-request leaks are easy to introduce.

import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function createServerSupabase(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll from a Server Component is a no-op (cookies are read-only
          // there). Middleware/proxy is responsible for keeping the session
          // fresh — see src/proxy.ts.
        }
      },
    },
  });
}

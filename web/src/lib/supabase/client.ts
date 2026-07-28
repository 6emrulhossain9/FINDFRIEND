// Browser-side Supabase client. Used by Client Components for auth state
// changes that must be visible to the rest of the app immediately (e.g.
// the onAuthStateChange listener in <AuthListener />).
//
// `getAll`/`setAll` cookie handlers are required by @supabase/ssr even on
// the browser — they keep the cookie store consistent if a refresh or
// sign-in happens in another tab. The "ignore" branch never fires on the
// browser because document.cookie does not raise on no-op writes.

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and fill in your Supabase project values.",
    );
  }

  cached = createBrowserClient(url, anonKey, {
    cookies: {
      // The browser cookie API is synchronous and read-only here; @supabase/ssr
      // expects getAll/setAll. We no-op the writes because the browser does
      // not need help persisting its own cookies.
      getAll() {
        if (typeof document === "undefined") return [];
        return document.cookie
          .split("; ")
          .filter(Boolean)
          .map((kv) => {
            const eq = kv.indexOf("=");
            const name = eq === -1 ? kv : kv.slice(0, eq);
            const value = eq === -1 ? "" : kv.slice(eq + 1);
            return { name, value: decodeURIComponent(value) };
          });
      },
      setAll() {
        // no-op on the browser; the SDK writes the cookies itself.
      },
    },
  });
  return cached;
}

// Supabase client for the proxy/middleware. Has to use the Web `Request`/
// `Response` cookie API because middleware runs on the Edge runtime where
// next/headers.cookies() is not available.
//
// We also expose `getUser()` here, not `getSession()`. The proxy needs a
// re-validated identity so that expired tokens bounce early, and so a
// signed-out request never sees protected routes.

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createMiddlewareSupabase(
  request: Request,
  response: { headers: Headers },
): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        // Parse the Cookie header from the incoming request. @supabase/ssr
        // expects an array of { name, value }.
        const header = request.headers.get("cookie") ?? "";
        return header
          .split("; ")
          .filter(Boolean)
          .map((kv) => {
            const eq = kv.indexOf("=");
            const name = eq === -1 ? kv : kv.slice(0, eq);
            const value = eq === -1 ? "" : kv.slice(eq + 1);
            return { name, value: decodeURIComponent(value) };
          });
      },
      setAll(toSet) {
        for (const { name, value, options } of toSet) {
          // Build a Set-Cookie header. We do this by hand instead of pulling
          // in a serializer to keep the dep tree small.
          const parts = [`${name}=${encodeURIComponent(value)}`];
          if (options?.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
          if (options?.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
          if (options?.path) parts.push(`Path=${options.path}`);
          else parts.push("Path=/");
          if (options?.domain) parts.push(`Domain=${options.domain}`);
          // @supabase/ssr types `sameSite` as `boolean | "lax" | "strict" | "none"`.
          // `true` is its way of saying "default it for me" — we render Lax.
          if (options?.sameSite) {
            const ss = options.sameSite;
            parts.push(`SameSite=${typeof ss === "string" ? cap(ss) : "Lax"}`);
          } else {
            parts.push("SameSite=Lax");
          }
          if (options?.httpOnly) parts.push("HttpOnly");
          if (options?.secure) parts.push("Secure");
          response.headers.append("Set-Cookie", parts.join("; "));
        }
      },
    },
  });
}

function cap(s: "lax" | "strict" | "none"): string {
  return s[0]!.toUpperCase() + s.slice(1);
}

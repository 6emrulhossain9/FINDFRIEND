// Root proxy. Next.js 15+ renamed middleware.ts -> proxy.ts. Same semantics:
// runs on every request matching `config.matcher`, and is the right place
// to refresh the Supabase session cookie and to do optimistic auth gating.
//
// What this proxy does in Phase 0:
//   1. Refresh the Supabase auth session (writes new cookies on the response
//      if the access token was close to expiry). This is required because
//      `@supabase/ssr` cannot refresh tokens from a Server Component — only
//      from a place with mutable cookies (proxy/route handler/server action).
//   2. Redirect anonymous users away from /account/* to /login.
//
// What this proxy does NOT do:
//   - It does not read the database. The DAL does that in Server Components.
//   - It does not gate by role. Roles come in Phase 1.

import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareSupabase } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/account"];

export default async function proxy(request: NextRequest) {
  // Prepare a response we can mutate — Supabase may need to refresh cookies.
  const response = NextResponse.next({ request });

  const supabase = createMiddlewareSupabase(request, {
    headers: response.headers,
  });

  // CRITICAL: do not run any other Supabase code between createServerClient
  // and the getUser call. Doing so risks racing the cookie refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on every path except static assets, image optimizer, and the
    // Supabase auth callback itself (which is the only place that should
    // not be racing a cookie write).
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

// Data Access Layer.
//
// `verifySession()` is the only place in the app that decides whether the
// current request is authenticated. Wrap with `cache()` so multiple Server
// Components in the same render tree share one Supabase roundtrip.
//
// We expose:
//   - verifySession(): returns { user, session } or null (no redirect).
//   - requireSession(): calls verifySession(); throws UnauthenticatedError
//     if missing. Use from server actions/route handlers that must not run
//     for anonymous users.
//   - getUserProfile(): profile row for the current user, or null. Used by
//     the /account page. Phase 0 stub returns null until Phase 1 fills in
//     the `profiles` table semantics.

import "server-only";

import { cache } from "react";

import { createServerSupabase } from "@/lib/supabase/server";
import { UnauthenticatedError } from "@/lib/errors/classes";

export const verifySession = cache(async () => {
  const supabase = await createServerSupabase();
  // getUser() validates the JWT against Supabase Auth. It is the right
  // primitive here — `auth.getSession()` only reads the cookie and never
  // re-validates, which is fine for UI hints but not for authorization.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }
  return { user };
});

export async function requireSession() {
  const session = await verifySession();
  if (!session) {
    throw new UnauthenticatedError();
  }
  return session;
}

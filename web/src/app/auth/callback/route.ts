// OAuth / magic-link callback. Supabase redirects the user here with a
// `?code=...` query param after a successful sign-in. We exchange the code
// for a session, then create a profile row (Phase 1), and redirect to
// the `next` param (or /onboarding for first-time signups).

import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url));
  }

  const supabase = await createServerSupabase();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/auth/auth-code-error?reason=${encodeURIComponent(exchangeError.message)}`, url),
    );
  }

  // Get the newly authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/auth/auth-code-error?reason=Could%20not%20retrieve%20user%20session", url),
    );
  }

  // Check if profile already exists (returning user via OAuth)
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  // If no profile exists, create one (first-time signup)
  if (!existingProfile) {
    const dateOfBirth = user.user_metadata?.date_of_birth as string | undefined;
    
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        date_of_birth: dateOfBirth || null,
        onboarding_state: "pending",
      });

    if (profileError) {
      return NextResponse.redirect(
        new URL(`/auth/auth-code-error?reason=${encodeURIComponent("Could not create profile")}`, url),
      );
    }

    // First-time signup: redirect to onboarding
    return NextResponse.redirect(new URL("/onboarding", url));
  }

  // Existing user: redirect to where they came from
  return NextResponse.redirect(new URL(safeNext, url));
}

"use server";

// Auth server actions.
//
// These run on the server. They never trust client-side validation alone —
// every action re-validates its inputs through Zod and re-checks the
// session via the DAL before doing anything that touches the database.
//
// Phase 0: only sign-in, sign-up, and sign-out. The sign-up action creates
// the auth user; the public `profiles` row is created later (Phase 1) by
// the onboarding flow.

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createServerSupabase } from "@/lib/supabase/server";
import {
  AuthFormState,
  LoginSchema,
  SignupSchema,
} from "@/lib/validation/auth";
import { verifySession } from "@/lib/dal";

// --- helpers ---------------------------------------------------------------

function siteOrigin(): string {
  // Prefer an explicit env var so OAuth callbacks work in any preview env.
  // Fall back to the request Origin header (works in dev and most prod
  // scenarios) and then to a hard default.
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  // `headers()` is async in Next 15+. We only need it as a fallback.
  // (We resolve synchronously in practice because Next awaits it for us.)
  return "http://localhost:3000";
}

function fieldErrors(
  zodError: import("zod").ZodError,
): Partial<Record<"email" | "password", string[]>> {
  // `flatten()` returns a typed shape on the success path; on a failed
  // parse the `fieldErrors` is `Record<string, string[] | undefined>`.
  // We narrow the keys we care about.
  const flat = zodError.flatten().fieldErrors as Record<string, string[] | undefined>;
  const out: Partial<Record<"email" | "password", string[]>> = {};
  if (Array.isArray(flat.email)) out.email = flat.email;
  if (Array.isArray(flat.password)) out.password = flat.password;
  return out;
}

// --- sign in ---------------------------------------------------------------

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Map common auth errors to a user-safe message; do not leak the raw
    // Supabase text — it sometimes contains internal reasons.
    const message =
      error.status === 400 || error.status === 401
        ? "Email or password is incorrect."
        : "Could not sign you in. Please try again.";
    return { ok: false, message };
  }

  // Redirect on success. `redirect()` throws — code below it is unreachable.
  const next = (formData.get("next") as string | null) || "/account";
  redirect(safeNext(next));
}

function safeNext(input: string | null): string {
  if (!input) return "/account";
  // Only allow same-origin, absolute paths. Block protocol-relative URLs and
  // anything that isn't a path. This prevents open-redirect attacks.
  if (!input.startsWith("/") || input.startsWith("//")) return "/account";
  return input;
}

// --- sign up ---------------------------------------------------------------

export async function signupAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    date_of_birth: formData.get("date_of_birth"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const origin = siteOrigin();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Where Supabase should send the user after the confirmation email
      // link is clicked. The route handler at /auth/callback exchanges the
      // code for a session.
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      // Store DOB in user_metadata so we can retrieve it in the callback
      // and create the profile row with the correct date_of_birth.
      data: {
        date_of_birth: parsed.data.date_of_birth,
      },
    },
  });
  if (error) {
    // 422 with that exact message is Supabase's "email already registered"
    // signal. We surface a specific message so the user can switch to /login
    // instead of guessing why sign-up failed. Everything else is generic
    // to avoid leaking Supabase internals (per ErrorHandling.md §2).
    const message =
      error.status === 422 && /already.*registered/i.test(error.message)
        ? "An account with that email already exists. Try signing in instead."
        : "Could not create your account. Please try again.";
    return { ok: false, message };
  }

  // If email confirmation is disabled in Supabase, signUp also signs the
  // user in. We can't tell from this side without a roundtrip; the safe
  // behaviour is to send them to a "check your email" page either way.
  redirect("/signup/check-email");
}

// --- sign out --------------------------------------------------------------

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}

// --- OAuth (Google) --------------------------------------------------------
//
// The button on /login calls this server action. We construct the OAuth URL
// server-side and redirect the user into Supabase's hosted flow.

export async function signInWithGoogleAction() {
  const supabase = await createServerSupabase();
  const origin = siteOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/account`,
    },
  });
  if (error || !data?.url) {
    // Avoid leaking the error text. Just route back to /login with a flag.
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    redirect(
      `${proto}://${host}/login?error=oauth_start_failed`,
    );
  }
  redirect(data.url);
}

// --- tiny helper for /account to know its own email -----------------------

export async function currentSession() {
  return verifySession();
}

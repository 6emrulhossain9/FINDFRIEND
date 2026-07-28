// Onboarding server action (Phase 1)
//
// Handles:
//  - Profile completion (display name, bio)
//  - Interest selection (5+ required)
//  - Sets onboarding_state to 'active'
//  - Redirects to /account (future: /discover)

"use server";

import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import {
  OnboardingSchema,
  OnboardingFormState,
} from "@/lib/validation/auth";
import { verifySession } from "@/lib/dal";

function fieldErrors(
  zodError: import("zod").ZodError,
): Partial<Record<"display_name" | "bio" | "interests", string[]>> {
  const flat = zodError.flatten().fieldErrors as Record<string, string[] | undefined>;
  const out: Partial<Record<"display_name" | "bio" | "interests", string[]>> = {};
  if (Array.isArray(flat.display_name)) out.display_name = flat.display_name;
  if (Array.isArray(flat.bio)) out.bio = flat.bio;
  if (Array.isArray(flat.interests)) out.interests = flat.interests;
  return out;
}

export async function onboardingAction(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  // Verify session first
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in to complete onboarding." };
  }

  // Parse and validate input
  const interestsRaw = formData.get("interests");
  let interestIds: string[] = [];
  if (typeof interestsRaw === "string") {
    try {
      interestIds = JSON.parse(interestsRaw);
    } catch {
      // If JSON parse fails, interests will be empty and validation will catch it
    }
  }

  const parsed = OnboardingSchema.safeParse({
    display_name: formData.get("display_name"),
    bio: formData.get("bio"),
    interests: interestIds,
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const userId = session.user.id;

  try {
    // Update profile with display_name, bio, and set onboarding_state to 'active'
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: parsed.data.display_name,
        bio: parsed.data.bio,
        onboarding_state: "active",
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return { ok: false, message: "Could not update your profile. Please try again." };
    }

    // Insert user interests
    const interestRows = parsed.data.interests.map((interestId) => ({
      user_id: userId,
      interest_id: interestId,
    }));

    const { error: interestsError } = await supabase
      .from("user_interests")
      .insert(interestRows);

    if (interestsError) {
      console.error("Interests insert error:", interestsError);
      return { ok: false, message: "Could not save your interests. Please try again." };
    }

    // Success: redirect to account page (future: discover page with instant matches)
    redirect("/account");
  } catch (err) {
    console.error("Onboarding error:", err);
    return { ok: false, message: "An unexpected error occurred. Please try again." };
  }
}

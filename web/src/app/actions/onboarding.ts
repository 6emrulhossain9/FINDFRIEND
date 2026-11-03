"use server";

import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { OnboardingSchema, type OnboardingFormState } from "@/lib/validation/auth";
import { verifySession } from "@/lib/dal";

function fieldErrors(error: import("zod").ZodError): Partial<Record<"display_name" | "bio" | "interests", string[]>> {
  const fields = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  return {
    ...(fields.display_name ? { display_name: fields.display_name } : {}),
    ...(fields.bio ? { bio: fields.bio } : {}),
    ...(fields.interests ? { interests: fields.interests } : {}),
  };
}

export async function onboardingAction(_previous: OnboardingFormState, formData: FormData): Promise<OnboardingFormState> {
  const session = await verifySession();
  if (!session) return { ok: false, message: "Sign in to finish setting up your profile." };

  let interestIds: unknown = [];
  const rawInterests = formData.get("interests");
  if (typeof rawInterests === "string") {
    try { interestIds = JSON.parse(rawInterests); } catch { /* Validation below will return a clear message. */ }
  }

  const parsed = OnboardingSchema.safeParse({
    display_name: formData.get("display_name"),
    bio: formData.get("bio"),
    interests: interestIds,
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const supabase = await createServerSupabase();
  const userId = session.user.id;
  try {
    const { data: existingProfile, error: profileLookupError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (profileLookupError) {
      console.error("Onboarding profile lookup failed", { code: profileLookupError.code });
      return { ok: false, message: "We couldn’t load your profile. Please try again." };
    }
    if (!existingProfile) {
      const dateOfBirth = session.user.user_metadata?.date_of_birth;
      const { error: profileCreateError } = await supabase.from("profiles").insert({
        id: userId,
        date_of_birth: typeof dateOfBirth === "string" ? dateOfBirth : null,
        onboarding_state: "pending",
      });
      if (profileCreateError && profileCreateError.code !== "23505") {
        console.error("Onboarding profile recovery failed", { code: profileCreateError.code });
        return { ok: false, message: "We couldn’t prepare your profile. Please try again." };
      }
    }

    // Replace the draft selection so a retry after a partial save stays safe.
    const { error: clearError } = await supabase.from("user_interests").delete().eq("user_id", userId);
    if (clearError) {
      console.error("Onboarding interest reset failed", { code: clearError.code });
      return { ok: false, message: "We couldn’t update your interests. Please try again." };
    }

    const interestRows = parsed.data.interests.map((interestId) => ({ user_id: userId, interest_id: interestId }));
    const { error: interestsError } = await supabase.from("user_interests").insert(interestRows);
    if (interestsError) {
      console.error("Onboarding interests save failed", { code: interestsError.code });
      return { ok: false, message: "We couldn’t save those interests. Please try again." };
    }

    const { error: profileError } = await supabase.from("profiles").update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio,
      onboarding_state: "active",
    }).eq("id", userId);
    if (profileError) {
      console.error("Onboarding profile save failed", { code: profileError.code });
      return { ok: false, message: "We couldn’t save your profile yet. Please try again." };
    }
  } catch (error) {
    console.error("Onboarding save failed", { name: error instanceof Error ? error.name : "unknown" });
    return { ok: false, message: "Something interrupted setup. Please try again." };
  }

  // Next.js redirect throws internally, so it must stay outside this catch.
  redirect("/discover");
}

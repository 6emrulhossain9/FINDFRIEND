// /onboarding — first-time user onboarding (Phase 1).
//
// Collects display name, bio, and 5+ interest selections. Redirects to
// /discover after completion.

import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/onboarding");
  }

  const supabase = await createServerSupabase();
  const [interestsResult, profileResult, selectedInterestsResult] = await Promise.all([
    supabase.from("interests").select("id, slug, label, category").order("category").order("label"),
    supabase.from("profiles").select("display_name, bio, onboarding_state").eq("id", session.user.id).maybeSingle(),
    supabase.from("user_interests").select("interest_id").eq("user_id", session.user.id),
  ]);
  const { data: interests, error } = interestsResult;

  if (error || profileResult.error || selectedInterestsResult.error || !interests?.length) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5">
        <div className="apple-card p-6 text-center">
          <h1 className="text-lg font-semibold">Your profile is almost ready</h1>
          <p className="mt-2 text-sm leading-6 text-text-soft" role="status">We couldn’t load your setup details just now. Refresh this page to try again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 max-w-xl">
          <p className="text-sm font-semibold text-accent">{profileResult.data?.onboarding_state === "active" ? "Your profile" : "A few little details"}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{profileResult.data?.onboarding_state === "active" ? "Make it your own" : "Make yourself at home"}</h1>
          <p className="mt-3 text-sm leading-6 text-text-soft">
            Choose a name and a few interests. We’ll use them to help you meet people you’ll enjoy talking with.
          </p>
        </div>
        <OnboardingForm
          interests={interests}
          initialProfile={{ display_name: profileResult.data?.display_name ?? "", bio: profileResult.data?.bio ?? "" }}
          initialInterestIds={(selectedInterestsResult.data ?? []).map((row) => row.interest_id)}
        />
      </div>
    </main>
  );
}

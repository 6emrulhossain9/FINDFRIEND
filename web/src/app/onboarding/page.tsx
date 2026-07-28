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

  // Fetch interests from the database
  const supabase = await createServerSupabase();
  const { data: interests, error } = await supabase
    .from("interests")
    .select("id, slug, label, category")
    .order("category")
    .order("label");

  if (error || !interests?.length) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-md">
          <p className="text-red-600">Could not load interests. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome to ViCo</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Complete your profile to get started. We&apos;ll match you with people who share your interests.
          </p>
        </div>
        <OnboardingForm interests={interests} />
      </div>
    </div>
  );
}

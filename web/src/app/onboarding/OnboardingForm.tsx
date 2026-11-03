"use client";

import { useActionState, useState } from "react";
import { onboardingAction } from "@/app/actions/onboarding";
import type { OnboardingFormState } from "@/lib/validation/auth";

const initialState: OnboardingFormState = undefined;
interface Interest { id: string; slug: string; label: string; category: string; }

export function OnboardingForm({
  interests,
  initialProfile,
  initialInterestIds,
}: {
  interests: Interest[];
  initialProfile: { display_name: string; bio: string };
  initialInterestIds: string[];
}) {
  const [state, formAction, pending] = useActionState(onboardingAction, initialState);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(() => new Set(initialInterestIds));
  const [bioLength, setBioLength] = useState(initialProfile.bio.length);
  const fieldErrors = (field: "display_name" | "bio" | "interests") => state?.ok === false ? state.errors?.[field] : undefined;
  const categories = interests.reduce<Record<string, Interest[]>>((result, interest) => {
    (result[interest.category] ??= []).push(interest);
    return result;
  }, {});
  const categoryLabels: Record<string, string> = {
    creative: "Creative", outdoors: "Outdoors", food: "Food & drink", games: "Games & tech",
    learn: "Learning & culture", lifestyle: "Lifestyle", music: "Music", sports: "Sports",
  };
  const submit = async (formData: FormData) => {
    formData.set("interests", JSON.stringify(Array.from(selectedInterests)));
    return formAction(formData);
  };

  return (
    <form action={submit} className="apple-card flex flex-col gap-6 p-5 sm:p-7">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Display name
        <input type="text" name="display_name" defaultValue={initialProfile.display_name} placeholder="What should friends call you?" maxLength={255} required disabled={pending} className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 font-normal outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60" />
        {fieldErrors("display_name")?.map((error) => <span key={error} className="text-xs font-normal text-danger" role="alert">{error}</span>)}
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        A little about you <span className="font-normal text-text-tertiary">Optional</span>
        <textarea name="bio" defaultValue={initialProfile.bio} placeholder="What do you enjoy talking about?" maxLength={280} rows={3} onChange={(event) => setBioLength(event.target.value.length)} disabled={pending} className="min-h-24 resize-y rounded-xl border border-border-base bg-surface px-4 py-2.5 font-normal outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60" />
        {fieldErrors("bio")?.map((error) => <span key={error} className="text-xs font-normal text-danger" role="alert">{error}</span>)}
        <span className="text-right text-xs font-normal text-text-tertiary" aria-live="polite">{bioLength} / 280</span>
      </label>

      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold">What do you enjoy?</legend>
        <p className="mt-1 text-xs leading-5 text-text-soft">Choose at least 5 and up to 20 interests. Shared interests make first hellos easier.</p>
        <p className="mt-2 text-xs font-medium text-accent" aria-live="polite">{selectedInterests.size} selected</p>
        {fieldErrors("interests")?.map((error) => <p key={error} className="mt-2 text-sm text-danger" role="alert">{error}</p>)}
        <div className="mt-4 space-y-5">
          {Object.entries(categories).map(([category, items]) => <section key={category} aria-label={categoryLabels[category] ?? category}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">{categoryLabels[category] ?? category}</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map((interest) => <label key={interest.id} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-border-base bg-surface-card px-3 transition-fast hover:bg-surface-hover has-[:checked]:border-accent/50 has-[:checked]:bg-success-light/80">
                <input type="checkbox" checked={selectedInterests.has(interest.id)} onChange={() => setSelectedInterests((previous) => {
                  const next = new Set(previous);
                  if (next.has(interest.id)) next.delete(interest.id);
                  else if (next.size < 20) next.add(interest.id);
                  return next;
                })} disabled={pending} className="h-4 w-4 shrink-0 accent-accent disabled:opacity-60" />
                <span className="text-sm font-medium">{interest.label}</span>
              </label>)}
            </div>
          </section>)}
        </div>
      </fieldset>

      {state?.ok === false && state.message ? <p className="text-sm text-danger" role="alert">{state.message}</p> : null}
      <button type="submit" disabled={pending || selectedInterests.size < 5} className="min-h-11 w-full rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
        {pending ? "Saving your profile…" : "Finish setting up"}
      </button>
    </form>
  );
}

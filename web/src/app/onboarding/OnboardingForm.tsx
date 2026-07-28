"use client";

import { useActionState, useRef } from "react";
import { useState } from "react";

import { onboardingAction } from "@/app/actions/onboarding";
import type { OnboardingFormState } from "@/lib/validation/auth";

const initialState: OnboardingFormState = undefined;

interface Interest {
  id: string;
  slug: string;
  label: string;
  category: string;
}

interface OnboardingFormProps {
  interests: Interest[];
}

export function OnboardingForm({ interests }: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(onboardingAction, initialState);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const [bioLength, setBioLength] = useState(0);

  const showFieldErrors = (f: "display_name" | "bio" | "interests") =>
    state && state.ok === false ? state.errors?.[f] : undefined;

  const handleInterestToggle = (interestId: string) => {
    const newSelected = new Set(selectedInterests);
    if (newSelected.has(interestId)) {
      newSelected.delete(interestId);
    } else {
      newSelected.add(interestId);
    }
    setSelectedInterests(newSelected);
  };

  const groupedInterests = interests.reduce(
    (acc, interest) => {
      if (!acc[interest.category]) {
        acc[interest.category] = [];
      }
      acc[interest.category].push(interest);
      return acc;
    },
    {} as Record<string, Interest[]>
  );

  const categoryLabels: Record<string, string> = {
    creative: "Creative",
    outdoors: "Outdoors",
    food: "Food & Drink",
    games: "Games & Tech",
    learn: "Learn & Culture",
    lifestyle: "Lifestyle",
    music: "Music",
    sports: "Sports",
  };

  const handleFormAction = async (formData: FormData) => {
    // Add selected interests to form data before submitting
    formData.set("interests", JSON.stringify(Array.from(selectedInterests)));
    return formAction(formData);
  };

  return (
    <form action={handleFormAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Display Name</span>
        <input
          type="text"
          name="display_name"
          placeholder="e.g., Alex, Morgan, Jamie"
          maxLength={255}
          required
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700 disabled:opacity-60"
        />
        {showFieldErrors("display_name")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Bio (optional)</span>
        <textarea
          ref={bioRef}
          name="bio"
          placeholder="Tell us about yourself"
          maxLength={280}
          rows={3}
          onChange={(e) => setBioLength(e.target.value.length)}
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700 resize-none disabled:opacity-60"
        />
        {showFieldErrors("bio")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
        <p className="text-xs text-zinc-500">
          {bioLength} / 280
        </p>
      </label>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <span className="font-medium">Select at least 5 interests</span>
          <p className="text-xs text-zinc-500 mt-1">
            These help us match you with people you&apos;ll connect with.
          </p>
        </div>

        {showFieldErrors("interests")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}

        <div className="space-y-4">
          {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                {categoryLabels[category] || category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {categoryInterests.map((interest) => (
                  <label
                    key={interest.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedInterests.has(interest.id)}
                      onChange={() => handleInterestToggle(interest.id)}
                      disabled={pending}
                      className="rounded border-zinc-300 bg-background dark:border-zinc-700 cursor-pointer disabled:opacity-60"
                    />
                    <span className="text-sm">{interest.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {state && state.ok === false && state.message ? (
        <p className="text-sm text-red-600" role="alert">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || selectedInterests.size < 5}
        className="rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Setting up…" : `Complete (${selectedInterests.size} selected)`}
      </button>
    </form>
  );
}

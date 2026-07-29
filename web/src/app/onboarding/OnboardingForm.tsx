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
          className="rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60"
        />
        {showFieldErrors("display_name")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
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
          className="rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none focus:ring-1 focus:ring-accent/30 resize-none disabled:opacity-60"
        />
        {showFieldErrors("bio")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
        ))}
        <p className="text-xs text-text-tertiary">
          {bioLength} / 280
        </p>
      </label>

      <div className="flex flex-col gap-3 text-sm">
        <div>
          <span className="font-medium">Select at least 5 interests</span>
          <p className="text-xs text-text-tertiary mt-1">
            These help us match you with people you&apos;ll connect with.
          </p>
        </div>

        {showFieldErrors("interests")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}

        <div className="space-y-4">
          {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase text-text-soft">
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
                      className="rounded border-border-base bg-surface cursor-pointer disabled:opacity-60 accent-accent"
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
        <p className="text-sm text-danger" role="alert">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || selectedInterests.size < 5}
        className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50"
      >
        {pending ? "Setting up…" : `Complete (${selectedInterests.size} selected)`}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";

import { signupAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";

const initialState: AuthFormState = undefined;

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const showFieldErrors = (f: "email" | "password" | "date_of_birth") =>
    state && state.ok === false ? state.errors?.[f] : undefined;

  // Calculate max date (13 years ago) for the date input
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        {showFieldErrors("email")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
        ))}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date of Birth</span>
        <input
          type="date"
          name="date_of_birth"
          max={maxDateStr}
          required
          className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        {showFieldErrors("date_of_birth")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
        ))}
        <p className="text-xs text-text-tertiary">
          You must be at least 13 to sign up.
        </p>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        {showFieldErrors("password")?.map((e) => (
          <p key={e} className="text-xs text-danger">{e}</p>
        ))}
        <p className="text-xs text-text-tertiary">
          8+ characters, with at least one letter and one number.
        </p>
      </label>

      {state && state.ok === false && state.message ? (
        <p className="text-sm text-danger" role="alert">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

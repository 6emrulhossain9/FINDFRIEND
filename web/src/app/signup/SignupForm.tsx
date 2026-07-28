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
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700"
        />
        {showFieldErrors("email")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Date of Birth</span>
        <input
          type="date"
          name="date_of_birth"
          max={maxDateStr}
          required
          className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700"
        />
        {showFieldErrors("date_of_birth")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
        <p className="text-xs text-zinc-500">
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
          className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700"
        />
        {showFieldErrors("password")?.map((e) => (
          <p key={e} className="text-xs text-red-600">{e}</p>
        ))}
        <p className="text-xs text-zinc-500">
          8+ characters, with at least one letter and one number.
        </p>
      </label>

      {state && state.ok === false && state.message ? (
        <p className="text-sm text-red-600" role="alert">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

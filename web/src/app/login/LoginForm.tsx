"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { signInWithGoogleAction } from "@/app/actions/auth";
import type { AuthFormState } from "@/lib/validation/auth";

const initialState: AuthFormState = undefined;

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const showFieldErrors = (f: "email" | "password") =>
    state && state.ok === false ? state.errors?.[f] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

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
          <span className="font-medium">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="min-h-11 rounded-xl border border-border-base bg-surface px-4 py-2.5 outline-none transition-fast focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
          {showFieldErrors("password")?.map((e) => (
            <p key={e} className="text-xs text-danger">{e}</p>
          ))}
        </label>

        {state && state.ok === false && state.message ? (
          <p className="text-sm text-danger" role="alert">{state.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-text-tertiary">
        <span className="h-px flex-1 bg-separator" />
        or
        <span className="h-px flex-1 bg-separator" />
      </div>

      <form action={signInWithGoogleAction}>
        <button
          type="submit"
          className="min-h-11 w-full rounded-full border border-border-base bg-surface-card px-5 py-2.5 text-sm font-semibold text-text-main transition-fast hover:bg-surface-hover active:scale-[0.98]"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}

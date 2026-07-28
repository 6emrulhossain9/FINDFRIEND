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
            className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700"
          />
          {showFieldErrors("email")?.map((e) => (
            <p key={e} className="text-xs text-red-600">{e}</p>
          ))}
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            className="rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700"
          />
          {showFieldErrors("password")?.map((e) => (
            <p key={e} className="text-xs text-red-600">{e}</p>
          ))}
        </label>

        {state && state.ok === false && state.message ? (
          <p className="text-sm text-red-600" role="alert">{state.message}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        or
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form action={signInWithGoogleAction}>
        <button
          type="submit"
          className="w-full rounded-md border border-zinc-300 bg-background px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}

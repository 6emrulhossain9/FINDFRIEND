"use client";

import { useActionState } from "react";
import { createPostAction } from "@/app/actions/posts";

export function PostComposer() {
  const [state, formAction, pending] = useActionState(createPostAction, undefined);

  return (
    <form action={formAction} className="apple-card p-5">
      <textarea
        name="content"
        placeholder="What's on your mind?"
        maxLength={5000}
        rows={3}
        required
        disabled={pending}
        className="w-full rounded-xl border border-border-base bg-surface px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent/30 dark:border-border-base resize-none disabled:opacity-60 placeholder:text-text-soft"
      />
      {state && state.ok === false && state.errors?.content && (
        <p className="mt-2 text-xs text-danger">
          {state.errors.content.join(", ")}
        </p>
      )}
      {state && state.ok === false && state.message && (
        <p className="mt-2 text-xs text-danger">{state.message}</p>
      )}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] active:bg-accent-dark disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}

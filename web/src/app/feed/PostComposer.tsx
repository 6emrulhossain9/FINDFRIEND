"use client";

import { useActionState } from "react";
import { createPostAction } from "@/app/actions/posts";

export function PostComposer() {
  const [state, formAction, pending] = useActionState(createPostAction, undefined);

  return (
    <form action={formAction} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <textarea
        name="content"
        placeholder="What's on your mind?"
        maxLength={5000}
        rows={3}
        required
        disabled={pending}
        className="w-full rounded-md border border-zinc-300 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/30 dark:border-zinc-700 resize-none disabled:opacity-60"
      />
      {state && state.ok === false && state.errors?.content && (
        <p className="mt-2 text-xs text-red-600">
          {state.errors.content.join(", ")}
        </p>
      )}
      {state && state.ok === false && state.message && (
        <p className="mt-2 text-xs text-red-600">{state.message}</p>
      )}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}

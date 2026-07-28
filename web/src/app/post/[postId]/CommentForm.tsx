"use client";

import { useActionState } from "react";

import { createCommentAction } from "@/app/actions/posts";
import type { SocialFormState } from "@/lib/validation/social";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState<SocialFormState, FormData>(
    createCommentAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="post_id" value={postId} />
      <textarea
        name="content"
        rows={2}
        maxLength={1000}
        placeholder="Write a comment…"
        required
        disabled={pending}
        className="w-full resize-none rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/30 disabled:opacity-60 dark:border-zinc-700"
      />
      {state && state.ok === false && state.errors?.content && (
        <p className="text-xs text-red-600">
          {state.errors.content.join(", ")}
        </p>
      )}
      {state && state.ok === false && state.message && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
    </form>
  );
}

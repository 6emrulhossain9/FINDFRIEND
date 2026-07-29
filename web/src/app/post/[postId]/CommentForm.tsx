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
        className="w-full resize-none rounded-xl border border-border-base bg-surface px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60 placeholder:text-text-soft"
      />
      {state && state.ok === false && state.errors?.content && (
        <p className="text-xs text-danger">
          {state.errors.content.join(", ")}
        </p>
      )}
      {state && state.ok === false && state.message && (
        <p className="text-xs text-danger">{state.message}</p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] active:bg-accent-dark disabled:opacity-50"
        >
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
    </form>
  );
}

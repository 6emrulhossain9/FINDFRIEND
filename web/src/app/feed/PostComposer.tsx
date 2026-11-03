"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { createPostAction } from "@/app/actions/posts";

const MAX_POST_LENGTH = 5000;

export function PostComposer() {
  const [state, formAction, pending] = useActionState(createPostAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} onReset={() => setLength(0)} className="apple-card p-4 sm:p-5">
      <label htmlFor="post-content" className="sr-only">Share something with your community</label>
      <textarea
        id="post-content"
        name="content"
        placeholder="What’s something good you’d like to share?"
        maxLength={MAX_POST_LENGTH}
        rows={3}
        required
        disabled={pending}
        aria-describedby="post-length post-result"
        onChange={(event) => setLength(event.currentTarget.value.length)}
        className="min-h-28 w-full resize-y rounded-2xl border border-border-base bg-surface px-4 py-3 text-sm leading-6 outline-none transition-fast placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <span id="post-length" className="text-xs text-text-tertiary">{length.toLocaleString()} / {MAX_POST_LENGTH.toLocaleString()}</span>
        <button type="submit" disabled={pending || length === 0} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-fast hover:-translate-y-0.5 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-45">
          <Send aria-hidden="true" className="h-4 w-4" />{pending ? "Sharing…" : "Share post"}
        </button>
      </div>
      <div id="post-result" className="mt-2 min-h-5" aria-live="polite" aria-atomic="true">
        {state?.ok === true ? <p className="text-sm font-medium text-success">Your post is live in the feed.</p> : null}
        {state?.ok === false ? <div className="flex flex-wrap items-center gap-x-2 text-sm text-danger" role="alert"><span>{state.message ?? state.errors?.content?.[0] ?? "Please check your post and try again."}</span>{state.recoveryHref ? <Link href={state.recoveryHref} className="font-semibold underline underline-offset-2">Complete your profile</Link> : null}</div> : null}
      </div>
    </form>
  );
}

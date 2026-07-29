"use client";

import { useActionState } from "react";

import type { MessageFormState } from "@/lib/validation/messages";

interface MessageComposerProps {
  conversationId: string;
  action: (prevState: MessageFormState, formData: FormData) => Promise<MessageFormState>;
}

export function MessageComposer({ conversationId, action }: MessageComposerProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="apple-card p-4">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <div className="flex gap-3 items-end">
        <textarea
          name="content"
          rows={2}
          maxLength={2000}
          placeholder="iMessage"
          required
          disabled={pending}
          className="flex-1 resize-none rounded-xl border border-border-base bg-surface px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-60 placeholder:text-text-soft"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50 shrink-0"
        >
          {pending ? "…" : "Send"}
        </button>
      </div>
      {state && state.ok === false && state.errors?.content && (
        <p className="mt-2 text-xs text-danger">{state.errors.content.join(", ")}</p>
      )}
      {state && state.ok === false && state.message && (
        <p className="mt-2 text-xs text-danger">{state.message}</p>
      )}
    </form>
  );
}

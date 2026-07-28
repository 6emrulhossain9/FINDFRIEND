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
    <form action={formAction} className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <textarea
        name="content"
        rows={3}
        maxLength={2000}
        placeholder="Write a message…"
        required
        disabled={pending}
        className="w-full resize-none rounded-md border border-zinc-300 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/30 disabled:opacity-60 dark:border-zinc-700"
      />
      {state && state.ok === false && state.errors?.content && (
        <p className="mt-2 text-xs text-red-600">{state.errors.content.join(", ")}</p>
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
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}

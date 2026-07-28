"use client";

import { useActionState } from "react";

import { openConversationAction } from "@/app/actions/messages";

interface OpenConversationFormProps {
  partnerId: string;
}

export function OpenConversationForm({ partnerId }: OpenConversationFormProps) {
  const [, formAction, pending] = useActionState(openConversationAction, undefined);

  return (
    <form action={formAction}>
      <input type="hidden" name="partner_id" value={partnerId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 disabled:opacity-60"
      >
        {pending ? "Opening…" : "Message"}
      </button>
    </form>
  );
}

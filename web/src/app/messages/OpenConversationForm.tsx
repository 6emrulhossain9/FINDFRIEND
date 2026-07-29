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
        className="w-full rounded-full border border-accent px-5 py-2.5 text-sm font-normal text-accent transition-fast hover:bg-accent/5 active:scale-[0.95] disabled:opacity-50"
      >
        {pending ? "Opening…" : "Message"}
      </button>
    </form>
  );
}

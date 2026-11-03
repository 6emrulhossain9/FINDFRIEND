// FriendRequestInbox — Apple-style pending friend requests list
//
// Each row shows the requester's avatar and name, with Accept / Decline
// buttons. Submitting posts to `respondToFriendRequest`.

"use client";

import { useActionState } from "react";

import { respondToFriendRequest } from "@/app/actions/social";
import type { SocialFormState } from "@/lib/validation/social";

export interface PendingRequest {
  id: string;
  created_at: string;
  requester: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

interface FriendRequestInboxProps {
  requests: PendingRequest[];
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min !== 1 ? "s" : ""} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr !== 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day !== 1 ? "s" : ""} ago`;
}

export function FriendRequestInbox({ requests }: FriendRequestInboxProps) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-text-soft">No pending requests.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {requests.map((r) => (
        <InboxRow key={r.id} request={r} />
      ))}
    </ul>
  );
}

function InboxRow({ request }: { request: PendingRequest }) {
  const [state, formAction, pending] = useActionState<SocialFormState, FormData>(
    respondToFriendRequest,
    undefined,
  );
  const exiting = state?.ok === true;

  return (
    <li
      className={`flex items-center gap-3 rounded-xl bg-surface-hover p-3.5 transition-all duration-200 ease-out ${
        exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      {request.requester?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={request.requester.avatar_url}
          alt={request.requester.display_name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-black"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-lg ring-2 ring-white dark:ring-black">
          👤
        </div>
      )}

      <div className="flex-1">
        <p className="text-sm font-medium text-text-main">
          {request.requester?.display_name ?? "Someone"}
        </p>
        <p className="text-xs text-text-soft">{timeAgo(request.created_at)}</p>
      </div>

      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="friendship_id" value={request.id} />
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50"
        >
          Accept
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          disabled={pending}
          className="rounded-full border border-border-base px-4 py-1.5 text-xs font-medium text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95] disabled:opacity-50"
        >
          Decline
        </button>
      </form>

      {state && state.ok === false && state.message && (
        <p className="basis-full text-xs text-danger">{state.message}</p>
      )}
    </li>
  );
}

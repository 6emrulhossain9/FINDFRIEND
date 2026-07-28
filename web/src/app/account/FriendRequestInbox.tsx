// FriendRequestInbox — list of pending friend requests the user has received.
//
// Each row shows the requester's avatar and name, with Accept / Decline
// buttons. Submitting posts to `respondToFriendRequest` (Phase 3).

"use client";

import { useActionState, useEffect } from "react";

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
      <p className="text-sm text-zinc-500">No pending requests.</p>
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

  // After success, the row will disappear on the next render (because the
  // page revalidates) — but we still hide the buttons so the user sees
  // immediate feedback.
  useEffect(() => {
    if (state && state.ok === true) {
      // no-op; row refresh happens via revalidatePath
    }
  }, [state]);

  return (
    <li className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      {request.requester?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={request.requester.avatar_url}
          alt={request.requester.display_name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-300 text-lg dark:bg-zinc-700">
          👤
        </div>
      )}

      <div className="flex-1">
        <p className="text-sm font-medium">
          {request.requester?.display_name ?? "Someone"}
        </p>
        <p className="text-xs text-zinc-500">{timeAgo(request.created_at)}</p>
      </div>

      <form action={formAction} className="flex gap-2">
        <input type="hidden" name="friendship_id" value={request.id} />
        <button
          type="submit"
          name="decision"
          value="accept"
          disabled={pending}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Accept
        </button>
        <button
          type="submit"
          name="decision"
          value="decline"
          disabled={pending}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900 disabled:opacity-60"
        >
          Decline
        </button>
      </form>

      {state && state.ok === false && state.message && (
        <p className="basis-full text-xs text-red-600">{state.message}</p>
      )}
    </li>
  );
}
"use client";

import Link from "next/link";
import { useActionState } from "react";

import { sendFriendRequest } from "@/app/actions/social";

interface DiscoverCardProps {
  candidate: {
    id: string;
    display_name: string;
    age_bracket: string | null;
    bio: string | null;
    avatar_url: string | null;
    shared_interests: { id: string; label: string }[];
    score: number;
    pending: boolean;
  };
}

export function DiscoverCard({ candidate }: DiscoverCardProps) {
  const [state, formAction, pending] = useActionState(sendFriendRequest, undefined);

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <header className="flex items-start gap-3">
        {candidate.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.avatar_url}
            alt={candidate.display_name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-300 text-2xl dark:bg-zinc-700">
            👤
          </div>
        )}
        <div className="flex-1">
          <Link
            href={`/profiles/${candidate.id}`}
            className="font-medium hover:underline"
          >
            {candidate.display_name}
          </Link>
          {candidate.age_bracket && (
            <p className="text-xs text-zinc-500">{candidate.age_bracket}</p>
          )}
        </div>
        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {Math.round(candidate.score * 100)}% match
        </span>
      </header>

      {candidate.bio && (
        <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
          {candidate.bio}
        </p>
      )}

      {candidate.shared_interests.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidate.shared_interests.slice(0, 4).map((i) => (
            <span
              key={i.id}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {i.label}
            </span>
          ))}
          {candidate.shared_interests.length > 4 && (
            <span className="text-xs text-zinc-500">
              +{candidate.shared_interests.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2">
        {candidate.pending ? (
          <span className="text-xs text-zinc-500">Request sent</span>
        ) : (
          <form action={formAction} className="flex-1">
            <input type="hidden" name="target_user_id" value={candidate.id} />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-foreground px-3 py-2 text-sm text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send friend request"}
            </button>
          </form>
        )}
        {state && state.ok === false && state.message && (
          <p className="text-xs text-red-600">{state.message}</p>
        )}
      </div>
    </article>
  );
}

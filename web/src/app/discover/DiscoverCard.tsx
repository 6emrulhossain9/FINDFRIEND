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
    <article className="apple-card p-5 flex flex-col gap-4">
      <header className="flex items-start gap-3">
        {candidate.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={candidate.avatar_url}
            alt={candidate.display_name}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white dark:ring-black"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover text-2xl ring-2 ring-white dark:ring-black">
            👤
          </div>
        )}
        <div className="flex-1">
          <Link
            href={`/profiles/${candidate.id}`}
            className="font-semibold text-text-main hover:text-accent transition-fast"
          >
            {candidate.display_name}
          </Link>
          {candidate.age_bracket && (
            <p className="text-xs text-text-soft">{candidate.age_bracket}</p>
          )}
        </div>
        <span className="rounded-full bg-success-light px-3 py-1 text-xs font-semibold text-success">
          {Math.round(candidate.score * 100)}% match
        </span>
      </header>

      {candidate.bio && (
        <p className="line-clamp-2 text-sm text-text-main leading-relaxed">
          {candidate.bio}
        </p>
      )}

      {candidate.shared_interests.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {candidate.shared_interests.slice(0, 4).map((i) => (
            <span
              key={i.id}
              className="rounded-full bg-surface-hover px-3 py-1 text-xs text-text-soft"
            >
              {i.label}
            </span>
          ))}
          {candidate.shared_interests.length > 4 && (
            <span className="text-xs text-text-tertiary self-center">
              +{candidate.shared_interests.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        {candidate.pending ? (
          <span className="text-xs text-text-soft">Request sent</span>
        ) : (
          <form action={formAction} className="flex-1">
            <input type="hidden" name="target_user_id" value={candidate.id} />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark active:scale-[0.95] disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send friend request"}
            </button>
          </form>
        )}
        {state && state.ok === false && state.message && (
          <p className="text-xs text-danger">{state.message}</p>
        )}
      </div>
    </article>
  );
}

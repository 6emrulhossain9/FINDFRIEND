"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useActionState } from "react";
import { toggleReactionAction } from "@/app/actions/posts";
import { Avatar } from "@/components/ui/Avatar";

interface PostItemProps {
  post: {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
    post_reactions: Array<{ id: string; reaction_type: string; user_id: string }>;
    comments: Array<{ id: string }>;
  };
  currentUserId: string;
}

const reactions = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Funny" },
  { type: "wow", emoji: "😮", label: "Surprising" },
  { type: "sad", emoji: "😢", label: "Sad" },
];

function displayDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

export function PostItem({ post, currentUserId }: PostItemProps) {
  const [state, formAction, pending] = useActionState(toggleReactionAction, undefined);
  const counts = new Map<string, number>();
  for (const reaction of post.post_reactions) counts.set(reaction.reaction_type, (counts.get(reaction.reaction_type) ?? 0) + 1);
  const myReactions = new Set(post.post_reactions.filter((reaction) => reaction.user_id === currentUserId).map((reaction) => reaction.reaction_type));
  const authorName = post.profiles?.display_name || "Friendnet member";

  return (
    <article className="apple-card overflow-hidden p-4 sm:p-5">
      <header className="flex items-center gap-3">
        <Link href={`/profiles/${post.author_id}`} aria-label={`View ${authorName}’s profile`} className="shrink-0 rounded-full">
          <Avatar src={post.profiles?.avatar_url} alt={authorName} size="md" fallback={authorName.slice(0, 1).toUpperCase()} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profiles/${post.author_id}`} className="truncate text-sm font-semibold text-text-main transition-fast hover:text-accent">{authorName}</Link>
          <time dateTime={post.created_at} className="mt-0.5 block text-xs text-text-tertiary">{displayDate(post.created_at)}</time>
        </div>
      </header>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-text-main">{post.content}</p>

      <div className="mt-4 flex items-center justify-between border-t border-separator pt-3">
        <div role="group" aria-label="React to this post" className="flex flex-wrap gap-1">
          {reactions.map(({ type, emoji, label }) => {
            const count = counts.get(type) ?? 0;
            const selected = myReactions.has(type);
            return <form key={type} action={formAction}>
              <input type="hidden" name="post_id" value={post.id} />
              <input type="hidden" name="reaction_type" value={type} />
              <button type="submit" disabled={pending} aria-label={`${label}${count ? `, ${count}` : ""}${selected ? ", selected" : ""}`} aria-pressed={selected} className={`flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-fast hover:bg-surface-hover disabled:opacity-50 ${selected ? "bg-success-light text-accent" : "text-text-soft"}`}><span aria-hidden="true">{emoji}</span>{count > 0 ? <span className="text-xs font-semibold">{count}</span> : null}</button>
            </form>;
          })}
        </div>
        <Link href={`/post/${post.id}`} aria-label={`${post.comments.length} comments; open this post`} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs text-text-soft transition-fast hover:bg-surface-hover hover:text-accent"><MessageCircle aria-hidden="true" className="h-4 w-4" />{post.comments.length > 0 ? <span>{post.comments.length}</span> : <span>Comment</span>}</Link>
      </div>
      <div aria-live="polite" className="min-h-0">{state?.ok === false ? <p className="mt-2 text-xs text-danger" role="alert">{state.message ?? "Could not save your reaction."}</p> : null}</div>
    </article>
  );
}

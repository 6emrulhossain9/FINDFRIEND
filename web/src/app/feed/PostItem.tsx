"use client";

import Link from "next/link";
import { useActionState } from "react";
import { toggleReactionAction } from "@/app/actions/posts";

interface PostItemProps {
  post: {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    profiles: {
      display_name: string;
      avatar_url: string | null;
    } | null;
    post_reactions: Array<{
      id: string;
      reaction_type: string;
      user_id: string;
    }>;
    comments: Array<{ id: string }>;
  };
  currentUserId: string;
}

const reactionEmojis: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
};

export function PostItem({ post, currentUserId }: PostItemProps) {
  const [, formAction, pending] = useActionState(toggleReactionAction, undefined);

  // Group reactions by type
  const reactionCounts = post.post_reactions.reduce(
    (acc, r) => {
      acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const userReactions = new Set(
    post.post_reactions
      .filter((r) => r.user_id === currentUserId)
      .map((r) => r.reaction_type)
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="apple-card p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {post.profiles?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.profiles.avatar_url}
            alt={post.profiles.display_name}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-black"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-surface-hover flex items-center justify-center ring-2 ring-white dark:ring-black">
            <span className="text-lg">👤</span>
          </div>
        )}
        <div>
          <Link
            href={`/profiles/${post.author_id}`}
            className="font-medium text-sm text-text-main hover:text-accent transition-fast"
          >
            {post.profiles?.display_name || "Unknown"}
          </Link>
          <p className="text-xs text-text-soft">
            {formatDate(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-text-main whitespace-pre-wrap mb-4 leading-relaxed">{post.content}</p>

      {/* Reaction bar — active reactions */}
      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        {Object.entries(reactionCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={async () => {
              const formData = new FormData();
              formData.set("post_id", post.id);
              formData.set("reaction_type", type);
              await formAction(formData);
            }}
            disabled={pending}
            className={`rounded-full px-3 py-1.5 transition-fast active:scale-95 ${
              userReactions.has(type)
                ? "bg-accent/10 text-accent font-medium"
                : "bg-surface-hover text-text-soft hover:bg-surface-hover"
            }`}
          >
            {reactionEmojis[type] || type} {count}
          </button>
        ))}
      </div>

      {/* Reaction emoji buttons */}
      <div className="flex gap-3 pt-3 border-t border-separator text-sm">
        {Object.entries(reactionEmojis).map(([type, emoji]) => (
          <form key={type} action={formAction} className="flex-1">
            <input type="hidden" name="post_id" value={post.id} />
            <input type="hidden" name="reaction_type" value={type} />
            <button
              type="submit"
              disabled={pending}
              className={`w-full py-1.5 rounded-full transition-fast active:scale-90 ${
                userReactions.has(type)
                  ? "bg-accent/10"
                  : "hover:bg-surface-hover"
              }`}
            >
              {emoji}
            </button>
          </form>
        ))}
      </div>

      {/* Comments count */}
      {post.comments.length > 0 && (
        <Link
          href={`/post/${post.id}`}
          className="mt-3 text-xs text-text-soft hover:text-accent transition-fast inline-block"
        >
          {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
        </Link>
      )}
    </div>
  );
}

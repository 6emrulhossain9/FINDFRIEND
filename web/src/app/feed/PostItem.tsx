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
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {post.profiles?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.profiles.avatar_url}
            alt={post.profiles.display_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center">
            <span className="text-lg">👤</span>
          </div>
        )}
        <div>
          <Link
            href={`/profiles/${post.author_id}`}
            className="font-medium hover:underline"
          >
            {post.profiles?.display_name || "Unknown"}
          </Link>
          <p className="text-xs text-zinc-500">
            {formatDate(post.created_at)}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm whitespace-pre-wrap mb-4">{post.content}</p>

      {/* Reactions */}
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
            className={`rounded-full px-2 py-1 transition-colors ${
              userReactions.has(type)
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {reactionEmojis[type] || type} {count}
          </button>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="flex gap-4 border-t border-zinc-200 dark:border-zinc-700 pt-3 text-xs text-zinc-600">
        {Object.entries(reactionEmojis).map(([type, emoji]) => (
          <form key={type} action={formAction} className="flex-1">
            <input type="hidden" name="post_id" value={post.id} />
            <input type="hidden" name="reaction_type" value={type} />
            <button
              type="submit"
              disabled={pending}
              className="w-full py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors disabled:opacity-60"
            >
              {emoji}
            </button>
          </form>
        ))}
      </div>

      {/* Comments count */}
      {post.comments.length > 0 && (
        <p className="mt-3 text-xs text-zinc-500">
          {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

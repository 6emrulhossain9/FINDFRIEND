"use client";

import Link from "next/link";

interface CommentProps {
  comment: {
    id: string;
    author_id: string;
    content: string;
    created_at: string;
    profiles: { display_name: string; avatar_url: string | null } | null;
  };
}

export function CommentItem({ comment }: CommentProps) {
  const date = new Date(comment.created_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mb-1 flex items-center gap-2">
        <Link
          href={`/profiles/${comment.author_id}`}
          className="font-medium hover:underline"
        >
          {comment.profiles?.display_name ?? "Unknown"}
        </Link>
        <span className="text-xs text-zinc-500">{date}</span>
      </div>
      <p className="whitespace-pre-wrap">{comment.content}</p>
    </li>
  );
}

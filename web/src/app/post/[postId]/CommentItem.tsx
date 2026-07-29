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
    <li className="rounded-xl bg-surface-hover p-4 text-sm animate-fade-in">
      <div className="mb-1 flex items-center gap-2">
        <Link
          href={`/profiles/${comment.author_id}`}
          className="font-medium text-sm text-text-main hover:text-accent transition-fast"
        >
          {comment.profiles?.display_name ?? "Unknown"}
        </Link>
        <span className="text-xs text-text-tertiary">{date}</span>
      </div>
      <p className="whitespace-pre-wrap text-text-main leading-relaxed">{comment.content}</p>
    </li>
  );
}

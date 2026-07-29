// /post/[postId] — post detail page with comments.
//
// Renders one post (with author + reactions) and a list of comments below it.
// Comments can be added via a Server Action (`createCommentAction`).
// Soft-deleted posts/comments are filtered out by the RLS policies + the
// `deleted_at is null` filter applied in the queries below.

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";

interface PostPageProps {
  // In Next 15+, dynamic route params are async. See AGENTS.md.
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  const session = await verifySession();
  if (!session) {
    redirect(`/login?next=/post/${postId}`);
  }

  const supabase = await createServerSupabase();

  // Load the post, comments, and author profile in one query.
  const { data: post, error } = await supabase
    .from("posts")
    .select(
      `
      id,
      author_id,
      content,
      created_at,
      profiles(display_name, avatar_url),
      post_reactions(id, reaction_type, user_id)
      `,
    )
    .eq("id", postId)
    .is("deleted_at", null)
    .single();

  if (error || !post) {
    notFound();
  }

  // Filter posts from blocked users.
  const { data: blocked } = await supabase
    .from("blocks")
    .select("blocked_user_id")
    .eq("user_id", session.user.id);
  const blockedIds = new Set((blocked ?? []).map((b) => b.blocked_user_id));

  if (blockedIds.has(post.author_id)) {
    notFound();
  }

  // Comments + their authors in one round trip.
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      id,
      author_id,
      content,
      created_at,
      profiles(display_name, avatar_url)
      `,
    )
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const reactionCount = post.post_reactions?.length ?? 0;
  const authorProfile = post.profiles?.[0] ?? null;
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/feed"
        className="mb-4 inline-block text-sm text-text-tertiary hover:text-accent transition-fast"
      >
        ← Back to feed
      </Link>

      <article className="apple-card p-5">
        <header className="mb-3 flex items-center gap-3">
          {authorProfile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorProfile.avatar_url}
              alt={authorProfile.display_name ?? ""}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-lg ring-2 ring-white dark:ring-black">
              👤
            </div>
          )}
          <div>
            <Link
              href={`/profiles/${post.author_id}`}
              className="font-medium hover:underline"
            >
              {authorProfile?.display_name ?? "Unknown"}
            </Link>
            <p className="text-xs text-text-tertiary">{formatDate(post.created_at)}</p>
          </div>
        </header>
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        {reactionCount > 0 && (
          <p className="mt-3 text-xs text-text-tertiary">
            {reactionCount} reaction{reactionCount !== 1 ? "s" : ""}
          </p>
        )}
      </article>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">
          Comments ({(comments ?? []).length})
        </h2>
        <CommentForm postId={postId} />
        <ul className="mt-4 space-y-3">
          {(comments ?? []).map((c) => (
            <CommentItem
              key={c.id}
              comment={{
                id: c.id,
                author_id: c.author_id,
                content: c.content,
                created_at: c.created_at,
                profiles: c.profiles?.[0] ?? null,
              }}
            />
          ))}
        </ul>
      </section>
    </main>
  );
}

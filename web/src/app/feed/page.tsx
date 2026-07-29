// /feed — main feed page (Phase 2)
// Shows posts from all users (except blocked), ordered by recency.

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PostComposer } from "./PostComposer";
import { PostItem } from "./PostItem";
import { AppLayout } from "@/components/layout/AppLayout";

interface RenderablePost {
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
}

export default async function FeedPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/feed");
  }

  const supabase = await createServerSupabase();

  // Get user's blocked list
  const { data: blockedUsers } = await supabase
    .from("blocks")
    .select("blocked_user_id")
    .eq("user_id", session.user.id);

  const blockedIds = (blockedUsers ?? []).map((b) => b.blocked_user_id);

  // Fetch posts (exclude blocked users, order by recency)
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      id,
      author_id,
      content,
      created_at,
      profiles(display_name, avatar_url),
      post_reactions(id, reaction_type, user_id),
      comments(id)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  // Filter out blocked users and reshape for PostItem (single profile, not array).
  const filteredPosts: RenderablePost[] = (posts ?? [])
    .filter((p) => !blockedIds.includes(p.author_id))
    .map((p) => ({
      id: p.id,
      author_id: p.author_id,
      content: p.content,
      created_at: p.created_at,
      profiles: p.profiles?.[0] ?? null,
      post_reactions: p.post_reactions,
      comments: p.comments,
    }));

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="mt-2 text-sm text-text-soft">
            Posts from everyone on ViCo
          </p>
        </div>

        <PostComposer />

        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <p className="py-12 text-center text-text-soft">
              No posts yet. Be the first to share!
            </p>
          ) : (
            filteredPosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                currentUserId={session.user.id}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

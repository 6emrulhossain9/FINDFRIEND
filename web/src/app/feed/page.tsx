import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostComposer } from "./PostComposer";
import { PostItem } from "./PostItem";

interface RenderablePost {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
  post_reactions: Array<{ id: string; reaction_type: string; user_id: string }>;
  comments: Array<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your feed" };

export default async function FeedPage() {
  const session = await verifySession();
  if (!session) redirect("/login?next=/feed");

  const supabase = await createServerSupabase();
  const [blockedByMe, blockedMe, mutedByMe, postsResult] = await Promise.all([
    supabase.from("blocks").select("blocked_user_id").eq("user_id", session.user.id),
    supabase.from("blocks").select("user_id").eq("blocked_user_id", session.user.id),
    supabase.from("mutes").select("muted_user_id").eq("user_id", session.user.id),
    supabase.from("posts").select("id, author_id, content, created_at, profiles(display_name, avatar_url), post_reactions(id, reaction_type, user_id), comments(id)")
      .is("deleted_at", null).order("created_at", { ascending: false }).limit(30),
  ]);

  const firstError = [blockedByMe.error, blockedMe.error, mutedByMe.error, postsResult.error].find(Boolean);
  if (firstError) console.error("Feed data could not be loaded", { code: firstError.code });
  const hiddenIds = new Set([
    ...(blockedByMe.data ?? []).map((row) => row.blocked_user_id),
    ...(blockedMe.data ?? []).map((row) => row.user_id),
    ...(mutedByMe.data ?? []).map((row) => row.muted_user_id),
  ]);
  const posts: RenderablePost[] = (postsResult.data ?? [])
    .filter((post) => !hiddenIds.has(post.author_id))
    .map((post) => ({
      id: post.id,
      author_id: post.author_id,
      content: post.content,
      created_at: post.created_at,
      profiles: post.profiles?.[0] ?? null,
      post_reactions: post.post_reactions,
      comments: post.comments,
    }));

  return (
    <AppLayout>
      <main className="mx-auto max-w-2xl animate-fade-in">
        <header className="mb-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent"><Sparkles aria-hidden="true" className="h-4 w-4" />Your community</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Your feed</h1>
          <p className="mt-2 text-sm leading-6 text-text-soft">Stories, ideas, and everyday moments from people around the world.</p>
        </header>
        <PostComposer />
        <section aria-label="Recent posts" className="mt-6 space-y-4">
          {firstError ? <div role="alert" className="apple-card p-6 text-center"><p className="font-semibold">Your feed couldn’t load right now.</p><p className="mt-2 text-sm text-text-soft">Please refresh in a moment. Your account and posts are safe.</p></div> : null}
          {!firstError && posts.length === 0 ? <div className="apple-card flex flex-col items-center px-6 py-10 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-success-light text-accent"><Compass aria-hidden="true" className="h-6 w-6" /></span><h2 className="mt-4 text-lg font-semibold">A fresh start</h2><p className="mt-2 max-w-sm text-sm leading-6 text-text-soft">Share a moment above or find people who enjoy the same things you do.</p><Link href="/discover" className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-fast hover:bg-accent-dark">Meet people</Link></div> : null}
          {!firstError ? posts.map((post) => <PostItem key={post.id} post={post} currentUserId={session.user.id} />) : null}
        </section>
      </main>
    </AppLayout>
  );
}

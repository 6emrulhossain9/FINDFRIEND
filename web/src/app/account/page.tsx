// Protected /account page with Apple design

import Link from "next/link";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { FriendRequestInbox, type PendingRequest } from "./FriendRequestInbox";
import { AppLayout } from "@/components/layout/AppLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/account");
  }

  const supabase = await createServerSupabase();

  const [profileResult, requestsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, bio, onboarding_state")
      .eq("id", session.user.id)
      .single(),
    supabase
      .from("friendships")
      .select(
        "id, created_at, requester_id, profiles!friendships_requester_id_fkey(id, display_name, avatar_url)",
      )
      .eq("receiver_id", session.user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = profileResult.data;
  const pendingRequests: PendingRequest[] = (requestsResult.data ?? []).map((r) => {
    const requester = (r as unknown as {
      profiles: Array<{ id: string; display_name: string; avatar_url: string | null }> | null;
    }).profiles;
    return {
      id: r.id,
      created_at: r.created_at,
      requester: requester?.[0] ?? null,
    };
  });

  return (
    <AppLayout>
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-4">
      <header><p className="text-sm font-semibold text-accent">Your space</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">Account</h1><p className="mt-2 text-sm text-text-soft">Manage your profile and see new friend requests.</p></header>

      <section className="apple-card space-y-4 p-5 sm:p-6">
        <div><p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Email address</p><p className="mt-1 font-medium text-text-main">{session.user.email}</p></div>
        {profile?.display_name && (
          <div className="border-t border-separator pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Display name</p>
            <p className="mt-1 font-medium text-text-main">{profile.display_name}</p>
          </div>
        )}
        {profile?.bio && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">About you</p>
            <p className="mt-1 text-text-main">{profile.bio}</p>
          </div>
        )}
        {profile?.display_name ? <Link href="/onboarding" className="inline-flex min-h-10 items-center rounded-full border border-border-base px-4 text-sm font-semibold text-text-main transition-fast hover:bg-surface-hover">Edit profile and interests</Link> : null}
      </section>

      <section className="space-y-3">
        <div><h2 className="text-lg font-semibold text-text-main">Friend requests</h2><p className="mt-1 text-sm text-text-soft">Say hello to someone who wants to connect.</p></div>
        <FriendRequestInbox requests={pendingRequests} />
      </section>
    </main>
    </AppLayout>
  );
}

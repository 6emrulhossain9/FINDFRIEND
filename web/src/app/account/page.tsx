// Protected /account page with Apple design

import Link from "next/link";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import { FriendRequestInbox, type PendingRequest } from "./FriendRequestInbox";

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
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold text-text-main">Your account</h1>

      <section className="apple-card p-5 space-y-3">
        <p className="text-sm text-text-soft">Signed in as</p>
        <p className="font-medium text-text-main">{session.user.email}</p>
        {profile?.display_name && (
          <div className="pt-3 border-t border-separator">
            <p className="text-sm text-text-soft">Display name</p>
            <p className="mt-1 font-medium text-text-main">{profile.display_name}</p>
          </div>
        )}
        {profile?.bio && (
          <div>
            <p className="text-sm text-text-soft">Bio</p>
            <p className="mt-1 text-text-main">{profile.bio}</p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-text-main">Friend requests</h2>
        <FriendRequestInbox requests={pendingRequests} />
      </section>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-text-main">Navigate</h2>
        <Link
          href="/feed"
          className="block rounded-full border border-border-base px-5 py-2.5 text-sm font-normal text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
        >
          Go to Feed
        </Link>
        <Link
          href="/discover"
          className="block rounded-full border border-border-base px-5 py-2.5 text-sm font-normal text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
        >
          Discover people
        </Link>
          <Link
            href="/messages"
            className="block rounded-full border border-border-base px-5 py-2.5 text-sm font-normal text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
          >
            Messages
          </Link>
          <Link
            href="/notifications"
            className="block rounded-full border border-border-base px-5 py-2.5 text-sm font-normal text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
          >
            Notifications
          </Link>
        <Link
          href={`/profiles/${session.user.id}`}
          className="block rounded-full border border-border-base px-5 py-2.5 text-sm font-normal text-text-main transition-fast hover:bg-surface-hover active:scale-[0.95]"
        >
          View Your Profile
        </Link>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full rounded-full border border-danger/30 px-5 py-2.5 text-sm font-normal text-danger transition-fast hover:bg-danger-light active:scale-[0.95]"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

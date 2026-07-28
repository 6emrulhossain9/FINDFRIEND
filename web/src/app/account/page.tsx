// Protected /account page. The proxy (src/proxy.ts) already redirects
// anonymous users to /login, so by the time this Server Component runs
// we have a valid session.

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

  // Profile + pending friend requests fetched in parallel.
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
    // Supabase returns the joined row as either a single object (one-to-one)
    // or an array (one-to-many), depending on the relationship. The
    // `requester_id` is unique, so we expect a single object — but the
    // typing comes back as an array, so we narrow.
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
      <h1 className="text-2xl font-semibold">Your account</h1>

      <section className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">Signed in as</p>
        <p className="mt-1 font-medium">{session.user.email}</p>
        {profile?.display_name && (
          <div className="mt-3 pt-3 border-t border-zinc-300 dark:border-zinc-700">
            <p className="text-zinc-600 dark:text-zinc-400">Display name</p>
            <p className="mt-1 font-medium">{profile.display_name}</p>
          </div>
        )}
        {profile?.bio && (
          <div className="mt-2">
            <p className="text-zinc-600 dark:text-zinc-400">Bio</p>
            <p className="mt-1">{profile.bio}</p>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Friend requests</h2>
        <FriendRequestInbox requests={pendingRequests} />
      </section>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Navigate</h2>
        <Link
          href="/feed"
          className="block rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Go to Feed
        </Link>
        <Link
          href="/discover"
          className="block rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Discover people
        </Link>
          <Link
            href="/messages"
            className="block rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Messages
          </Link>
          <Link
            href="/notifications"
            className="block rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Notifications
          </Link>
        <Link
          href={`/profiles/${session.user.id}`}
          className="block rounded-md border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          View Your Profile
        </Link>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="w-full rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

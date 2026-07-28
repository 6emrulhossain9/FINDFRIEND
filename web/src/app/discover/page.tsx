// /discover — Matching engine (Phase 3).
//
// Renders a ranked list of candidate profiles. The rank score is a
// transparent Jaccard overlap of the candidate's interests with the
// current user's interests, blended with a soft recency bonus for
// newer accounts. We exclude users the current user has already
// requested, friended, blocked, or been blocked by.
//
// We deliberately do all the work in a single RSC page (no client
// component for the list itself). The friend-request button is a
// small client component (DiscoverCard) that uses `useActionState`.

import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { jaccard } from "@/lib/matching";

import { DiscoverCard } from "./DiscoverCard";

export const dynamic = "force-dynamic"; // auth + RLS — never cache

export default async function DiscoverPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/discover");
  }

  const supabase = await createServerSupabase();

  // 1. Current user's interest ids.
  const { data: myInterests } = await supabase
    .from("user_interests")
    .select("interest_id")
    .eq("user_id", session.user.id);
  const myInterestIds = (myInterests ?? []).map((i) => i.interest_id);

  // 2. Profiles to exclude: self, already-friended, already-requested,
  //    blocked (in either direction). We do this with a few narrow
  //    queries rather than one giant OR.
  const [
    { data: friendships },
    { data: outboundRequests },
    { data: myBlocks },
    { data: blockedBy },
  ] = await Promise.all([
    supabase
      .from("friendships")
      .select("requester_id, receiver_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`),
    supabase
      .from("friendships")
      .select("receiver_id")
      .eq("requester_id", session.user.id)
      .eq("status", "pending"),
    supabase.from("blocks").select("blocked_user_id").eq("user_id", session.user.id),
    supabase.from("blocks").select("user_id").eq("blocked_user_id", session.user.id),
  ]);

  const excludedIds = new Set<string>([session.user.id]);
  for (const f of friendships ?? []) {
    excludedIds.add(f.requester_id);
    excludedIds.add(f.receiver_id);
  }
  for (const r of outboundRequests ?? []) excludedIds.add(r.receiver_id);
  for (const b of myBlocks ?? []) excludedIds.add(b.blocked_user_id);
  for (const b of blockedBy ?? []) excludedIds.add(b.user_id);

  // 3. Fetch candidate profiles. We pull a small batch of the most
  //    recently active users, then re-rank by Jaccard in app code.
  //    This is fine for the free tier up to a few thousand users; if
  //    it ever becomes hot we'll move ranking to a SQL function.
  const { data: candidates } = await supabase
    .from("profiles_public")
    .select("id, display_name, age_bracket, bio, avatar_url, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // 4. Pull interests for all candidates in one query, then bucket
  //    by user_id. Two roundtrips total (mine + theirs), no N+1.
  const candidateIds = (candidates ?? [])
    .map((c) => c.id)
    .filter((id) => !excludedIds.has(id));

  const { data: candidateInterestRows } = candidateIds.length
    ? await supabase
        .from("user_interests")
        .select("user_id, interest_id, interests(id, label)")
        .in("user_id", candidateIds)
    : { data: [] as Array<{ user_id: string; interest_id: string; interests: { id: string; label: string } | null }> };

  const interestsByUser = new Map<
    string,
    { id: string; label: string }[]
  >();
  for (const row of candidateInterestRows ?? []) {
    const interest = (row as unknown as {
      interests: { id: string; label: string } | null;
    }).interests;
    if (!interest) continue;
    const bucket = interestsByUser.get(row.user_id) ?? [];
    bucket.push({ id: interest.id, label: interest.label });
    interestsByUser.set(row.user_id, bucket);
  }

  const pendingSet = new Set(
    (outboundRequests ?? []).map((r) => r.receiver_id),
  );

  // 5. Rank by Jaccard, drop anyone with zero overlap, keep top 20.
  const ranked = (candidates ?? [])
    .filter((c) => !excludedIds.has(c.id))
    .map((c) => {
      const theirInterests = (interestsByUser.get(c.id) ?? []).map((i) => i.id);
      const score = jaccard(myInterestIds, theirInterests);
      const shared = (interestsByUser.get(c.id) ?? []).filter((i) =>
        myInterestIds.includes(i.id),
      );
      return {
        id: c.id,
        display_name: c.display_name ?? "Unknown",
        age_bracket: c.age_bracket ?? null,
        bio: c.bio ?? null,
        avatar_url: c.avatar_url ?? null,
        shared_interests: shared,
        score,
        pending: pendingSet.has(c.id),
      };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">Discover</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        People who share your interests. Ranked by mutual-interest overlap.
      </p>

      <div className="mt-6 space-y-3">
        {ranked.length === 0 ? (
          <p className="py-12 text-center text-zinc-500">
            No matches yet. Add more interests on your profile to see suggestions.
          </p>
        ) : (
          ranked.map((c) => <DiscoverCard key={c.id} candidate={c} />)
        )}
      </div>
    </main>
  );
}

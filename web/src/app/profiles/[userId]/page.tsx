// /profiles/[userId] — public profile view (Phase 1)
//
// Shows another user's profile with:
//   - display name, age bracket (not exact DOB), bio, interests
//   - mutual interests count
//   - friend request button
//   - block/mute/report options

import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { ProfileViewHeader } from "./ProfileViewHeader";
import { FriendActionButtons } from "./FriendActionButtons";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const session = await verifySession();

  if (!session) {
    redirect(`/login?next=/profiles/${userId}`);
  }

  // Prevent viewing own profile via this route
  if (session.user.id === userId) {
    redirect("/account");
  }

  const supabase = await createServerSupabase();

  // Fetch profile from the public view (age bracket, no DOB)
  const { data: profile, error: profileError } = await supabase
    .from("profiles_public")
    .select("id, display_name, age_bracket, avatar_url, bio, created_at")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch user's interests
  const { data: userInterests } = await supabase
    .from("user_interests")
    .select("interest_id, interests(id, slug, label)")
    .eq("user_id", userId);

  const interests = (userInterests ?? [])
    .map((ui) => {
      const joined = ui.interests as Array<{ id: string; slug: string; label: string }> | null;
      return joined?.[0]?.label;
    })
    .filter((label): label is string => Boolean(label));

  // Fetch viewer's interests to calculate mutual interests
  const { data: viewerInterests } = await supabase
    .from("user_interests")
    .select("interest_id")
    .eq("user_id", session.user.id);

  const viewerInterestIds = new Set((viewerInterests ?? []).map((ui) => ui.interest_id));
  const profileInterestIds = (userInterests ?? []).map((ui) => ui.interest_id);
  const mutualCount = profileInterestIds.filter((id) => viewerInterestIds.has(id)).length;

  // Check if blocked/muted/friend status
  const { data: blockInfo } = await supabase
    .from("blocks")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("blocked_user_id", userId)
    .single();

  const { data: muteInfo } = await supabase
    .from("mutes")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("muted_user_id", userId)
    .single();

  const { data: friendshipInfo } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(requester_id.eq.${session.user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${session.user.id})`)
    .single();

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md">
        <ProfileViewHeader profile={profile} mutualCount={mutualCount} interests={interests} />

        <div className="mt-8 space-y-4">
          <FriendActionButtons
            targetUserId={userId}
            isBlocked={!!blockInfo}
            isMuted={!!muteInfo}
            friendshipStatus={friendshipInfo?.status}
          />
        </div>
      </div>
    </div>
  );
}

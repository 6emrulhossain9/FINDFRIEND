// Social actions: friend requests, block, mute, report (Phase 1+)
//
// All require authentication. All are idempotent where appropriate.

"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import { ReportUserSchema } from "@/lib/validation/social";

type SocialActionState =
  | { ok: false; message?: string; errors?: Record<string, string[]> }
  | { ok: true }
  | undefined;

// --- Friend requests -------------------------------------------------------

export async function sendFriendRequest(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const targetUserId = formData.get("target_user_id") as string;
  if (!targetUserId || targetUserId === session.user.id) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createServerSupabase();

  // Check if already friends or have a pending request
  const { data: existing } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(requester_id.eq.${session.user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${session.user.id})`)
    .single();

  if (existing) {
    return { ok: false, message: `Already ${existing.status} with this user.` };
  }

  // Check if user is blocked by the target
  const { data: blockedByTarget } = await supabase
    .from("blocks")
    .select("id")
    .eq("user_id", targetUserId)
    .eq("blocked_user_id", session.user.id)
    .single();

  if (blockedByTarget) {
    return { ok: false, message: "This user has blocked you." };
  }

  // Create friend request
  const { error } = await supabase.from("friendships").insert({
    requester_id: session.user.id,
    receiver_id: targetUserId,
    status: "pending",
  });

  if (error) {
    return { ok: false, message: "Could not send friend request." };
  }

  await supabase.from("notifications").insert({
    recipient_id: targetUserId,
    actor_id: session.user.id,
    kind: "friend_request",
    entity_type: "friendship",
    data: { requester_id: session.user.id },
  });

  revalidatePath(`/profiles/${targetUserId}`);
  return { ok: true };
}

// --- Block / Unblock -------------------------------------------------------

export async function blockUser(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const targetUserId = formData.get("target_user_id") as string;
  if (!targetUserId || targetUserId === session.user.id) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createServerSupabase();

  // Check if already blocked (idempotent)
  const { data: existing } = await supabase
    .from("blocks")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("blocked_user_id", targetUserId)
    .single();

  if (existing) {
    return { ok: true }; // Already blocked, treat as success
  }

  const { error } = await supabase.from("blocks").insert({
    user_id: session.user.id,
    blocked_user_id: targetUserId,
  });

  if (error) {
    return { ok: false, message: "Could not block user." };
  }

  // Also delete any friendship or pending request
  await supabase
    .from("friendships")
    .delete()
    .or(`and(requester_id.eq.${session.user.id},receiver_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},receiver_id.eq.${session.user.id})`);

  revalidatePath(`/profiles/${targetUserId}`);
  return { ok: true };
}

export async function unblockUser(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const blockedUserId = formData.get("blocked_user_id") as string;
  if (!blockedUserId) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("user_id", session.user.id)
    .eq("blocked_user_id", blockedUserId);

  if (error) {
    return { ok: false, message: "Could not unblock user." };
  }

  revalidatePath(`/profiles/${blockedUserId}`);
  return { ok: true };
}

// --- Mute / Unmute --------------------------------------------------------

export async function muteUser(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const targetUserId = formData.get("target_user_id") as string;
  if (!targetUserId || targetUserId === session.user.id) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createServerSupabase();

  // Check if already muted (idempotent)
  const { data: existing } = await supabase
    .from("mutes")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("muted_user_id", targetUserId)
    .single();

  if (existing) {
    return { ok: true };
  }

  const { error } = await supabase.from("mutes").insert({
    user_id: session.user.id,
    muted_user_id: targetUserId,
  });

  if (error) {
    return { ok: false, message: "Could not mute user." };
  }

  revalidatePath(`/profiles/${targetUserId}`);
  return { ok: true };
}

export async function unmuteUser(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const mutedUserId = formData.get("muted_user_id") as string;
  if (!mutedUserId) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from("mutes")
    .delete()
    .eq("user_id", session.user.id)
    .eq("muted_user_id", mutedUserId);

  if (error) {
    return { ok: false, message: "Could not unmute user." };
  }

  revalidatePath(`/profiles/${mutedUserId}`);
  return { ok: true };
}

// --- Report ----------------------------------------------------------------

export async function reportUser(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const parsed = ReportUserSchema.safeParse({
    reported_user_id: formData.get("reported_user_id"),
    reason: formData.get("reason"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message: "Please choose a reason and keep the description under 1000 characters.",
      errors: flat as Record<string, string[]>,
    };
  }

  if (parsed.data.reported_user_id === session.user.id) {
    return { ok: false, message: "You can't report yourself." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("reports").insert({
    reporter_id: session.user.id,
    reported_user_id: parsed.data.reported_user_id,
    reason: parsed.data.reason,
    description: parsed.data.description,
    status: "open",
  });

  if (error) {
    return { ok: false, message: "Could not submit your report. Please try again." };
  }

  revalidatePath(`/profiles/${parsed.data.reported_user_id}`);
  return { ok: true };
}

// --- Friend request response (accept / decline) ----------------------------
//
// Phase 3 completion: lets the *receiver* of a friend request decide what
// to do with it. Accept flips status to 'accepted'. Decline deletes the
// row (a hard delete — the requester can re-send later).

export async function respondToFriendRequest(
  _prev: SocialActionState,
  formData: FormData,
): Promise<SocialActionState> {
  const session = await verifySession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }

  const friendshipId = formData.get("friendship_id");
  const decision = formData.get("decision");
  if (
    typeof friendshipId !== "string" ||
    (decision !== "accept" && decision !== "decline")
  ) {
    return { ok: false, message: "Invalid request." };
  }

  const supabase = await createServerSupabase();

  // Look up the request to confirm the current user is the receiver.
  const { data: friendship } = await supabase
    .from("friendships")
    .select("id, status, receiver_id, requester_id")
    .eq("id", friendshipId)
    .single();

  if (!friendship) {
    return { ok: false, message: "Friend request not found." };
  }
  if (friendship.receiver_id !== session.user.id) {
    // Auth check: only the receiver can decide.
    return { ok: false, message: "You can't respond to that request." };
  }
  if (friendship.status !== "pending") {
    return { ok: false, message: "This request has already been handled." };
  }

  if (decision === "accept") {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    if (error) {
      return { ok: false, message: "Could not accept the request." };
    }

    await supabase.from("notifications").insert({
      recipient_id: friendship.requester_id,
      actor_id: session.user.id,
      kind: "friend_request_accepted",
      entity_type: "friendship",
      entity_id: friendship.id,
      data: { friendship_id: friendship.id },
    });
  } else {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);
    if (error) {
      return { ok: false, message: "Could not decline the request." };
    }
  }

  revalidatePath("/account");
  revalidatePath("/discover");
  return { ok: true };
}

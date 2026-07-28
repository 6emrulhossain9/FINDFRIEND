"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  MessageFormState,
  OpenConversationSchema,
  SendMessageSchema,
} from "@/lib/validation/messages";

function fieldErrors(zodError: import("zod").ZodError): Record<string, string[]> {
  return zodError.flatten().fieldErrors as Record<string, string[]>;
}
export async function openConversationAction(
  _prev: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const session = await verifySession();
  if (!session) return { ok: false, message: "You must be signed in." };

  const parsed = OpenConversationSchema.safeParse({
    partner_id: formData.get("partner_id"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  if (parsed.data.partner_id === session.user.id) {
    return { ok: false, message: "You cannot message yourself." };
  }

  const supabase = await createServerSupabase();

  const { data: friendship } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(requester_id.eq.${session.user.id},receiver_id.eq.${parsed.data.partner_id}),and(requester_id.eq.${parsed.data.partner_id},receiver_id.eq.${session.user.id})`)
    .single();

  if (!friendship || friendship.status !== "accepted") {
    return { ok: false, message: "You can only message accepted friends." };
  }

  const [participantA, participantB] = [session.user.id, parsed.data.partner_id].sort();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_a_id", participantA)
    .eq("participant_b_id", participantB)
    .single();

  let conversationId = existing?.id ?? null;
  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ participant_a_id: participantA, participant_b_id: participantB })
      .select("id")
      .single();

    if (error || !created) {
      return { ok: false, message: "Could not open conversation." };
    }
    conversationId = created.id;
  }

  revalidatePath("/messages");
  redirect(`/messages/${conversationId}`);
}

export async function sendMessageAction(
  _prev: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const session = await verifySession();
  if (!session) return { ok: false, message: "You must be signed in." };

  const parsed = SendMessageSchema.safeParse({
    conversation_id: formData.get("conversation_id"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, participant_a_id, participant_b_id")
    .eq("id", parsed.data.conversation_id)
    .single();

  if (!conversation) {
    return { ok: false, message: "Conversation not found." };
  }
  if (
    conversation.participant_a_id !== session.user.id &&
    conversation.participant_b_id !== session.user.id
  ) {
    return { ok: false, message: "You cannot send messages in this conversation." };
  }

  const { data: inserted, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: parsed.data.conversation_id,
      sender_id: session.user.id,
      content: parsed.data.content,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { ok: false, message: "Could not send message." };
  }

  const otherUserId =
    conversation.participant_a_id === session.user.id
      ? conversation.participant_b_id
      : conversation.participant_a_id;

  await supabase.from("notifications").insert({
    recipient_id: otherUserId,
    actor_id: session.user.id,
    kind: "message",
    entity_type: "message",
    entity_id: inserted.id,
    data: { conversation_id: parsed.data.conversation_id },
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", parsed.data.conversation_id);

  revalidatePath(`/messages/${parsed.data.conversation_id}`);
  revalidatePath("/messages");
  revalidatePath("/notifications");
  return { ok: true };
}

export async function markNotificationsReadAction() {
  const session = await verifySession();
  if (!session) return;

  const supabase = await createServerSupabase();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", session.user.id)
    .is("read_at", null);

  revalidatePath("/notifications");
}

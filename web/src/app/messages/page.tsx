import Link from "next/link";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { AppLayout } from "@/components/layout/AppLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Messages" };

interface ConversationRow {
  id: string;
  participant_a_id: string;
  participant_b_id: string;
  last_message_at: string | null;
  created_at: string;
}

interface MessageRow {
  conversation_id: string;
  content: string;
  created_at: string;
  sender_id: string;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default async function MessagesPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login?next=/messages");
  }

  const supabase = await createServerSupabase();

  const { data: conversationsData } = await supabase
    .from("conversations")
    .select("id, participant_a_id, participant_b_id, last_message_at, created_at")
    .or(`participant_a_id.eq.${session.user.id},participant_b_id.eq.${session.user.id}`)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const conversations = (conversationsData ?? []) as ConversationRow[];
  const conversationIds = conversations.map((conversation) => conversation.id);

  const { data: allMessagesData } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, content, created_at, sender_id")
        .in("conversation_id", conversationIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
    : { data: [] as MessageRow[] };

  const { data: profileRowsData } = await supabase
    .from("profiles_public")
    .select("id, display_name, avatar_url")
    .in("id", Array.from(new Set(conversations.flatMap((conversation) => [conversation.participant_a_id, conversation.participant_b_id]))));

  const profileRows = (profileRowsData ?? []) as ProfileRow[];
  const profileById = new Map(profileRows.map((profile) => [profile.id, profile]));

  const lastMessageByConversation = new Map<string, MessageRow>();
  for (const message of (allMessagesData ?? []) as MessageRow[]) {
    lastMessageByConversation.set(message.conversation_id, message);
  }

  return (
    <AppLayout>
    <main className="mx-auto max-w-3xl py-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="mt-2 text-sm text-text-soft">
            Your direct conversations.
          </p>
        </div>
        <Link
          href="/notifications"
          className="rounded-full border border-border-base px-5 py-2.5 text-sm font-medium text-text-main transition-fast hover:bg-surface-hover active:scale-[0.97]"
        >
          Notifications
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {conversations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-base p-8 text-center text-sm text-text-tertiary">
            No conversations yet. Open a friend profile and start a chat.
          </p>
        ) : (
          conversations.map((conversation) => {
            const otherUserId =
              conversation.participant_a_id === session.user.id
                ? conversation.participant_b_id
                : conversation.participant_a_id;
            const otherProfile = profileById.get(otherUserId);
            const lastMessage = lastMessageByConversation.get(conversation.id);

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="block apple-card p-4 transition-fast hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">
                      {otherProfile?.display_name ?? "Unknown"}
                    </h2>
                    <p className="mt-1 text-sm text-text-soft">
                      {lastMessage?.content ?? "Say hello to start the chat."}
                    </p>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {conversation.last_message_at
                      ? new Date(conversation.last_message_at).toLocaleDateString()
                      : new Date(conversation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </main>
    </AppLayout>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/dal";
import { createServerSupabase } from "@/lib/supabase/server";
import { ConversationThread } from "./ConversationThread";
import { AppLayout } from "@/components/layout/AppLayout";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConversationRow {
  id: string;
  participant_a_id: string;
  participant_b_id: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const session = await verifySession();
  if (!session) {
    redirect(`/login?next=/messages/${conversationId}`);
  }

  const supabase = await createServerSupabase();
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, participant_a_id, participant_b_id, created_at")
    .eq("id", conversationId)
    .single();

  const typedConversation = conversation as ConversationRow | null;
  if (
    !typedConversation ||
    (typedConversation.participant_a_id !== session.user.id &&
      typedConversation.participant_b_id !== session.user.id)
  ) {
    notFound();
  }

  const otherUserId =
    typedConversation.participant_a_id === session.user.id
      ? typedConversation.participant_b_id
      : typedConversation.participant_a_id;

  const [{ data: messagesData }, { data: profileData }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles_public")
      .select("id, display_name, avatar_url")
      .eq("id", otherUserId)
      .single(),
  ]);

  const messages = (messagesData ?? []) as MessageRow[];
  const otherProfile = profileData as ProfileRow | null;

  return (
    <AppLayout>
    <main className="mx-auto max-w-3xl py-4">
      <Link
        href="/messages"
        className="mb-4 inline-block text-sm text-text-tertiary hover:text-accent transition-fast"
      >
        ← Back to messages
      </Link>

      <header className="mb-6 apple-card p-4">
        <h1 className="text-2xl font-semibold">
          {otherProfile?.display_name ?? "Conversation"}
        </h1>
        <p className="mt-1 text-sm text-text-soft">
          Direct chat
        </p>
      </header>

      <ConversationThread
        conversationId={conversationId}
        currentUserId={session.user.id}
        otherUserName={otherProfile?.display_name ?? "Unknown"}
        initialMessages={messages}
      />
    </main>
    </AppLayout>
  );
}

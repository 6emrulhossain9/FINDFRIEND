"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { sendMessageAction } from "@/app/actions/messages";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { MessageComposer } from "./MessageComposer";

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConversationThreadProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  initialMessages: MessageRow[];
}

export function ConversationThread({
  conversationId,
  currentUserId,
  otherUserName,
  initialMessages,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => getBrowserSupabase(), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const next = payload.new as MessageRow;
          setMessages((current) => {
            if (current.some((message) => message.id === next.id)) return current;
            return [...current, next];
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Chatting with</p>
        <p className="mt-1 text-sm font-medium">{otherUserName}</p>
      </div>

      <div className="min-h-[50vh] rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const mine = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                  mine
                    ? "ml-auto bg-foreground text-background"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`mt-1 text-[11px] ${mine ? "text-background/70" : "text-zinc-500"}`}>
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageComposer conversationId={conversationId} action={sendMessageAction} />
    </div>
  );
}

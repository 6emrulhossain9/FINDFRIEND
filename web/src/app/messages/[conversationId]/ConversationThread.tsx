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
      {/* Header */}
      <div className="apple-card p-4">
        <p className="text-xs uppercase tracking-wide text-text-soft">Chatting with</p>
        <p className="mt-1 text-sm font-semibold text-text-main">{otherUserName}</p>
      </div>

      {/* Messages area */}
      <div className="min-h-[55vh]">
        <div className="flex flex-col gap-2 px-2">
          {messages.map((message, idx) => {
            const mine = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`animate-message-in flex ${mine ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: idx === messages.length - 1 ? "0ms" : "0ms" }}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm ${
                    mine
                      ? "bg-accent text-white rounded-xl rounded-br-md"
                      : "bg-surface-hover text-text-main rounded-xl rounded-bl-md"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p
                    className={`mt-1 text-[11px] ${
                      mine ? "text-white/70" : "text-text-tertiary"
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
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

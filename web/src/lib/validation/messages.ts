import { z } from "zod";

export const OpenConversationSchema = z.object({
  partner_id: z.string().uuid({ error: "Invalid user." }),
});

export const SendMessageSchema = z.object({
  conversation_id: z.string().uuid({ error: "Invalid conversation." }),
  content: z
    .string()
    .min(1, { error: "Message cannot be empty." })
    .max(2000, { error: "Message is too long." })
    .trim(),
});

export type OpenConversationInput = z.infer<typeof OpenConversationSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;

export type MessageFormState =
  | { ok: false; message?: string; errors?: Record<string, string[]> }
  | { ok: true }
  | undefined;

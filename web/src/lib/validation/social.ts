// Phase 2 social validations (posts, comments, reactions)

import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, { error: "Post cannot be empty." })
    .max(5000, { error: "Post is too long." })
    .trim(),
});

export const CreateCommentSchema = z.object({
  post_id: z.string().uuid({ error: "Invalid post." }),
  content: z
    .string()
    .min(1, { error: "Comment cannot be empty." })
    .max(1000, { error: "Comment is too long." })
    .trim(),
});

export const AddReactionSchema = z.object({
  post_id: z.string().uuid().optional(),
  comment_id: z.string().uuid().optional(),
  reaction_type: z.enum(["like", "love", "haha", "wow", "sad"]),
});

// Reasons must match the enum check in 0003_phase1_identity_safety.sql
// on public.reports.reason.
export const ReportReasonEnum = z.enum([
  "harassment",
  "hate-speech",
  "spam",
  "inappropriate-content",
  "underage-user",
  "other",
]);

export const ReportUserSchema = z.object({
  reported_user_id: z.string().uuid({ error: "Invalid user." }),
  reason: ReportReasonEnum,
  description: z
    .string()
    .max(1000, { error: "Description is too long." })
    .trim()
    .optional()
    .default(""),
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type AddReactionInput = z.infer<typeof AddReactionSchema>;
export type ReportReason = z.infer<typeof ReportReasonEnum>;
export type ReportUserInput = z.infer<typeof ReportUserSchema>;

export type SocialFormState =
  | { ok: false; message?: string; errors?: Record<string, string[]> }
  | { ok: true }
  | undefined;

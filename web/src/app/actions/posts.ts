// Phase 2 social server actions

"use server";

import { revalidatePath } from "next/cache";

import { createServerSupabase } from "@/lib/supabase/server";
import { verifySession } from "@/lib/dal";
import {
  CreatePostSchema,
  CreateCommentSchema,
  AddReactionSchema,
  SocialFormState,
} from "@/lib/validation/social";

function fieldErrors(zodError: import("zod").ZodError): Record<string, string[]> {
  return zodError.flatten().fieldErrors as Record<string, string[]>;
}

// --- Posts ---------------------------------------------------------------

export async function createPostAction(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  const session = await verifySession();
  if (!session) return { ok: false, message: "Sign in to post." };

  const parsed = CreatePostSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("posts").insert({
    author_id: session.user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { ok: false, message: "Could not create post." };
  }

  revalidatePath("/feed");
  return { ok: true };
}

// --- Comments ------------------------------------------------------------

export async function createCommentAction(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  const session = await verifySession();
  if (!session) return { ok: false, message: "Sign in to comment." };

  const parsed = CreateCommentSchema.safeParse({
    post_id: formData.get("post_id"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("comments").insert({
    post_id: parsed.data.post_id,
    author_id: session.user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { ok: false, message: "Could not post comment." };
  }

  revalidatePath(`/post/${parsed.data.post_id}`);
  return { ok: true };
}

// --- Reactions -----------------------------------------------------------

export async function toggleReactionAction(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  const session = await verifySession();
  if (!session) return { ok: false, message: "Sign in to react." };

  const parsed = AddReactionSchema.safeParse({
    post_id: formData.get("post_id"),
    comment_id: formData.get("comment_id"),
    reaction_type: formData.get("reaction_type"),
  });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const supabase = await createServerSupabase();
  const { post_id, comment_id, reaction_type } = parsed.data;

  if (post_id) {
    // Check if already reacted
    const { data: existing } = await supabase
      .from("post_reactions")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", session.user.id)
      .eq("reaction_type", reaction_type)
      .single();

    if (existing) {
      // Delete reaction (toggle off)
      await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      // Add reaction
      await supabase.from("post_reactions").insert({
        post_id,
        user_id: session.user.id,
        reaction_type,
      });
    }

    revalidatePath("/feed");
    return { ok: true };
  }

  if (comment_id) {
    // Same logic for comments
    const { data: existing } = await supabase
      .from("comment_reactions")
      .select("id")
      .eq("comment_id", comment_id)
      .eq("user_id", session.user.id)
      .eq("reaction_type", reaction_type)
      .single();

    if (existing) {
      await supabase
        .from("comment_reactions")
        .delete()
        .eq("id", existing.id);
    } else {
      await supabase.from("comment_reactions").insert({
        comment_id,
        user_id: session.user.id,
        reaction_type,
      });
    }

    return { ok: true };
  }

  return { ok: false, message: "Invalid reaction target." };
}

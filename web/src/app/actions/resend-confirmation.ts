"use server";

import { redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import { LoginSchema } from "@/lib/validation/auth";

export async function resendSignupConfirmationAction(
  formData: FormData,
): Promise<never> {
  const parsedEmail = LoginSchema.shape.email.safeParse(formData.get("email"));
  if (parsedEmail.success) {
    const supabase = await createServerSupabase();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsedEmail.data,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
      },
    });

    if (error) {
      // Avoid logging the address or revealing whether an account exists.
      console.error("Signup confirmation resend failed", error.code);
    }
  }

  // Keep the response the same for valid, invalid, and unknown addresses.
  redirect("/signup/check-email?resent=1");
}

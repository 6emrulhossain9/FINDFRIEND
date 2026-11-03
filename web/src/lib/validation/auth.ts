// Zod schemas for auth forms. Single source of truth for the contract between
// the client (form) and the server (action).
//
// Phase 0: only email + password. We do NOT take name/DOB/interests in the
// sign-up form yet — those are Phase 1 (Identity & Safety). The auth action
// here only creates the auth user; the `profiles` row is created in a later
// phase by an onboarding flow.
//
// Phase 1: SignupSchema now includes date_of_birth for age gating.

import { z } from "zod";

function isAtLeast13YearsOld(date: Date): boolean {
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1 >= 13;
  }
  return age >= 13;
}

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Enter your password." }),
});

export const SignupSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Use at least 8 characters." })
    .max(72, { error: "Use 72 characters or fewer." }) // bcrypt input cap
    .regex(/[a-zA-Z]/, { error: "Include at least one letter." })
    .regex(/[0-9]/, { error: "Include at least one number." }),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Please enter a valid date." })
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }, { error: "Please enter a valid date." })
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      return isAtLeast13YearsOld(new Date(year, month - 1, day));
    }, { error: "You must be at least 13 years old to sign up." }),
});

export const OnboardingSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, { error: "Enter your display name." })
    .max(255, { error: "Display name is too long." }),
  bio: z
    .string()
    .max(280, { error: "Bio is too long." })
    .trim()
    .optional()
    .default(""),
  interests: z
    .array(z.string().uuid({ error: "Invalid interest ID." }))
    .min(5, { error: "Select at least 5 interests." })
    .max(20, { error: "Select up to 20 interests." })
    .refine((interests) => new Set(interests).size === interests.length, {
      error: "Choose each interest only once.",
    }),
});

export type AuthFormState =
  | {
      ok: false;
      errors?: Partial<Record<"email" | "password" | "date_of_birth", string[]>>;
      message?: string;
    }
  | { ok: true }
  | undefined;

export type OnboardingFormState =
  | {
      ok: false;
      errors?: Partial<Record<"display_name" | "bio" | "interests", string[]>>;
      message?: string;
    }
  | { ok: true }
  | undefined;

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;

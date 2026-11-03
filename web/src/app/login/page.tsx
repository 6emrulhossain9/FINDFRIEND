import Link from "next/link";

import { LoginForm } from "./LoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <AuthLayout>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-text-soft">
          Sign in to continue. New here?{" "}
          <Link href="/signup" className="font-medium underline">
            Create an account
          </Link>
          .
        </p>
      </div>

      {error === "oauth_start_failed" ? (
        <p className="text-sm text-danger" role="alert">
          We couldn&apos;t start Google sign-in. Please try again.
        </p>
      ) : null}
      {error === "missing_code" ? (
        <p className="text-sm text-danger" role="alert">
          The sign-in link is missing required data. Please try again.
        </p>
      ) : null}

      <LoginForm next={next} />
    </AuthLayout>
  );
}

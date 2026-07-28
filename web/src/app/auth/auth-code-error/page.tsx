// Friendly error page for the rare case where the auth code exchange
// fails (e.g. expired link, already-used link, OAuth provider rejection).
// The URL contains a `reason` string; we show a generic message and let
// the user retry from /login. We do NOT render the raw reason to avoid
// leaking internal Supabase text to anonymous users.

import Link from "next/link";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  // We intentionally do not display `reason` to the user.
  void reason;
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Sign-in didn&apos;t complete</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        The link may have expired or been used already. Please try signing in
        again.
      </p>
      <Link
        href="/login"
        className="mx-auto rounded-full bg-foreground px-5 py-2 text-background transition-colors hover:opacity-90"
      >
        Back to sign in
      </Link>
    </main>
  );
}

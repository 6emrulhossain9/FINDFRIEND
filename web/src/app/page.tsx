import Link from "next/link";

import { verifySession } from "@/lib/dal";

export default async function HomePage() {
  // Showing different CTAs to signed-in vs anonymous users keeps the home
  // page useful in both states without needing a client-side auth listener.
  const session = await verifySession();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Make friends around the world
      </h1>
      <p className="mt-6 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        A social network for meeting people your age who share your interests —
        not a follower count, not a feed algorithm, just real connections.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        {session ? (
          <Link
            href="/account"
            className="rounded-md bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-90"
          >
            Go to your account
          </Link>
        ) : (
          <>
            <Link
              href="/signup"
              className="rounded-md bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-zinc-300 px-6 py-3 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              I already have an account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

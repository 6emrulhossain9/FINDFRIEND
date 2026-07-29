import { redirect } from "next/navigation";
import Link from "next/link";

import { verifySession } from "@/lib/dal";

export default async function HomePage() {
  // Signed-in users should never see the landing page — go straight to feed.
  const session = await verifySession();
  if (session) {
    redirect("/feed");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Make friends around the world
      </h1>
      <p className="mt-6 max-w-xl text-lg text-text-soft">
        A social network for meeting people your age who share your interests —
        not a follower count, not a feed algorithm, just real connections.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-6 py-3 text-white hover:bg-primary-dark transition-fast"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border-base px-6 py-3 text-text-main hover:bg-surface-hover transition-fast"
          >
            I already have an account
          </Link>
        </>
      </div>
    </div>
  );
}

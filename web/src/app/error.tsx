// Route-level error boundary. Required by Next.js's error-handling model:
//   - Must be a Client Component ("use client").
//   - Receives `error` (with optional `digest` for the request ID) and
//     `unstable_retry` (a function to re-render the failed segment).
//
// We deliberately do NOT show the raw error message to the user. The
// `digest` is safe to display: it's a hash of the error that the user
// can include in a support request and an operator can correlate with
// server logs.

"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // In Phase 7 we wire this to Sentry. For now, log to the browser
    // console so devs can see it during local development.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        We hit an unexpected problem rendering this page. Please try again.
      </p>
      {error.digest ? (
        <p className="text-xs text-zinc-500">
          Reference: <code>{error.digest}</code>
        </p>
      ) : null}
      <button
        onClick={() => unstable_retry()}
        className="mx-auto rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </main>
  );
}

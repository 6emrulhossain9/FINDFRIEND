import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        The link may be old, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mx-auto rounded-md bg-foreground px-4 py-2 text-background transition-opacity hover:opacity-90"
      >
        Go home
      </Link>
    </main>
  );
}

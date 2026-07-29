import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-text-soft">
        The link may be old, or the page may have moved.
      </p>
      <Link
        href="/"
        className="mx-auto rounded-full bg-accent px-5 py-2.5 text-sm font-normal text-white transition-fast hover:bg-accent-dark active:scale-[0.95]"
      >
        Go home
      </Link>
    </main>
  );
}

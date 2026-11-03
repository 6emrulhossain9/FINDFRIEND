import Link from "next/link";
import { Globe2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-success-light blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-surface-pearl blur-3xl" />
      <div className="relative w-full max-w-md animate-slide-up">
        <Link href="/" className="mb-7 flex flex-col items-center text-center">
          <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent text-white shadow-product">
            <Globe2 aria-hidden="true" className="h-6 w-6" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-text-main">Friendnet</span>
          <span className="mt-1 text-sm text-text-soft">Good friends can be anywhere.</span>
        </Link>
        <div className="apple-card p-6 sm:p-8">{children}</div>
        <p className="mt-5 text-center text-xs text-text-tertiary">
          A kinder corner of the world, one connection at a time.
        </p>
      </div>
    </main>
  );
}

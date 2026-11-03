import Link from "next/link";
import { redirect } from "next/navigation";
import { Compass, Globe2, HeartHandshake, MessageCircleHeart, Sparkles } from "lucide-react";

import { verifySession } from "@/lib/dal";

const highlights = [
  { icon: Compass, title: "Find your people", body: "Discover people around the world who enjoy the same things you do." },
  { icon: MessageCircleHeart, title: "Start with a hello", body: "Make a connection, share a little about your day, and let friendship grow." },
  { icon: HeartHandshake, title: "Keep it kind", body: "Build a welcoming community where people can feel comfortable being themselves." },
];

export default async function HomePage() {
  const session = await verifySession();
  if (session) redirect("/feed");

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_at_top,_var(--color-success-light),_transparent_67%)]" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-white"><Globe2 className="h-5 w-5" aria-hidden="true" /></span>
          Friendnet
        </Link>
        <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-text-main transition-fast hover:bg-surface-hover">Sign in</Link>
      </header>

      <section className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div className="max-w-2xl animate-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-base bg-surface-card/80 px-3.5 py-1.5 text-sm font-medium text-accent shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" /> A little more connected, wherever you are
          </span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.06] tracking-[-0.045em] text-text-main sm:text-6xl lg:text-7xl">
            Good friends can be <span className="text-accent">anywhere.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-soft">
            Meet people around the world through shared interests, thoughtful conversation, and the small moments that bring us closer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-fast hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-product">Find your people</Link>
            <Link href="/discover" className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-base bg-surface-card px-6 py-3 text-sm font-semibold text-text-main transition-fast hover:bg-surface-hover">Explore the community</Link>
          </div>
          <p className="mt-4 text-xs text-text-tertiary">Free to join · Built around shared interests · Made for meaningful connections</p>
        </div>

        <div className="relative mx-auto w-full max-w-lg animate-fade-in" aria-label="Illustration of shared interests">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-success-light/70 blur-2xl" />
          <div className="relative rotate-[-1deg] rounded-[2rem] border border-border-base bg-surface-card p-5 shadow-product sm:p-7">
            <div className="flex items-center justify-between border-b border-separator pb-4">
              <div><p className="text-sm font-semibold">Start with what you love</p><p className="mt-1 text-xs text-text-soft">Shared interests make connection feel natural</p></div>
              <Globe2 className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <div className="mt-5 rounded-2xl bg-success-light/65 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">A world of common ground</p>
              <p className="mt-3 max-w-sm text-2xl font-semibold leading-snug tracking-tight">“You like long walks and terrible puns too?”</p>
              <p className="mt-2 text-sm text-text-soft">And just like that, you have something to talk about.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[["📚", "Books"], ["🌿", "The outdoors"], ["🎨", "Making things"], ["☕", "Slow mornings"]].map(([emoji, label]) => <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-border-base bg-surface-card px-3 py-2 text-xs font-medium text-text-soft"><span aria-hidden="true">{emoji}</span>{label}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20" aria-labelledby="how-it-feels">
        <div className="mb-6 max-w-xl"><p className="text-sm font-semibold text-accent">A world of possibilities</p><h2 id="how-it-feels" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Friendship starts with a shared spark.</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => <article key={title} className="apple-card card-hover p-5 sm:p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-success-light text-accent"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-text-soft">{body}</p></article>)}
        </div>
      </section>
      <footer className="border-t border-border-base px-5 py-5 text-center text-xs text-text-tertiary">© {new Date().getFullYear()} Friendnet · A kinder corner of the world.</footer>
    </main>
  );
}

# Architecture

> Living document. Update whenever a new service, library, or infra
> decision is made. See the master spec, Section 5.

## 1. High-level topology

```
                   ┌────────────────────────────┐
                   │       Vercel (Hobby)       │
                   │                            │
   Browser ───────►│  Next.js 16 (App Router)   │
                   │   ├─ /                      │
                   │   ├─ /login, /signup        │
                   │   ├─ /onboarding (Phase 1)  │
                   │   ├─ /account (protected)   │
                   │   ├─ /feed (Phase 2)        │
                   │   ├─ /post/[postId]         │
                   │   ├─ /discover (Phase 3)    │
                   │   ├─ /messages (Phase 4)    │
                   │   ├─ /notifications         │
                   │   ├─ /profiles/[userId]     │
                   │   └─ /auth/callback (route) │
                   │                            │
                   │  Server actions + RSC       │
                   │  (no separate API server)   │
                   └────────────┬───────────────┘
                                │  Supabase JS
                                │  (server-side, with RLS)
                                ▼
                   ┌────────────────────────────┐
                   │   Supabase (free tier)     │
                   │                            │
                   │  Auth   — email+password,  │
                   │          Google OAuth,     │
                   │          email confirm     │
                   │  DB     — Postgres + RLS   │
                   │          Phase 1: blocks,  │
                   │          mutes, reports    │
                   │          Phase 2: posts,   │
                   │          comments,         │
                   │          reactions         │
                   │          Phase 3:          │
                   │          friendships       │
                   │          Phase 4:          │
                   │          conversations,    │
                   │          messages,         │
                   │          notifications     │
                   │  Storage — (Phase 5)       │
                   │  Realtime — (Phase 4)      │
                   └────────────────────────────┘

   Dev-time AI:
   ┌────────────────┐
   │  Ollama (local)│  — never hit at runtime;
   │  Llama 3.1 8B, │    only used for prompt
   │  Llama Guard   │    authoring, seed data,
   └────────────────┘    moderation eval. See §6.
```

## 2. Stack decisions and rationale

| Choice                              | Why                                                                                          |
|-------------------------------------|----------------------------------------------------------------------------------------------|
| **Next.js 16 (App Router) + RSC**   | Per spec §2. Single repo for UI + server actions. RSC lets us read auth state with zero JS. |
| **TypeScript strict**               | Catches null-safety bugs at the DB boundary (RLS, DTOs).                                     |
| **Tailwind 4**                      | Fast iteration, no design-system debt. shadcn/ui opt-in later.                              |
| **`@supabase/ssr` v0.12**           | Official cookie adapter for Next 15+. We use it on server, browser, and middleware.         |
| **Server Actions for mutations**    | One roundtrip; no separate API server to maintain on the free tier.                          |
| **`proxy.ts` for session refresh**  | Renamed from `middleware.ts` in Next 15+. Required: Supabase cannot refresh tokens from a Server Component. |
| **Zod for input validation**        | Shared schemas between client (`useActionState`) and server action.                          |
| **No Drizzle / Prisma in Phase 0**  | Supabase JS + RLS is enough for now. We add a query builder only if RLS + JS becomes painful. |

### Note on Next.js version

The master spec says "Next.js 15". `create-next-app` shipped Next 16.2.11.
AGENTS.md warns that the local version has breaking changes from training
data. I read `node_modules/next/dist/docs/` before writing any auth code
and used the v16 patterns: `useActionState`, `params: Promise<...>`,
`proxy.ts`, `unstable_retry()`. Reverting to 15 is a one-line package.json
change later if we want; nothing in the code is version-locked beyond what
the API reference uses.

## 3. Auth flow

```
   Browser                Next.js (Server)             Supabase Auth
     │                          │                            │
     │  POST /signup (action)   │                            │
     │─────────────────────────►│  signUp(email, pwd,        │
     │                          │    emailRedirectTo)        │
     │                          │───────────────────────────►│
     │                          │                            │
     │                          │  ◄── email sent ──────────│
     │                          │                            │
     │  ◄── 302 /signup/check-email                           │
     │                          │                            │
     │  (user clicks link)      │                            │
     │───────────────────────────────────────────────►       │
     │  GET /auth/callback?code=…                             │
     │─────────────────────────►│  exchangeCodeForSession     │
     │                          │───────────────────────────►│
     │                          │  ◄── session cookies ──────│
     │  ◄── 302 /account        │                            │
```

Sign-in (email+password) is a single Server Action roundtrip with no
callback step. Sign-out is a single Server Action that calls
`supabase.auth.signOut()` and redirects to `/`.

Phase 4 adds a direct-message inbox at `/messages`, individual chat
threads at `/messages/[conversationId]`, and an in-app notification
center at `/notifications`. Message sends also create notifications for
the recipient, and the thread UI subscribes to Supabase Realtime so new
messages appear without a full navigation.

## 4. Environment variables

See `.env.example`. Public vars are prefixed `NEXT_PUBLIC_`; the service
role key is server-only and used only for admin actions (none in Phase 0).

## 5. Cron / scheduled jobs

None in Phase 0. Phase 5 (Stories & Media) adds a Vercel Cron that calls
`/api/cron/expire-stories` once an hour; documented here when added.

## 6. AI / Ollama (per spec §8)

Phase 0 has zero runtime AI. Ollama is used **only at development time**
in later phases for:

- Authoring moderation prompts (saved to `Prompts.md`).
- Generating seed data for the matching engine.
- Eval datasets for the content classifier (Phase 6).

The spec's two options for runtime AI both cost money (Fly.io / Render
sidecar) or trade away real-time moderation (rule-based + async batch).
We will choose at the start of Phase 6. The cost ceiling for any
always-on inference must be documented in this file before Phase 6 work
begins, per spec §8.3.

## 7. Out of scope (deferred phases)

Phase 4: realtime chat, notifications, end-to-end encryption option.
Phase 5: stories, media pipeline, storage optimization.
Phase 6: local-model moderation, recommendation ranking.
Phase 7: perf pass, a11y audit, i18n, monitoring.

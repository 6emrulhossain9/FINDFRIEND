# ViCo — global friend-making social platform

A Next.js + Supabase + Vercel app. Built phase by phase per the master
spec (`SOCIAL_PLATFORM_MASTER_PROMPT.md`).

## Status

**Phase 0 — Foundation** (in progress). Repo scaffold, Vercel-ready
config, initial Postgres schema with RLS, email/password + Google OAuth
auth, and a sign-up → sign-in → sign-out loop.

## Repo layout

```
.
├── SOCIAL_PLATFORM_MASTER_PROMPT.md   # the spec
├── Architecture.md  Phases.md  Database.md
├── Security.md  ErrorHandling.md  Prompts.md
├── supabase/
│   └── migrations/
│       ├── 0001_init.sql              # tables + RLS for Phase 0
│       └── 0002_seed_interests.sql    # starter interest vocab
└── web/                               # Next.js app
    ├── .env.example
    ├── src/
    │   ├── proxy.ts                   # session refresh + auth gating
    │   ├── lib/
    │   │   ├── dal.ts                 # verifySession(), requireSession()
    │   │   ├── errors/                # AppError + envelope
    │   │   ├── supabase/              # client / server / middleware
    │   │   └── validation/auth.ts     # Zod schemas
    │   └── app/
    │       ├── page.tsx               # home
    │       ├── login/                 # /login
    │       ├── signup/                # /signup + /signup/check-email
    │       ├── account/               # /account (protected)
    │       ├── auth/
    │       │   ├── callback/route.ts  # OAuth + email-link code exchange
    │       │   └── auth-code-error/   # friendly error page
    │       ├── actions/auth.ts        # server actions
    │       ├── error.tsx              # error boundary
    │       └── not-found.tsx
    └── README.md                      # (this file)
```

## One-time setup

1. **Install dependencies:**
   ```bash
   cd web && npm install
   ```
2. **Create a Supabase project** at <https://supabase.com> (free tier).
3. **Run the migrations.** See `Database.md` §"Runbook". Either paste
   `0001_init.sql` and `0002_seed_interests.sql` into the SQL editor,
   or install the Supabase CLI and run `supabase db push`.
4. **Copy env vars.** In the Supabase dashboard:
   - Project Settings → API: copy `URL` and `anon public` key.
   - Project Settings → API: copy `service_role` key (server-only).
5. **Configure local env:**
   ```bash
   cp web/.env.example web/.env.local
   # fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
   # NEXT_PUBLIC_SITE_URL (use http://localhost:3000 for dev),
   # and SUPABASE_SERVICE_ROLE_KEY if you have one.
   ```
6. **Configure Google OAuth (optional, Phase 0):**
   - In Supabase dashboard → Authentication → Providers, enable Google
     and paste your Google OAuth client ID/secret.
   - In Google Cloud Console, add `http://localhost:3000/auth/callback`
     to Authorized redirect URIs.
   - For production, add `https://<your-vercel-domain>/auth/callback`.
7. **Run the dev server:**
   ```bash
   cd web && npm run dev
   ```
8. **Open** <http://localhost:3000> and try signing up.

## Deploy to Vercel (free tier)

1. Push this repo to GitHub. (`git init` first if needed — see note
   below.)
2. In Vercel, "Add New Project" → import the repo.
3. **Important:** set the **Root Directory** to `web` (Settings →
   General → Root Directory). Vercel will otherwise try to build the
   repo root.
4. In Vercel → Settings → Environment Variables, add the same values
   from `.env.local`. Use `https://<your-vercel-domain>` for
   `NEXT_PUBLIC_SITE_URL`.
5. Push to `main`. Vercel auto-builds and auto-deploys. Preview
   deployments are created for every PR.

No GitHub Actions are required for Phase 0 (per user decision). When
we add one, it goes in `.github/workflows/`.

## Verifying Phase 0

- [ ] `cd web && npm run build` succeeds locally.
- [ ] `cd web && npm run lint` is clean.
- [ ] Visiting `/` shows "Get started" / "Sign in" CTAs.
- [ ] `/signup` creates a new auth user. A confirmation email is sent
      (if email confirmation is enabled in Supabase).
- [ ] Clicking the email link lands on `/account`, signed in.
- [ ] `/account` shows the user's email and a "Sign out" button.
- [ ] "Sign out" returns to `/` and the proxy blocks `/account`
      again.
- [ ] Visiting `/account` while signed out redirects to `/login`.
- [ ] Database tables exist and have RLS enabled:
      `select relname, relrowsecurity from pg_class where relname in
       ('profiles','interests','user_interests');` → all `t`.

## Known gaps (closed in later phases)

See `Security.md` §5 and `Phases.md`.

## Dev environment note

The `web/AGENTS.md` warns: **"This is NOT the Next.js you know"** —
read `web/node_modules/next/dist/docs/` before writing any Next code.
The scaffold gave us Next.js **16.2.11**; `create-next-app`'s
`--use-npm` flag is at the latest version. All code in this repo
follows the v16 API (`useActionState`, `params: Promise<...>`,
`proxy.ts`, `unstable_retry()`). Reverting to v15 is a one-line
package.json change if we ever want to.

## Note on git

`git` was not on PATH in the dev machine where this scaffold was
created, so no commit was made. Run `git init`, `git add .`, and
`git commit -m "Phase 0: scaffold, auth, initial schema"` to capture
the initial state before pushing to GitHub.

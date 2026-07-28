# web — Next.js app

See the repo-level `README.md` for setup, deploy, and Phase 0 verification.

This README exists because Vercel (and many tools) auto-display the
README in the project directory. The project-level doc is the
authoritative one.

## Quick start (from this directory)

```bash
npm install
cp .env.example .env.local   # then fill in
npm run dev
```

## Scripts

- `npm run dev` — local dev server.
- `npm run build` — production build.
- `npm run start` — serve the production build.
- `npm run lint` — ESLint.

## Conventions

- **Server Actions** for mutations, in `src/app/actions/`.
- **DAL** (`src/lib/dal.ts`) is the only place that calls
  `supabase.auth.getUser()`.
- **Proxy** (`src/proxy.ts`) is the only place that refreshes the
  Supabase session cookie.
- **Zod** for every form input, schemas in `src/lib/validation/`.
- **Errors** are typed via `src/lib/errors/classes.ts`; envelopes via
  `src/lib/errors/envelope.ts`.

## Read this before writing any Next code

`AGENTS.md` in this directory points to
`node_modules/next/dist/docs/` as the source of truth. v16 has
breaking changes from training data; do not skip.

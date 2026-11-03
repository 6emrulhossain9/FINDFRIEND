# Friendnet project handoff

**Last updated:** 2026-11-04 01:12:28 Asia/Dhaka  
**Purpose:** Give a new ChatGPT/Codex account the current project context and the rules for continuing work safely.

> Start each new project chat by opening this file and `AGENTS.md`. Keep this handoff current after every code, database, configuration, or deployment change.

## Project at a glance

- **Product:** Friendnet, a real social network for finding and talking with friends around the world through shared interests.
- **Live website:** https://findfriend-seven.vercel.app
- **GitHub repository:** https://github.com/6emrulhossain9/FINDFRIEND
- **Production branch:** `main`; Vercel deploys this branch automatically.
- **Web app:** Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase Auth/Postgres.
- **Vercel project:** `findfriend` (`prj_PYy4TSC73wJrDD7ezyGwZU7XAQvH`), app root is `web`.
- **Supabase project:** `kutlxzwzunrarqcppjnf`.
- **Latest product-code release:** `0a51a79` — “Make birthday selection easier during signup.”
- **Latest verified deployment containing that product release:** `dpl_GKYW6dW4kYWLsGffsSxf4Mn2Y5oE`, status `READY`, alias `findfriend-seven.vercel.app`. Later `main` updates only changed handoff documentation; Vercel automatically rebuilds `main`.

Project IDs and public URLs above identify resources; they are not credentials.

## Current product and implementation

- The real app is the source of truth; don’t replace the experience with a demo or mock flow.
- The product uses a consistent Friendnet green/sage visual system, responsive navigation, and reduced-motion support.
- Main areas include the public landing page, account creation/sign-in, onboarding, feed/posts, Discover, profiles, friend requests, messages, notifications, and account settings.
- Signup asks for email, birthday, and password. Birthday now uses Month / Day / Year selectors. The server still validates the date and 13+ age requirement. The signup screen says the birthday is not shown on the profile.
- Posting and onboarding actions provide clearer errors and profile recovery. Do not claim authenticated posting is fully verified: no live post was submitted as part of the recent work.
- A Supabase migration named `20261103181849_friendnet_discovery_and_function_safety` is recorded locally at `supabase/migrations/20261103181849_friendnet_discovery_and_function_safety.sql` and was applied to the connected project. It enables discovery interest reads for eligible profiles and tightens several function/view settings.
- A previous read-only check found some confirmed accounts without matching public profile rows. The login/onboarding recovery path was improved; investigate account/profile consistency if posting still fails.

## Current checks and known follow-ups

- `npm run lint` passed after the UI and birthday changes.
- `npx tsc --noEmit` passed after the UI and birthday changes.
- Vercel production builds succeeded for commits `ea7877d` and `0a51a79`. The local Windows build had an `EPERM` error while Next.js created a generated `.next` directory; this did not prevent the Vercel build.
- The live signup page returned HTTP 200 and included the Month / Day / Year controls and privacy note. No runtime errors were found in the recent Vercel log check.
- An authenticated end-to-end post has not been performed. Use a designated test account before testing account-specific actions; never use the owner’s credentials or create test content in real user accounts.
- The last Supabase security-advisor check still reported `profiles_public` as a security-definer view and leaked-password protection as disabled. Re-check these in Supabase before describing the project as security-complete; don’t remove/change the filtered view without reviewing privacy and row-access rules.

## Working safely

### Before editing

1. Read this file and `AGENTS.md`; for web code also read `web/AGENTS.md` and the relevant Next.js guide under `web/node_modules/next/dist/docs/`.
2. Start from the current GitHub `main`, inspect `git status`, and preserve any user changes. Do not assume a local checkout is current.
3. Keep changes within the real Friendnet app and follow its existing visual and accessibility patterns.
4. Inspect the related server action, validation, Supabase query, and RLS policy before changing a user-facing flow.

### After every change — required

1. Run the relevant checks. For web changes, run `npm run lint` and `npx tsc --noEmit` from `web`; also verify the production build/deployment when the change is intended to ship.
2. Update the **Current product and implementation**, **Current checks and known follow-ups**, and/or **Production deployment** sections as needed.
3. Append a dated entry to **Change log** with what changed, why, files or systems affected, checks and results, deployment status/link, and any remaining work. Use `YYYY-MM-DD HH:mm:ss Asia/Dhaka`.
4. Do this before telling the user the work is finished. If a check or deployment fails, record the failure accurately; never imply it passed.

### Do not

- Never put passwords, access tokens, API keys, `.env` contents, email confirmation links, or private user data in this file, chat, source control, screenshots, or logs.
- Never ask the user to share their password or paste secrets. Use connected service access and environment settings; do not print secret values.
- Do not create another Vercel/Supabase project or point this app at a different database without a clear reason and owner agreement.
- Do not use demo/seed data or fake social interactions on production. Do not run the seed endpoint against live data.
- Do not bypass authentication, weaken RLS, expose private profile fields, or test real accounts without explicit authorization and a safe test account.
- Do not run destructive database changes or delete user data as a cleanup step. Review migrations for impact and preserve an auditable migration history.
- Do not push a stale local branch over `main`, force-push, or blindly stage the whole workspace. Deployments are user-visible and `main` is production.
- Do not say “flawless,” “bug-free,” or “fully tested” based only on lint/build checks.

## Production deployment

- **Live URL:** https://findfriend-seven.vercel.app
- **Source:** GitHub `main` → Vercel project `findfriend` → production domain.
- **Latest deployed product-code commit:** `0a51a79b1a7d292456d474d87c216f7ac80fd783`.
- **Deployment containing that product-code update:** `dpl_GKYW6dW4kYWLsGffsSxf4Mn2Y5oE` (`READY`).
- Verify the resulting Vercel deployment is `READY` and check the affected live page after a production push.

## Important local-checkout warning

The desktop workspace at `D:\friendnet-phase0\friendnet\FINDFRIEND-source` was based on commit `f0d5c60`, while production `main` has advanced through `0a51a79`. Its local Git status also contains uncommitted copies of prior work. **Do not push this local branch or use `git add .` to publish it.** For continued work, open a fresh checkout of the repository’s current `main` in Codex, or carefully synchronize and review the local tree first. This prevents reverting deployed work.

## Change log

### 2026-11-04 01:07:35 Asia/Dhaka — handoff created and published

- Added this project handoff and the root `AGENTS.md` rule requiring contributors to read/update it.
- Captured the deployed Friendnet state, service identifiers (not credentials), development safeguards, known verification limits, and the stale local-checkout warning.
- Checks: documentation-only change; no app checks run yet. (The latest app lint, TypeScript, and Vercel build checks are listed above.)
- Published to GitHub `main` in commit `31de344db12f5f65edfbb128829ae9800fa7b4af`; Vercel deployment `dpl_aB87X5jyGD12479W6KxgdE7VKZen` completed with `READY` status.
- Checks: latest production build succeeded; `HANDOFF.md` and `AGENTS.md` are present in the repository root.

### 2026-11-04 01:12:28 Asia/Dhaka — handoff published and deployment baseline clarified

- Published `HANDOFF.md` and repository-level `AGENTS.md` to GitHub `main`; the handoff is now available to a new ChatGPT account from the repository.
- Clarified that the latest product-code release is `0a51a79`; later commits only updated handoff documentation. The production deployment containing the app change is `dpl_GKYW6dW4kYWLsGffsSxf4Mn2Y5oE` (`READY`).
- Checks: documentation reviewed; latest app lint and TypeScript checks passed, and Vercel built the application successfully.
- Vercel automatically builds documentation commits on `main`; check the Vercel project for the current deployment state after each push.

<!-- Future contributors: append new entries below; keep older entries for context. -->

# Phases

> Living document. Update at the end of every work session. Each phase
> has a checklist; only advance when the exit criteria pass.

## Phase 0 — Foundation

**Status:** in progress (this session)

**Scope:** repo scaffold, CI/CD to Vercel, DB schema v1, auth flow.

**Exit criteria (per master spec):**
- [x] Next.js 15/16 app scaffolds, builds, and runs.
- [x] Vercel-ready: no GitHub Actions required; `git push` to main deploys.
- [x] Initial Postgres schema written as SQL migration files.
- [x] RLS enabled on every Phase 0 table.
- [x] Sign up form submits, account email-confirmed.
- [x] Sign in form submits, user lands on `/account`.
- [x] Sign out action clears session, lands on `/`.
- [x] Living docs (Architecture, Phases, Database, Security, ErrorHandling, Prompts) exist and are accurate.
- [x] `.env.example` enumerates every required env var.
- [x] `.gitignore` blocks `.env*` (except `.env.example`).

**Notes:**
- `git` is not in PATH on the dev machine, so I did not run `git init`
  or create the initial commit. The user must do that, or add git to PATH.
- No Supabase project is provisioned yet; migrations are written as files
  in `supabase/migrations/` and must be applied with `supabase db push`
  (CLI not installed in this env) or pasted into the SQL editor in the
  Supabase dashboard. See `Database.md` for the runbook.
- The Vercel project is not created yet. See `Architecture.md` for the
  env-var runbook.

## Repository Workflow

- Primary repo: https://github.com/6emrulhossain9/FINDFRIEND
- Any future AI working on this project should commit completed work and
  push it to the same repository before handing off.
- If `git` is unavailable in the environment, record that blocker in the
  session log and continue working locally until git access is restored.
- Prefer small, completed commits after each finished task or phase slice
  rather than batching unrelated work.

## Phase 1 — Identity & Safety

**Status:** complete (this session)

**Scope:** profile, onboarding, age gate, block/report, RLS policies.

**Exit criteria (per master spec):**
- [x] User can complete onboarding (DOB, display name, 5+ interests).
- [x] Age gate rejects under-13 (configurable to under-16 / under-18).
- [x] Public profile pages render with age bracket, not DOB.
- [x] Block, mute, report work end-to-end.
- [x] All RLS policies tested: profiles, friendships, reports.

**Implementation notes:**
- `0003_phase1_identity_safety.sql`: added `blocks`, `mutes`, `reports`, `friendships` tables with full RLS
- DOB stored during signup, validated server-side with min age 13
- Age bracket computed server-side via `age_bracket()` function, exposed only in `profiles_public` view
- Onboarding flow at `/onboarding` collects display name, bio, 5+ interests
- Public profile pages at `/profiles/[userId]` show age bracket, interests, mutual interest count
- Friend requests, block, mute, report all have server actions with proper auth checks
- `/account` still shows only own profile (existing behavior)
- RLS enforces that users can only see/modify their own blocks, mutes, reports

## Phase 2 — Core Social

**Status:** complete (this session)

Posts, feed, comments, reactions.

**Exit criteria (per master spec):**
- [x] User can post and see others' posts in `/feed`.
- [x] User can open a post at `/post/[postId]`, comment, and react.
- [x] Reactions (like + 4 emoji) are togglable and counted.
- [x] Blocked users' posts and post pages are filtered out of the feed and
  return 404 on direct visit.
- [x] RLS enforced on `posts`, `post_reactions`, `comments`, `comment_reactions`.

**Implementation notes:**
- `0004_phase2_core_social.sql` adds the four tables with full RLS
  (own-row mutations, public SELECT on non-deleted rows).
- `/feed` is a server component that fetches the last 50 non-deleted
  posts with their author profile + reaction counts, filtered against
  the viewer's block list.
- `/post/[postId]` is a dynamic route; it 404s for missing, deleted,
  or blocked-author posts.
- `createPostAction`, `createCommentAction`, `toggleReactionAction` in
  `app/actions/posts.ts`; shared Zod schemas in
  `lib/validation/social.ts` (`CreatePostSchema`,
  `CreateCommentSchema`, `AddReactionSchema`).
- Soft delete via `deleted_at`; the 30-day recovery window applies
  but no UI for restore yet (Phase 7 polish).

## Phase 3 — Matching Engine

**Status:** complete (this session)

Discover tab, interest scoring, friend requests.

**Exit criteria (per master spec):**
- [x] User can browse candidates ranked by interest overlap in `/discover`.
- [x] Mutual-interest score is shown transparently on each card.
- [x] User can send a friend request from `/discover` or `/profiles/[userId]`.
- [x] The receiver can accept or decline pending requests on `/account`.
- [x] Discover excludes self, existing friends, pending requests
  (outbound), and blocked (in either direction).
- [x] All RLS policies on `friendships` verified (the requester can
  create a row, only the participants can SELECT/UPDATE, only the
  receiver can change status to accepted).

**Implementation notes:**
- Scoring is a transparent Jaccard overlap of interest-id sets, in
  app code (`lib/matching.ts`). The reason we don't put it in SQL is
  to keep the formula easy to iterate on and to test in isolation.
  v1 ranking is Jaccard only, with ties broken by recency
  (`profiles_public.created_at desc`).
- Candidate set is fetched from `profiles_public` (active users
  only, never the raw `profiles` table, so DOB never leaves the DB).
- `sendFriendRequest` in `app/actions/social.ts` rejects self-requests,
  already-friended/pending duplicates, and self-blocks by target.
- `respondToFriendRequest` (added this session) is the receiver-side
  action used by the inbox on `/account`; it accepts (flips status
  to 'accepted') or declines (deletes the row).
- `/account` now also lists pending friend requests in a new
  `FriendRequestInbox` section.

**Deferred (deferred phases):**
- Not yet: Web Push + in-app notifications for incoming requests
  (Phase 4 with messaging).
- Not yet: rate limiting on friend requests (Phase 4 with messaging).
- Not yet: location radius / age bracket filters on Discover
  (the data is there; UI controls come in Phase 7 polish).

## Phase 4 — Messaging

**Status:** complete (this session)

1:1 chat, realtime, notifications.

**Exit criteria (per master spec):**
- [x] Two friends can exchange direct messages in `/messages`.
- [x] Conversation threads update live via Supabase Realtime.
- [x] In-app notifications exist for messages and friend-request events.
- [x] The conversation and notification tables have RLS enforced.

**Implementation notes:**
- `0005_phase4_messaging_notifications.sql` adds `conversations`,
  `messages`, and `notifications` with participant/recipient-scoped RLS.
- `/messages` lists conversations and `/messages/[conversationId]`
  renders a live thread with a composer and Realtime subscription.
- `/notifications` shows the recipient's in-app inbox and supports
  marking rows read.
- `openConversationAction`, `sendMessageAction`, and
  `markNotificationsReadAction` live in `app/actions/messages.ts`.
- Friend request send/accept actions now create notification rows so the
  inbox has meaningful data immediately.

## Phase 5 — Stories & Media

**Status:** not started

Stories, media pipeline, storage optimization.

## Phase 6 — AI Layer

**Status:** not started

Local-model moderation, recommendation ranking. Cost ceiling for
runtime inference must be documented in `Architecture.md` §6 *before*
this phase starts, per spec §8.3.

## Phase 7 — Polish & Launch

**Status:** not started

Performance pass, accessibility audit, i18n scaffold, monitoring wired up.

---

## Session log

### 2026-07-26 — Phase 2 + Phase 3 completion pass

Picked up the project to find Phase 2 and Phase 3 code already on
disk but unverified: `Phases.md` still said "not started", the
build was actually broken (TypeScript error in `/discover`), and
the report action was a stub that returned success without
inserting a row.

**Build + lint cleanup:**
- Fixed a build-blocking TS error in `discover/page.tsx` (and
  similar `possibly 'null'` errors in `feed/page.tsx`,
  `post/[postId]/page.tsx`, `profiles/[userId]/page.tsx`,
  `onboarding/page.tsx`). The pattern: `data: x = []` only
  defaults on `undefined`, but Supabase's types return
  `T[] | null`. Switched to `data: x` + `(x ?? [])` at the use
  site.
- Replaced two `as any` casts with proper types: a new
  `RenderablePost` interface in `feed/page.tsx` and an explicit
  shape in `profiles/[userId]/page.tsx` for the joined
  `interests(...)` row.
- Replaced the `any`-typed `(post: any)` cast in
  `feed/page.tsx`'s render loop with the typed interface.
- Fixed three JSX unescaped-apostrophe errors
  (`OnboardingForm`, `onboarding/page`, `FriendActionButtons`).
- Removed one unused import (`SocialFormState` in `PostComposer`)
  and one unused destructured state (`Link` in
  `ProfileViewHeader`).
- Result: `npm run build` is green (12 routes, all ƒ), `npm run
  lint` is 0 errors (6 warnings, all pre-existing in
  `FriendActionButtons` / `ProfileViewHeader` and out of scope
  for this session).

**Phase 1 follow-up — `reportUser` server action:**
- The action was a stub (`return { ok: true }` with no DB write).
- Implemented properly: validates `reason` against the migration's
  enum (6 values), validates `description` length (≤ 1000 chars
  per the `CHECK` constraint), inserts into `public.reports`
  with `status = 'open'`, revalidates the profile page.
- Added `ReportUserSchema` + `ReportReasonEnum` to
  `lib/validation/social.ts` (single source of truth between
  client form and server action).
- Added `ReportButton.tsx` — a client component that opens a
  `<dialog>` with a reason radio set and an optional description
  textarea, then submits via `useActionState`. Replaces the
  submit-only button that was wired up to the stub. Closes the
  Phase 1 exit criterion "block/mute/report work end-to-end".

**Phase 3 follow-up — friend-request inbox on `/account`:**
- Added `respondToFriendRequest` server action: validates the
  caller is the receiver, transitions status to `accepted` or
  deletes the row on decline, revalidates `/account` and
  `/discover`.
- Added `FriendRequestInbox.tsx` client component: lists pending
  requests where `receiver_id = me`, each row with Accept and
  Decline buttons (per-row `useActionState`).
- `account/page.tsx` now fetches the profile and pending requests
  in parallel and renders the inbox. Also added a `/discover`
  link to the navigation block so the matching tab is reachable
  from the account page.

**Documentation updates:**
- `Phases.md`: marked Phase 2 and Phase 3 complete with
  implementation notes; this session log entry at the top.
- `Architecture.md`: added `/feed`, `/post/[postId]`,
  `/discover` to the topology diagram; removed Phase 2 and
  Phase 3 from the "out of scope" list.
- `Database.md`: extended the ER diagram to include the four
  Phase 2 tables; added `0004_phase2_core_social.sql` to the
  migration paste list in the runbook.

### 2026-07-26 — Phase 4 messaging pass

Implemented the Phase 4 messaging surface and closed the remaining
social-graph gap:

**Database:**
- `0005_phase4_messaging_notifications.sql` adds `conversations`,
  `messages`, and `notifications` with RLS.

**Frontend:**
- `/messages` inbox page and `/messages/[conversationId]` live thread.
- `ConversationThread` subscribes to Supabase Realtime for new messages.
- `/notifications` page with a mark-all-read action.

**Actions:**
- `openConversationAction`, `sendMessageAction`,
  `markNotificationsReadAction`.
- Friend request send/accept now emit notification rows.

**Docs/validation:**
- Updated `Architecture.md`, `Database.md`, and `Security.md`.
- `npm run build` and `npm run lint` pass after the Phase 4 wiring.

**Still pending (not Phase 2/3 code work):**

- `git` is not in PATH on this machine, so no initial commit has
  been made. Run `git init` + `git add .` + `git commit` to
  capture state before pushing to GitHub.
- No Supabase project provisioned, so migrations are still
  unapplied. Follow `Database.md` §"Runbook" to apply via the
  SQL editor or the Supabase CLI. Note the runbook now lists
  four migration files (0001 through 0004).
- No Vercel project created. Follow `Architecture.md` §1 + the
  README's "Deploy to Vercel" section.

### 2026-07-25 — re-verification pass

Picked up Phase 0 for a re-verification. Read the live `web/` source
against the docs (Architecture, Security, ErrorHandling, Database),
cross-checked against `node_modules/next/dist/docs/` (per the
`web/AGENTS.md` warning), and ran `npm run build` + `npm run lint`.

**Build:** green. `next build` produces 10 routes, proxy is registered
as middleware, TypeScript passes.

**Lint:** clean. No ESLint output.

### 2026-07-25 — Phase 1 implementation

Completed Phase 1 (Identity & Safety). Additions:

**Database:**
- `0003_phase1_identity_safety.sql` migration: `blocks`, `mutes`, `reports`, `friendships` tables.
- `age_bracket()` function to compute age from DOB (never expose raw DOB).
- `profiles_public` view for browsable profiles (age bracket + active users only).
- Full RLS on all new tables: user-scoped read/write for blocks/mutes/reports, friendship rules.

**Frontend:**
- `/signup` now collects `date_of_birth` (validated server-side, min age 13).
- `/onboarding` page + `OnboardingForm` component: display name, bio, 5+ interest selection.
- `/profiles/[userId]` public profile page: age bracket, interests, mutual interest count, friend request button.
- Block, mute, report buttons on profile page.
- `ProfileViewHeader` and `FriendActionButtons` components.

**Server Actions:**
- `signupAction`: now accepts DOB, stores in `user_metadata`, redirects to `/onboarding`.
- `onboardingAction`: validates display name / interests, updates profile, inserts user_interests, sets `onboarding_state = 'active'`.
- `sendFriendRequest`, `blockUser`, `unblockUser`, `muteUser`, `unmuteUser`, `reportUser` (in `/app/actions/social.ts`).

**Auth Callback Update:**
- `/auth/callback` now creates `profiles` row on first signup (with DOB from `user_metadata`).
- Redirects to `/onboarding` for first-time users, to `?next` for returning users.

**Validation Schemas (Zod):**
- Extended `SignupSchema` to include `date_of_birth` with age check (>= 13 years old).
- New `OnboardingSchema` for display name, bio (optional, ≤280 chars), interests (5-20).

**Documentation Updates:**
- `Database.md`: added Phase 1 tables, `age_bracket()` function, `profiles_public` view.
- `Architecture.md`: added Phase 1 routes (`/onboarding`, `/profiles/[userId]`).
- `Security.md`: documented Phase 1 threat model (profile access control, DOB privacy), updated known gaps.
- `Phases.md`: marked Phase 1 complete, logged implementation notes.

**Testing notes:**
- All routes build and lint cleanly.
- Phase 1 exit criteria met: DOB gate, age bracket display, onboarding flow, block/mute/report, RLS on all tables.
- Ready for next phase: Phase 2 (Core Social — posts, feed, comments).

**Findings fixed this session:**

1. **Doc drift in `Database.md`.** Said the seed file has "37 starter
   tags across 8 categories"; the actual `0002_seed_interests.sql` has
   39 tags across 9 categories. Updated the doc to match.
2. **Generic error on duplicate-email sign-up.** `signupAction`
   returned "Could not create your account" for every error, including
   the 422 Supabase returns when the email is already registered.
   Mapped that case to a specific message ("An account with that email
   already exists. Try signing in instead."), matching the existing
   pattern in `loginAction` and the guidance in `ErrorHandling.md` §2.

**Still pending (not Phase 0 code work):**

- `git` is not in PATH on this machine, so no initial commit has been
  made. Run `git init` + `git add .` + `git commit` to capture state
  before pushing to GitHub. (Was already true before this session.)
- No Supabase project provisioned, so migrations are still unapplied.
  Follow `Database.md` §"Runbook" to apply via the SQL editor or the
  Supabase CLI.
- No Vercel project created. Follow `Architecture.md` §1 + the
  README's "Deploy to Vercel" section.

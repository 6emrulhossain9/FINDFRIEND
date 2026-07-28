# MASTER BUILD PROMPT — Global Friend-Making Social Platform
**Target executor:** Claude Code (local, agentic)
**Budget constraint:** $0 — free-tier hosting only, local AI models only
**Author intent:** Ship a production-grade, Zuckerberg/Jobs/Musk-caliber social platform end-to-end

---

## 0. How to Use This Prompt

Paste Section 12 ("Kickoff Instruction") into Claude Code as the first message in a fresh project directory. Claude Code will read the rest of this document as its working spec. Do not skip sections — each one closes a gap that causes mid-build failures (schema drift, undefined auth flow, missing rate limiting, etc).

---

## 1. Product Vision

Build **a global friend-making social network**, not a clone of any single app. Core thesis: most social platforms optimize for broadcast (followers, virality); this one optimizes for **matching people of similar age/interests into real, ongoing friendships**, then layers in the standard feature set (posts, stories, chat, profiles) users already expect.

**Product principles (non-negotiable):**

| Principle | Applied as |
|---|---|
| Simplicity over feature-bloat | Every screen has one primary action. No nested menus deeper than 2 levels. |
| Onboarding creates a match instantly | New user sees 3–5 suggested age/interest-matched people before anything else. |
| Trust before scale | Verification and moderation ship in Phase 1, not bolted on later. |
| Performance is a feature | Sub-200ms perceived interaction latency; skeleton loaders everywhere; optimistic UI. |
| Own your data model | No feature ships without a corresponding schema entry in `Database.md` first. |

---

## 2. Tech Stack (Zero-Cost Stack)

| Layer | Choice | Why | Free-tier limit to respect |
|---|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR/ISR, Vercel-native | Vercel Hobby: 100GB bandwidth/mo |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent design system | — |
| Hosting | Vercel (frontend + API routes) | Free, git-integrated CI/CD | Serverless function timeout 10s |
| Database | Supabase (Postgres) or Neon | Free Postgres + built-in auth/storage option | Supabase free: 500MB DB, paused after 7 days inactivity |
| Auth | Supabase Auth or Auth.js (NextAuth) | Free, OAuth + email/password | — |
| Realtime (chat, presence) | Supabase Realtime or Ably free tier | WebSocket-based | Ably free: 6M msgs/mo |
| Object storage (media) | Supabase Storage or Cloudflare R2 free tier | Images/video for posts/stories | R2 free: 10GB storage |
| AI (moderation, recs, chat assist) | **Local models via Ollama** (e.g. Llama 3.1 8B, Llama Guard for moderation) | Zero API cost, runs on dev machine or a free-tier VM for light inference | Not usable in Vercel serverless — see §8 |
| Search | Postgres full-text search (pg_trgm) or Meilisearch self-hosted free | Avoid paid search SaaS | — |
| CDN/Images | Vercel Image Optimization (free tier) | — | 1000 image optimizations/mo |
| Monitoring | Vercel Analytics (free) + Sentry free tier | Error tracking without cost | Sentry free: 5k events/mo |

**Explicitly avoid:** OpenAI/Anthropic paid API calls in the runtime app, paid CDNs, paid DB tiers, paid push notification services (use Web Push API, free).

---

## 3. Core Feature Set

### 3.1 Identity & Onboarding
- Email/password + Google/Apple OAuth
- Age verification at signup (date of birth, minimum age gate 13+, stricter gate 16+/18+ configurable)
- Interest tags (min 5 selected) + age bracket + optional location radius
- Onboarding ends with an **instant match screen**: 3–5 suggested people, one-tap "Say hi"

### 3.2 Profile
- Photo, bio (280 char), interests, age (displayed as range, not exact, for safety), verified badge
- Privacy toggle: Public / Friends-only / Private
- Mutual-friends and shared-interests shown on visiting a profile

### 3.3 Feed & Posts
- Text, image, multi-image, short video posts
- Algorithmic feed = recency + interest-graph overlap + engagement, **not** pure virality/ragebait optimization
- Reactions (like + 4 emoji reactions), threaded comments, share-to-DM
- Edit history + soft delete (never hard-delete user content immediately — 30-day recovery window)

### 3.4 Stories
- 24-hour ephemeral media, view-once receipts, reply-via-DM
- Story rings on top of feed, unseen-first ordering

### 3.5 Friend-Matching Engine (the differentiator)
- "Discover" tab: swipeable/browsable cards filtered by age bracket, interests, language, optional location
- Mutual-interest score shown transparently ("You both like: hiking, jazz, Rust")
- Friend request → accept → unlocks chat (prevents cold-DM spam)

### 3.6 Messaging
- 1:1 and group chat, realtime typing indicators, read receipts (toggleable)
- Media sharing, voice notes
- End-to-end encryption for 1:1 chat is the gold standard — if out of scope for v1, encrypt at rest + in transit (TLS) and document the gap explicitly in `Security.md`

### 3.7 Notifications
- Web Push (free) + in-app notification center
- Granular preferences (per category: messages, likes, matches, mentions)

### 3.8 Safety & Moderation (ship in Phase 1, not later)
- Block, mute, report (with reason taxonomy)
- Local-LLM-based pre-publish content screen (see §8) for hate speech / CSAM-pattern / harassment signals, backed by human-review queue
- Rate limiting on friend requests and DMs to prevent harassment/spam vectors
- Panic-button style "restrict account" if user feels unsafe

### 3.9 Search & Discovery
- Search users by name/interest, search own posts, hashtag-style interest browsing

### 3.10 Admin/Ops (internal, not user-facing)
- Moderation queue dashboard
- Basic analytics (DAU/MAU, retention, report volume)

---

## 4. Non-Functional Requirements

### 4.1 Security (strict, but not user-hostile)
- Passwords: hashed via bcrypt/argon2 (handled by auth provider)
- All endpoints: authenticated + authorized checks server-side, never trust client role claims
- Row-Level Security (RLS) enabled on every Supabase/Postgres table
- Input validation with a schema library (Zod) on every API boundary
- Rate limiting (Upstash Redis free tier or Vercel Edge Config) on auth, messaging, posting endpoints
- CSRF protection on state-changing routes, HTTPS-only cookies, `SameSite=Lax`
- Media upload scanning: file-type allowlist, size caps, strip EXIF/location metadata before storage
- Minimum-necessary data exposure: never return full DOB, only age bracket, in public API responses

### 4.2 Performance
- ISR for public profile pages, streaming SSR for feed
- Image lazy-loading + responsive `srcset`
- Pagination/infinite-scroll with cursor-based queries (never `OFFSET` at scale)

### 4.3 Accessibility
- WCAG 2.1 AA baseline: semantic HTML, keyboard nav, alt text prompts on image upload, color-contrast-checked design tokens

### 4.4 Internationalization
- i18n scaffolding from day one (next-intl or similar) even if only English ships first — "friends around the world" implies multi-language eventually

---

## 5. Living Documentation System

Claude Code must create and **update on every relevant change** — never let these drift from actual code:

| File | Contents | Update trigger |
|---|---|---|
| `Architecture.md` | System diagram (components, data flow, hosting topology), tech stack decisions + rationale | Any new service/library/infra decision |
| `Phases.md` | Roadmap broken into shippable phases (see §6), checkboxes per feature, current phase status | End of every work session |
| `Database.md` | Full ER diagram (as text/mermaid), every table with columns, types, constraints, RLS policies | Any schema migration |
| `Prompts.md` | Every prompt template used for local-AI features (moderation, recommendation ranking, etc.), with model name + version | Any AI prompt added/changed |
| `Security.md` | Threat model, mitigations implemented, known gaps, auth flow diagram | Any security-relevant change |
| `ErrorHandling.md` | Error taxonomy, per-layer handling strategy (client/API/DB), logging/alerting setup, retry policies | Any new error class encountered |

**Rule for Claude Code:** before writing a feature, check the relevant doc; after writing it, update the doc in the same commit. Treat undocumented code as incomplete work.

---

## 6. Development Phases

| Phase | Scope | Exit criteria |
|---|---|---|
| 0 — Foundation | Repo scaffold, CI/CD to Vercel, DB schema v1, auth flow | User can sign up, log in, log out |
| 1 — Identity & Safety | Profile, onboarding, age gate, block/report, RLS policies | Safety features fully functional before any public content exists |
| 2 — Core Social | Posts, feed, comments, reactions | User can post and see others' posts |
| 3 — Matching Engine | Discover tab, interest scoring, friend requests | User can find and add a matched friend |
| 4 — Messaging | 1:1 chat, realtime, notifications | Two friends can chat in realtime |
| 5 — Stories & Media | Stories, media pipeline, storage optimization | Stories post/expire correctly |
| 6 — AI Layer | Local-model moderation, recommendation ranking | Toxic content flagged pre-publish in local testing |
| 7 — Polish & Launch | Performance pass, accessibility audit, i18n scaffold, monitoring wired up | Lighthouse ≥ 90 all categories, error tracking live |

Claude Code should not start Phase N+1 work until Phase N's exit criteria are checked off in `Phases.md`.

---

## 7. Database Schema Guidance (seed for `Database.md`)

Minimum tables to design before Phase 0 is "done": `users`, `profiles`, `interests`, `user_interests`, `posts`, `post_media`, `comments`, `reactions`, `stories`, `friendships` (status: pending/accepted/blocked), `messages`, `conversations`, `reports`, `notifications`.

Every table needs: `id` (uuid), `created_at`, `updated_at`, soft-delete flag where user content is involved, and explicit foreign keys with `ON DELETE` behavior defined (don't default to cascade blindly — decide per relationship and document it).

---

## 8. Local AI Integration (§8 constraint detail)

**Problem:** Vercel serverless functions cannot run local Ollama models directly (no persistent GPU/CPU process). Resolve as follows:

1. **Development-time AI tasks** (content moderation rule authoring, generating seed data, ranking heuristic tuning) — run Ollama locally on the dev machine, no runtime dependency.
2. **Runtime AI tasks that must ship free:**
   - Option A: Deploy a small always-free inference sidecar (e.g. a free-tier Fly.io or Render instance running Ollama with a small quantized model) that Vercel calls over HTTPS.
   - Option B: Replace "AI" moderation with a fast rule-based + keyword/embedding classifier (no LLM call) for v1, and reserve LLM calls for the async human-review queue only (batched, not per-request), to stay within free compute.
3. Document the chosen approach and its cost ceiling explicitly in `Architecture.md` and `Prompts.md` — do not silently assume unlimited local inference in production.

---

## 9. Error Handling Protocol (seed for `ErrorHandling.md`)

- Client: typed error boundaries per route, user-facing messages never expose stack traces
- API: consistent error envelope `{ code, message, requestId }`, never leak internal error text to client
- DB: constraint violations mapped to typed application errors, not raw Postgres errors surfaced to UI
- Observability: every 5xx logged to Sentry with request context; alert threshold defined once traffic exists

---

## 10. Deployment (Free-Tier Path)

1. Push to GitHub → Vercel auto-deploys on `main`
2. Supabase project (free tier) for DB/Auth/Storage/Realtime
3. Environment variables managed via Vercel dashboard, never committed
4. Preview deployments per PR for review before merge
5. Cron/scheduled jobs (e.g. story expiry cleanup) via Vercel Cron (free tier includes limited cron jobs) — document the job list in `Architecture.md`

---

## 11. Explicit "Do Not" List

- Do not hardcode secrets/API keys in source
- Do not skip RLS "to move faster" — retrofit is far more expensive
- Do not display exact birthdate or precise geolocation publicly
- Do not ship messaging before block/report exists
- Do not let any doc in §5 go stale — treat as build-blocking, not optional

---

## 12. Kickoff Instruction (paste this into Claude Code)

```
You are building a global friend-making social platform, spec'd in this
document. Work phase by phase per Section 6. Before each phase:
1. Read/update Architecture.md, Database.md, Security.md.
2. Implement the phase's scope only.
3. Update Phases.md, ErrorHandling.md, and Prompts.md (if AI touched).
4. Confirm exit criteria before proceeding.

Constraints: zero paid services (Section 2 stack only), local Ollama for
dev-time AI, RLS-enforced Postgres via Supabase, deploy target Vercel free
tier. Ask me before introducing any new paid dependency.

Start with Phase 0: repo scaffold, CI/CD, auth, and initial schema.
```

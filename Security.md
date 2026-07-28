# Security

> Living document. Update with every security-relevant change. See the
> master spec, §4/§11.

## 1. Threat model (Phase 0 + Phase 1 scope)

In scope for Phase 0:
- **Account takeover** via weak passwords, leaked credentials, session
  hijacking. Mitigations: Supabase Auth (bcrypt-hashed passwords,
  HttpOnly cookies, server-validated JWT), Zod input validation,
  Supabase's built-in rate limiting on `signInWithPassword`.
- **Open redirect** via the `?next=` parameter after sign-in. Mitigation:
  `safeNext()` in `src/app/actions/auth.ts` restricts `next` to a
  same-origin absolute path.
- **Information disclosure** of internal error text. Mitigation: typed
  `AppError` classes and the `{ code, message, requestId }` envelope —
  the server log gets the stack, the client gets a stable code and a
  short user-safe message.
- **CSRF** on state-changing routes. Mitigations: server actions in
  Next.js 15+ are POST-only and check the Origin header automatically;
  cookie is `SameSite=Lax` by default (set by `@supabase/ssr`).

In scope for Phase 1:
- **Unauthorized profile access** — mitigated by RLS on `profiles` (users see only own profile in the table) and `profiles_public` view (public browsable profiles with age bracket, not DOB).
- **Unwanted contact** (harassment, spam friend requests) — partially mitigated by block/mute (Phase 1) and friend-request-to-message gate (Phase 3).
- **Impersonation via falsified DOB** — DOB is validated server-side at signup, and the schema enforces a valid birth date. Minimum age 13 is checked before account creation completes.
- **Age disclosure** — exact DOB is never sent to client. Age bracket function computes brackets (e.g., "16-20") server-side and is only exposed in `profiles_public` view.

Out of scope for Phase 1 (deferred):
- **Content safety** (harassment, hate speech, CSAM-pattern) — Phase 6.
- **End-to-end encryption** for chat — spec §3.6 says we may defer to
  TLS-at-rest if E2E is out of scope. Tracked as a known gap below.
- **Media upload scanning** (file-type allowlist, EXIF strip) — Phase 5.

In scope for Phase 4:
- **Direct message privacy** — `conversations` and `messages` RLS only
  allow participants to read/write their own threads.
- **Notification privacy** — `notifications` rows are readable only by
  the recipient, and inserts require the authenticated actor to match
  the row's `actor_id`.
- **Message spam** — still a known gap; we do not yet enforce per-user
  rate limiting on DMs beyond Supabase/Vercel free-tier throttles.

## 2. Auth flow

See `Architecture.md` §3 for the ASCII diagram. Properties of the
implementation:

- The DAL (`src/lib/dal.ts`) is the **only** place that calls
  `supabase.auth.getUser()`. Server Components go through `verifySession()`.
  Server actions that mutate go through `requireSession()`. There is no
  other way to read identity in the app.
- `verifySession` is wrapped in React's `cache()` so multiple components
  in the same render tree share one Supabase roundtrip.
- The proxy (`src/proxy.ts`) is responsible for **refreshing** the
  Supabase session cookie. Supabase's server client cannot refresh
  tokens from a Server Component (cookies are read-only there), so the
  proxy is mandatory.
- Cookies are HttpOnly and SameSite=Lax. We do not set `Secure` on
  `localhost`; `@supabase/ssr` handles that automatically.
- Anonymous users are redirected from `/account/*` and `/onboarding/*` to `/login?next=…`
  by the proxy. Belt-and-braces: the protected pages also re-check the session and redirect if missing.
- DOB is stored in `user_metadata` during signup (via Supabase Auth's
  `data` option) and retrieved during the callback to populate `profiles.date_of_birth`.
  It is never sent to the client.

## 3. Data access

- Every table in `Database.md` has RLS enabled. Service role bypasses
  RLS, but service-role code paths do not exist in Phase 0. The only
  queries Phase 0 issues are via the authenticated client reading the
  signed-in user's own profile and interests.
- Input from forms is validated with Zod on the server. We do not
  trust client-side validation. The same schema is used on both sides
  so they cannot drift.
- `auth.uid()` is the only authorization primitive we read on the
  database side. We never store roles on the client and trust the
  client to assert them.

## 4. Sensitive data

- `profiles.date_of_birth` is stored once, server-side. It is never
  returned by the API. Age is exposed only as a **bracket** (Phase 1's
  projection view). Spec §11 is explicit on this.
- Email addresses are never exposed in public API responses. They are
  only shown to the signed-in user on `/account`.
- Passwords never touch our code. Supabase Auth handles hashing
  (bcrypt) and storage. Server actions accept the password as a
  `FormData` field and pass it directly to `signInWithPassword` /
  `signUp`; we do not log it, do not echo it, and the action returns
  only success/failure.

## 5. Known gaps (must be closed before launch)

| Gap                                                          | Phase to close | Owner note             |
|--------------------------------------------------------------|----------------|------------------------|
| Rate limiting on app endpoints (auth, posts, DMs)            | Phase 4        | Use Upstash free tier. |
| End-to-end encryption for 1:1 chat                           | Phase 4 (opt)  | Otherwise document.    |
| Media upload scanning (allowlist, size caps, EXIF strip)     | Phase 5        |                        |
| Sentry / error tracking wired into the error boundary         | Phase 7        |                        |
| Automated dependency / vulnerability scanning in CI          | Phase 7        |                        |
| Rate limiting on friend requests and DMs to prevent spam     | Phase 4        |                        |

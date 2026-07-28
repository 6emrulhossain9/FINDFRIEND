# Error Handling

> Living document. Update whenever a new error class is introduced. See
> the master spec, §9.

## 1. Taxonomy

| Class                | HTTP | `code` (in envelope) | When                                                |
|----------------------|------|----------------------|-----------------------------------------------------|
| `ValidationError`    | 422  | `VALIDATION_FAILED`  | Input failed Zod parse or business-rule check.      |
| `UnauthenticatedError` | 401 | `UNAUTHENTICATED`    | Caller has no valid session.                        |
| `ForbiddenError`     | 403  | `FORBIDDEN`          | Caller is signed in but not allowed.                |
| `NotFoundError`      | 404  | `NOT_FOUND`          | Resource missing or hidden by RLS.                  |
| `ConflictError`      | 409  | `CONFLICT`           | Unique-constraint violation, duplicate action, etc. |
| `RateLimitedError`   | 429  | `RATE_LIMITED`       | Upstash or provider returned 429.                   |
| `AppError` (generic) | varies | as set             | Anything that needs a custom code + httpStatus.     |
| unknown              | 500  | `INTERNAL`           | Anything that escapes the typed classes.            |

Codes are SCREAMING_SNAKE, never localized, never changed once shipped.
They are part of the API contract.

## 2. Per-layer strategy

### Client (React / browser)
- Server Action errors are returned as form state — `{ ok: false,
  errors, message }` — and rendered inline next to the field or above
  the submit button. We do not show a toast for form errors; toasts
  are reserved for "after navigation" events.
- `app/error.tsx` is the only place an uncaught error can land on the
  user. It shows a generic "Something went wrong" with the error
  `digest` (a server-side hash) and a retry button. It deliberately
  does not show the raw `error.message` — that can contain DB text or
  Supabase internals.
- We never log the user out as a recovery from a 5xx. A 500 is a code
  bug, not a session bug; clearing the session would be confusing.

### Server (Next.js Server Actions + Route Handlers)
- All Server Actions re-validate their inputs with Zod. Validation
  failures return form state (not thrown).
- `requireSession()` is called inside any action that mutates user data.
  If it throws `UnauthenticatedError`, the boundary (`error.tsx`) takes
  over. (The proxy usually catches this first and redirects, so this
  is the safety net.)
- `try`/`catch` is avoided inside actions for expected errors; we model
  them as return values per the Next.js 16 docs. We only catch around
  upstream calls (Supabase, future Ollama) to translate their error
  shape into our typed `AppError`s.

### Database
- Supabase / Postgres errors arrive as `error.message` and `error.code`
  strings. The mapping lives at the call site: a unique-constraint
  violation becomes `ConflictError`; a not-found becomes `NotFoundError`;
  a permission-denied becomes `ForbiddenError`. Raw Postgres text is
  never returned to the client — the envelope shows a generic
  message and the server log has the detail.

### Observability
- Phase 0 has no third-party error sink. The browser console and the
  Vercel runtime logs are the only places errors surface. Phase 7
  wires in Sentry (free tier, 5k events/mo) at the error boundary
  and at the server-action boundary.

## 3. Envelope shape

```ts
type ErrorEnvelope = {
  code: ErrorCode | "INTERNAL";
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
};
```

`code` and `message` are safe to show to the user (subject to UI copy
review). `requestId` correlates to a server-side log line so a
support request from a user can be traced without leaking internals.
`details` is reserved for machine-readable field errors; it is never
used to leak server stack traces or DB error text.

## 4. Retry policies

- Auth failures: do not auto-retry. The user re-submits.
- Network failures on a Server Action: Next.js retries once
  automatically. After that, the boundary renders.
- Upstream (Supabase, future Ollama): retry on idempotent GETs with
  exponential backoff, max 3 attempts. Mutations do not auto-retry
  in Phase 0; we surface the error to the user and ask them to
  try again.
- Vercel function timeout (10s on free tier): we design actions to
  finish well under that, with a hard cap of 5s for any single
  upstream call. Long-running work goes to Vercel Cron (Phase 5+).

## 5. Things explicitly NOT in Phase 0

- Sentry / error reporting integration (Phase 7).
- Per-user audit log (Phase 1).
- Toast / notification subsystem (Phase 1+).
- Offline retry queue on the client (never planned — server actions
  over flaky networks just fail and the user retries).

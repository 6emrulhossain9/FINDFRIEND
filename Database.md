# Database

> Living document. Update with every migration. See the master spec, §5/§7.

## ER overview (Phase 0 – Phase 4)

```
   auth.users  (managed by Supabase Auth — we don't own this table)
       │  1:1
       ▼
   public.profiles  ◄──────────────┐
       │  M:N                      │
       ▼                           │
   public.interests ── M:N ──► public.user_interests
       ▲                           ▲
       │                           │
   public.blocks (Phase 1)         │
   public.mutes (Phase 1)          │
   public.reports (Phase 1)        │
   public.friendships (Phase 1) ───┘
       │
       │  1:N
       ▼
   public.posts (Phase 2) ─────────┐
       │  1:N                       │
       ├─► public.post_reactions    │
       └─► public.comments          │
              │  1:N                │
              └─► public.comment_reactions
```

Phase 0 introduces three tables: `profiles`, `interests`, `user_interests`.
Phase 1 adds `blocks`, `mutes`, `reports`, `friendships` for safety and
matching. Phase 2 adds `posts`, `post_reactions`, `comments`,
`comment_reactions` for the feed. Phase 3 reuses the Phase 1
`friendships` table for matching. Phase 4 adds `conversations`,
`messages`, and `notifications` for direct chat and the in-app inbox.
Other tables from spec §7 (`stories`) land in later phases; their RLS
shapes will be designed before each phase starts.

## Conventions

- `id` is always `uuid` with `default gen_random_uuid()`. Where the row
  is keyed off an external entity (e.g. `auth.users`), the FK is also
  the primary key.
- `created_at timestamptz not null default now()`.
- `updated_at timestamptz not null default now()` maintained by
  trigger `set_updated_at()`.
- Soft delete is `deleted_at timestamptz` (NULL = alive). No hard delete
  inside the 30-day recovery window.
- Every FK has explicit `ON DELETE`. Cascade only when child rows have
  no independent meaning; otherwise `restrict`. Inline comments explain
  each choice.

## `public.profiles`

| Column             | Type         | Notes                                                   |
|--------------------|--------------|---------------------------------------------------------|
| `id`               | uuid PK      | FK → `auth.users(id)` ON DELETE CASCADE.                |
| `display_name`     | text         | Free-form. NULL until onboarding finishes.              |
| `date_of_birth`    | date         | Sensitive. Never exposed publicly; age bracket via view. |
| `avatar_url`       | text         | Phase 5 will validate it's a Supabase Storage URL.      |
| `bio`              | text         | CHECK char_length ≤ 280.                                |
| `onboarding_state` | text         | CHECK in (`'pending'`,`'active'`,`'restricted'`).       |
| `deleted_at`       | timestamptz  | Soft delete.                                            |
| `created_at`       | timestamptz  |                                                         |
| `updated_at`       | timestamptz  | Trigger-maintained.                                     |

**RLS:**
- SELECT own row only.
- INSERT own row only (Phase 1 swaps this for a trigger-driven insert).
- UPDATE own row only.

## `public.interests`

| Column       | Type        | Notes                                     |
|--------------|-------------|-------------------------------------------|
| `id`         | uuid PK     |                                           |
| `slug`       | text unique | Stable, URL-safe. Used in URLs and seeds. |
| `label`      | text        | Display name.                             |
| `category`   | text        | Loose grouping for the picker UI.         |
| `created_at` | timestamptz |                                           |

**RLS:** SELECT public (anon + authenticated). Writes only via service
role (no policy = no implicit allow).

Seeded by `0002_seed_interests.sql` with 39 starter tags across 9
categories (creative, outdoors, food, games, tech, learn, lifestyle,
music, sports). The list grows as we learn which tags correlate with
successful friendships; edits are admin-only.

## `public.user_interests`

| Column        | Type   | Notes                                          |
|---------------|--------|------------------------------------------------|
| `user_id`     | uuid   | FK → `profiles(id)` ON DELETE CASCADE.         |
| `interest_id` | uuid   | FK → `interests(id)` ON DELETE RESTRICT.       |
| `created_at`  | timestamptz |                                            |
| (composite PK on `user_id`, `interest_id`)       |                                                |

**Why CASCADE on profiles, RESTRICT on interests:** A profile hard-delete
(everything past the 30-day recovery window) takes its interests with it
because they have no meaning without the user. An interest tag, by
contrast, is shared infrastructure — deleting it would silently break
matches for users who picked it, so it requires an explicit admin
action.

**RLS:** SELECT / INSERT / DELETE own rows only.

## `public.blocks` (Phase 1)

| Column             | Type        | Notes                                               |
|--------------------|-------------|-----------------------------------------------------|
| `user_id`          | uuid PK     | FK → `profiles(id)` ON DELETE CASCADE.              |
| `blocked_user_id`  | uuid PK     | FK → `profiles(id)` ON DELETE CASCADE.              |
| `reason`           | text        | Optional: "harassment", "spam", "other".            |
| `created_at`       | timestamptz |                                                     |

**RLS:** SELECT/INSERT/DELETE own blocks only.

---

## `public.mutes` (Phase 1)

| Column            | Type        | Notes                                               |
|-------------------|-------------|-----------------------------------------------------|
| `user_id`         | uuid PK     | FK → `profiles(id)` ON DELETE CASCADE.              |
| `muted_user_id`   | uuid PK     | FK → `profiles(id)` ON DELETE CASCADE.              |
| `created_at`      | timestamptz |                                                     |

**RLS:** SELECT/INSERT/DELETE own mutes only.

---

## `public.reports` (Phase 1)

| Column             | Type         | Notes                                               |
|--------------------|--------------|-----------------------------------------------------|
| `id`               | uuid PK      |                                                     |
| `reporter_id`      | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `reported_user_id` | uuid         | FK → `profiles(id)` ON DELETE SET NULL.             |
| `reason`           | text (enum)  | harassment, hate-speech, spam, inappropriate-content, underage-user, other |
| `description`      | text         | CHECK char_length ≤ 1000.                          |
| `status`           | text         | open, reviewing, resolved, dismissed (default: open) |
| `created_at`       | timestamptz  |                                                     |
| `updated_at`       | timestamptz  | Trigger-maintained.                                 |

**RLS:** SELECT own reports only (reporter reads what they filed). INSERT allowed for authenticated users.

---

## `public.friendships` (Phase 1)

| Column         | Type         | Notes                                               |
|----------------|--------------|-----------------------------------------------------|
| `id`           | uuid PK      |                                                     |
| `requester_id` | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `receiver_id`  | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `status`       | text (enum)  | pending, accepted, blocked, declined (default: pending) |
| `created_at`   | timestamptz  |                                                     |
| `updated_at`   | timestamptz  | Trigger-maintained.                                 |

**Unique constraint:** (requester_id, receiver_id). Prevents duplicate requests.

**RLS:** SELECT/UPDATE rows where auth.uid() is either requester or receiver. INSERT allowed for requester only.

---

## `public.profiles_public` view (Phase 1)

A public-facing projection of `profiles` that exposes:
- `id`, `display_name`, `age_bracket` (via `age_bracket()` function, not exact DOB)
- `avatar_url`, `bio`, `onboarding_state`, `created_at`

Only shows profiles that are `onboarding_state = 'active'` and `deleted_at IS NULL`.

---

## `public.posts` (Phase 2)

| Column       | Type         | Notes                                           |
|--------------|--------------|------------------------------------------------|
| `id`         | uuid PK      |                                                 |
| `author_id`  | uuid         | FK → `profiles(id)` ON DELETE CASCADE.          |
| `content`    | text         | CHECK char_length between 1 and 5000.          |
| `deleted_at` | timestamptz  | Soft delete (30-day recovery).                  |
| `created_at` | timestamptz  |                                                 |
| `updated_at` | timestamptz  | Trigger-maintained.                             |

**RLS:** Users can INSERT/UPDATE/DELETE own posts. Everyone (authenticated) can SELECT non-deleted posts.

---

## `public.post_reactions` (Phase 2)

| Column          | Type        | Notes                                               |
|-----------------|-------------|-----------------------------------------------------|
| `id`            | uuid PK     |                                                     |
| `post_id`       | uuid        | FK → `posts(id)` ON DELETE CASCADE.                 |
| `user_id`       | uuid        | FK → `profiles(id)` ON DELETE CASCADE.              |
| `reaction_type` | text (enum) | like, love, haha, wow, sad                          |
| `created_at`    | timestamptz |                                                     |
| (unique on `post_id`, `user_id`, `reaction_type`) |                                 |

**RLS:** Users can INSERT own reactions, DELETE own reactions, SELECT all reactions.

---

## `public.comments` (Phase 2)

| Column       | Type         | Notes                                           |
|--------------|--------------|------------------------------------------------|
| `id`         | uuid PK      |                                                 |
| `post_id`    | uuid         | FK → `posts(id)` ON DELETE CASCADE.             |
| `author_id`  | uuid         | FK → `profiles(id)` ON DELETE CASCADE.          |
| `content`    | text         | CHECK char_length between 1 and 1000.          |
| `deleted_at` | timestamptz  | Soft delete.                                    |
| `created_at` | timestamptz  |                                                 |
| `updated_at` | timestamptz  | Trigger-maintained.                             |

**RLS:** Similar to posts (user-scoped mutations, public SELECT for non-deleted).

---

## `public.comment_reactions` (Phase 2)

Same structure as `post_reactions`, but FK to `comments(id)` instead.

---

## `public.conversations` (Phase 4)

| Column              | Type         | Notes                                               |
|---------------------|--------------|-----------------------------------------------------|
| `id`                | uuid PK      |                                                     |
| `participant_a_id`  | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `participant_b_id`  | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `last_message_at`    | timestamptz  | Updated on each send.                               |
| `created_at`        | timestamptz  |                                                     |
| `updated_at`        | timestamptz  | Trigger-maintained.                                 |

**Constraints:** sorted participant order, unique pair, no self chat.

**RLS:** participants can SELECT/INSERT/UPDATE their own conversations.

---

## `public.messages` (Phase 4)

| Column            | Type         | Notes                                               |
|-------------------|--------------|-----------------------------------------------------|
| `id`              | uuid PK      |                                                     |
| `conversation_id`  | uuid         | FK → `conversations(id)` ON DELETE CASCADE.        |
| `sender_id`       | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `content`         | text         | CHECK char_length between 1 and 2000.              |
| `deleted_at`      | timestamptz  | Soft delete.                                        |
| `created_at`      | timestamptz  |                                                     |
| `updated_at`      | timestamptz  | Trigger-maintained.                                 |

**RLS:** conversation participants can SELECT non-deleted messages; senders can INSERT and manage their own rows.

---

## `public.notifications` (Phase 4)

| Column         | Type         | Notes                                               |
|----------------|--------------|-----------------------------------------------------|
| `id`           | uuid PK      |                                                     |
| `recipient_id`  | uuid         | FK → `profiles(id)` ON DELETE CASCADE.              |
| `actor_id`     | uuid         | FK → `profiles(id)` ON DELETE CASCADE (nullable in DB, required by insert policy). |
| `kind`         | text (enum)  | `message`, `friend_request`, `friend_request_accepted`. |
| `entity_type`  | text (enum)  | `conversation`, `message`, `friendship`.           |
| `entity_id`    | uuid         | Optional deep-link target.                          |
| `data`         | jsonb        | Freeform structured payload for UI links.           |
| `read_at`      | timestamptz  | NULL = unread.                                      |
| `created_at`   | timestamptz  |                                                     |
| `updated_at`   | timestamptz  | Trigger-maintained.                                 |

**RLS:** recipients can SELECT/UPDATE/DELETE their own rows; insertions require the actor to be the authenticated user.

---

## Runbook: apply migrations

There are two supported paths; neither is automated in Phase 0 because
no Supabase project is provisioned yet and the Supabase CLI is not
installed locally.

**Path A — Supabase dashboard (recommended for one-off runs):**
1. Create a project in the Supabase dashboard (free tier).
2. Open SQL Editor.
3. Paste `0001_init.sql`, run.
4. Paste `0002_seed_interests.sql`, run.
5. Paste `0003_phase1_identity_safety.sql`, run.
6. Paste `0004_phase2_core_social.sql`, run.
7. Paste `0005_phase4_messaging_notifications.sql`, run.
8. Copy the project URL and anon key into `web/.env.local` and into the
  Vercel project settings.

**Path B — Supabase CLI (better for repeat runs):**
1. `npm i -g supabase` (or use `npx supabase`).
2. `supabase login`.
3. `cd supabase && supabase link --project-ref <your-ref>`.
4. `supabase db push`.

## Out of scope (later phases)

- `stories` (Phase 5)
- Materialized views for the feed (Phase 2 — deferred) and matching (Phase 3 — currently in app code)
- Full-text search indexes (Phase 7)

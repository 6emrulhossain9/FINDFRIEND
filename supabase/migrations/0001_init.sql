-- 0001_init.sql — Phase 0 schema.
--
-- Scope of this migration:
--   * `public.profiles` — 1:1 row per auth user. Holds display name, DOB,
--     avatar URL, and onboarding state. RLS is strict: every user can only
--     SELECT their own row, and the service role (or triggers) can write.
--   * `public.interests` — controlled vocabulary of interest tags. Read-public.
--   * `public.user_interests` — many-to-many join. Users write their own.
--
-- Out of scope (added in later phases): posts, comments, reactions, stories,
-- friendships, messages, conversations, reports, notifications.
--
-- Conventions used in this file:
--   * Every table has `id uuid primary key default gen_random_uuid()`.
--   * Every user-content table has `created_at` and `updated_at`.
--   * Soft-delete is a `deleted_at timestamptz` column (NULL = alive). We
--     never hard-delete user content within the 30-day recovery window.
--   * Foreign keys are explicit with chosen `ON DELETE` behavior; the
--     rationale is documented inline next to each one.
--   * RLS is enabled on every table. Service role bypasses it; the anon
--     role and authenticated role are explicitly granted below.

-- -----------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------

-- gen_random_uuid() lives in pgcrypto on older Postgres, in the built-in
-- namespace on 13+. Pinning it to pgcrypto is portable across Supabase
-- versions. `extensions` is the schema Supabase documents for this.
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------
-- Helper: updated_at trigger
-- -----------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------

-- `profiles` is the public-facing identity row. We keep auth concerns
-- (email, hashed password) in `auth.users` (managed by Supabase Auth)
-- and put everything we need to render a profile here.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  -- DOB is sensitive. The spec is explicit: never expose it publicly. We
  -- store the real value here and rely on a *view* or a DTO to project an
  -- age bracket instead. RLS is set so only the owning user can SELECT.
  date_of_birth date,
  avatar_url text,
  bio text check (char_length(bio) <= 280),
  -- onboarding_state drives Phase 1's "instant match" flow. We keep the
  -- enum narrow on purpose: 'pending' until the user finishes onboarding,
  -- 'active' once they have an interest set and a display name, and
  -- 'restricted' for users in the safety panic state.
  onboarding_state text not null default 'pending'
    check (onboarding_state in ('pending', 'active', 'restricted')),
  -- Soft delete (account deletion with 30-day recovery window).
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_onboarding_state_idx on public.profiles (onboarding_state)
  where deleted_at is null;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- `interests` is a small, mostly static vocabulary. We seed a starter set
-- in 0002_seed_interests.sql. Read-public; writes only via service role.
create table public.interests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  category text,
  created_at timestamptz not null default now()
);
create index interests_category_idx on public.interests (category);

-- `user_interests` is the join. ON DELETE CASCADE on profile_id: if the
-- profile is hard-deleted (past recovery window), interests go with it.
-- We do not cascade from interests: deleting an interest tag should
-- require an admin action, not a side-effect of user activity.
create table public.user_interests (
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

-- -----------------------------------------------------------------------
-- Row-Level Security
-- -----------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.user_interests enable row level security;

-- profiles: a user can read their own row. (Other users' profiles are
-- exposed via a separate public projection view added in Phase 1.)
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

-- profiles: a user can insert exactly their own row. The trigger in 0003
-- (added in Phase 1) will auto-create this on signup; until then we
-- allow self-insert as a safety net for the manual onboarding path.
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- profiles: a user can update only their own row.
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- interests: read-public for any role. Writes only by service role (no
-- policy means no implicit allow).
create policy "interests_select_anon"
  on public.interests
  for select
  to anon, authenticated
  using (true);

-- user_interests: a user can read their own interests. (Other users'
-- interests are read via a join in Phase 1's discovery flow, behind a
-- view that only exposes the matching subset.)
create policy "user_interests_select_own"
  on public.user_interests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_interests_insert_own"
  on public.user_interests
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_interests_delete_own"
  on public.user_interests
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------
-- Service-role grants
-- -----------------------------------------------------------------------
-- The service role bypasses RLS, but it still needs USAGE on the schema
-- and explicit grants to be visible in the API. These are idempotent.

grant usage on schema public to anon, authenticated, service_role;
grant select on public.interests to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.user_interests to authenticated;
grant all on all tables in schema public to service_role;

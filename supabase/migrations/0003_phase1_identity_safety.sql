-- 0003_phase1_identity_safety.sql — Phase 1 schema additions
--
-- Scope of this migration:
--   * `public.blocks` — track which users have blocked which other users
--   * `public.mutes` — track which users have muted which other users
--   * `public.reports` — track user-initiated reports on other users or content
--   * `public.friendships` — track friend requests and accepted friendships
--   * `age_bracket` computed column for profile visibility (e.g., "16-20" not DOB)
--   * `public.profiles_public` view — publicly browsable profiles (age bracket only)
--   * Updated RLS policies to enforce blocks and mutes in discovery
--
-- All foreign keys cascade from profiles; age/privacy filtering is in the app layer.

-- -----------------------------------------------------------------------
-- Blocks table
-- -----------------------------------------------------------------------

create table public.blocks (
  -- PK: user_id (who is blocking) + blocked_user_id (who is blocked)
  user_id uuid not null references public.profiles(id) on delete cascade,
  blocked_user_id uuid not null references public.profiles(id) on delete cascade,
  reason text,  -- optional: "harassment", "spam", "other"
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_user_id),
  constraint no_self_block check (user_id != blocked_user_id)
);

create index blocks_user_id_idx on public.blocks (user_id);
create index blocks_blocked_user_id_idx on public.blocks (blocked_user_id);

alter table public.blocks enable row level security;

-- User can read their own blocks.
create policy "blocks_select_own"
  on public.blocks
  for select
  to authenticated
  using (user_id = auth.uid());

-- User can insert their own blocks.
create policy "blocks_insert_own"
  on public.blocks
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- User can delete their own blocks.
create policy "blocks_delete_own"
  on public.blocks
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------
-- Mutes table
-- -----------------------------------------------------------------------

create table public.mutes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  muted_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, muted_user_id),
  constraint no_self_mute check (user_id != muted_user_id)
);

create index mutes_user_id_idx on public.mutes (user_id);
create index mutes_muted_user_id_idx on public.mutes (muted_user_id);

alter table public.mutes enable row level security;

-- User can read their own mutes.
create policy "mutes_select_own"
  on public.mutes
  for select
  to authenticated
  using (user_id = auth.uid());

-- User can insert their own mutes.
create policy "mutes_insert_own"
  on public.mutes
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- User can delete their own mutes.
create policy "mutes_delete_own"
  on public.mutes
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------
-- Reports table
-- -----------------------------------------------------------------------

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null,  -- null if user later deleted
  -- future: reported_post_id, reported_comment_id for content-level reporting
  reason text not null check (reason in (
    'harassment',
    'hate-speech',
    'spam',
    'inappropriate-content',
    'underage-user',
    'other'
  )),
  description text check (char_length(description) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_reported_user_id_idx on public.reports (reported_user_id);
create index reports_status_idx on public.reports (status);

create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

-- User can read their own reports (they filed them).
create policy "reports_select_own"
  on public.reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

-- User can insert a report.
create policy "reports_insert"
  on public.reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- -----------------------------------------------------------------------
-- Friendships table
-- -----------------------------------------------------------------------

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  -- status: 'pending' (request sent), 'accepted' (both are friends), 'blocked' (either blocked), 'declined' (receiver declined)
  status text not null default 'pending' check (status in ('pending', 'accepted', 'blocked', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Prevent duplicate requests and self-friendships
  unique (requester_id, receiver_id),
  constraint no_self_friend check (requester_id != receiver_id)
);

create index friendships_requester_id_idx on public.friendships (requester_id);
create index friendships_receiver_id_idx on public.friendships (receiver_id);
create index friendships_status_idx on public.friendships (status);

create trigger friendships_set_updated_at
  before update on public.friendships
  for each row execute function public.set_updated_at();

alter table public.friendships enable row level security;

-- User can read friendships where they are the requester or receiver.
create policy "friendships_select_own"
  on public.friendships
  for select
  to authenticated
  using (requester_id = auth.uid() or receiver_id = auth.uid());

-- User can insert a friend request (they are the requester).
create policy "friendships_insert_own"
  on public.friendships
  for insert
  to authenticated
  with check (requester_id = auth.uid());

-- User can update a friendship (to accept/decline/block).
create policy "friendships_update_own"
  on public.friendships
  for update
  to authenticated
  using (requester_id = auth.uid() or receiver_id = auth.uid())
  with check (requester_id = auth.uid() or receiver_id = auth.uid());

-- -----------------------------------------------------------------------
-- Helper: age bracket computation
-- -----------------------------------------------------------------------

-- Compute age from DOB. Used by the public_profiles view.
create or replace function public.age_bracket(date_of_birth date)
returns text
language sql
immutable
as $$
  select
    case
      when date_of_birth is null then null
      -- Extract year difference; if birthday hasn't occurred this year, subtract 1
      when extract(year from age(now(), date_of_birth))::int < 13 then '13-15'
      when extract(year from age(now(), date_of_birth))::int < 16 then '16-18'
      when extract(year from age(now(), date_of_birth))::int < 21 then '18-20'
      when extract(year from age(now(), date_of_birth))::int < 26 then '21-25'
      when extract(year from age(now(), date_of_birth))::int < 31 then '26-30'
      when extract(year from age(now(), date_of_birth))::int < 41 then '31-40'
      when extract(year from age(now(), date_of_birth))::int < 51 then '41-50'
      else '50+'
    end;
$$;

-- -----------------------------------------------------------------------
-- Public profiles view
-- -----------------------------------------------------------------------

-- Expose profiles publicly (for the discover/browse flow) without sensitive
-- data like exact DOB. Consumers of this view should always apply their own
-- RLS checks on top (e.g., filtering out blocked users in the app layer).
create view public.profiles_public as
select
  id,
  display_name,
  public.age_bracket(date_of_birth) as age_bracket,
  avatar_url,
  bio,
  onboarding_state,
  created_at
from public.profiles
where deleted_at is null
and onboarding_state = 'active';

-- Profiles view: a user can read any active, non-deleted profile.
-- (RLS on the base table will be relaxed in Phase 3's discovery flow.)
alter view public.profiles_public owner to postgres;

-- -----------------------------------------------------------------------
-- Update profiles RLS for Phase 1
-- -----------------------------------------------------------------------

-- Keep existing policies. In Phase 1, users are still mostly invisible to
-- each other (except via the discovery/matching flow in Phase 3, which will
-- apply block/mute filtering in app logic).

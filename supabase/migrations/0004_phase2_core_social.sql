-- 0004_phase2_core_social.sql — Phase 2 schema (posts, comments, reactions)
--
-- Scope:
--   * `public.posts` — user-created posts with text, optional image
--   * `public.post_reactions` — like/emoji reactions on posts
--   * `public.comments` — threaded comments on posts
--   * `public.comment_reactions` — reactions on comments (Phase 2 optional)
--
-- All content is soft-deletable. RLS ensures users can only modify their own posts.

-- -----------------------------------------------------------------------
-- Posts table
-- -----------------------------------------------------------------------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 5000),
  -- image_url will be Phase 5; for now, posts are text-only
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_author_id_idx on public.posts (author_id)
  where deleted_at is null;
create index posts_created_at_idx on public.posts (created_at desc)
  where deleted_at is null;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- User can insert their own posts
create policy "posts_insert_own"
  on public.posts
  for insert
  to authenticated
  with check (author_id = auth.uid());

-- User can update their own posts
create policy "posts_update_own"
  on public.posts
  for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- User can delete their own posts
create policy "posts_delete_own"
  on public.posts
  for delete
  to authenticated
  using (author_id = auth.uid());

-- Anyone can read non-deleted posts from non-blocked users
-- (Block filtering happens in app layer for now)
create policy "posts_select_public"
  on public.posts
  for select
  to authenticated
  using (deleted_at is null);

-- -----------------------------------------------------------------------
-- Post reactions (like + 4 emoji reactions)
-- -----------------------------------------------------------------------

create table public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'haha', 'wow', 'sad')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction_type)
);

create index post_reactions_post_id_idx on public.post_reactions (post_id);
create index post_reactions_user_id_idx on public.post_reactions (user_id);

alter table public.post_reactions enable row level security;

create policy "post_reactions_insert_own"
  on public.post_reactions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "post_reactions_delete_own"
  on public.post_reactions
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "post_reactions_select_public"
  on public.post_reactions
  for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------
-- Comments table
-- -----------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 1000),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id)
  where deleted_at is null;
create index comments_author_id_idx on public.comments (author_id)
  where deleted_at is null;
create index comments_created_at_idx on public.comments (created_at)
  where deleted_at is null;

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

create policy "comments_insert"
  on public.comments
  for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "comments_update_own"
  on public.comments
  for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments_delete_own"
  on public.comments
  for delete
  to authenticated
  using (author_id = auth.uid());

create policy "comments_select_public"
  on public.comments
  for select
  to authenticated
  using (deleted_at is null);

-- -----------------------------------------------------------------------
-- Comment reactions (same as post reactions)
-- -----------------------------------------------------------------------

create table public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love', 'haha', 'wow', 'sad')),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, reaction_type)
);

create index comment_reactions_comment_id_idx on public.comment_reactions (comment_id);
create index comment_reactions_user_id_idx on public.comment_reactions (user_id);

alter table public.comment_reactions enable row level security;

create policy "comment_reactions_insert_own"
  on public.comment_reactions
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "comment_reactions_delete_own"
  on public.comment_reactions
  for delete
  to authenticated
  using (user_id = auth.uid());

create policy "comment_reactions_select_public"
  on public.comment_reactions
  for select
  to authenticated
  using (true);

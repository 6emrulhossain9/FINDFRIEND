-- 0005_phase4_messaging_notifications.sql — Phase 4 schema
--
-- Scope:
--   * `public.conversations` — 1:1 chat threads between two accepted friends
--   * `public.messages` — chat messages within a conversation
--   * `public.notifications` — in-app notifications for messages and social events
--
-- This phase keeps the implementation intentionally small: 1:1 only, not
-- group chat yet. Realtime comes from Supabase Realtime subscriptions on the
-- `messages` table in the UI.

-- -----------------------------------------------------------------------
-- Conversations
-- -----------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a_id uuid not null references public.profiles(id) on delete cascade,
  participant_b_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_participants_order check (participant_a_id < participant_b_id),
  constraint conversations_unique_pair unique (participant_a_id, participant_b_id),
  constraint conversations_no_self check (participant_a_id <> participant_b_id)
);

create index conversations_participant_a_idx on public.conversations (participant_a_id);
create index conversations_participant_b_idx on public.conversations (participant_b_id);
create index conversations_last_message_at_idx on public.conversations (last_message_at desc);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;

create policy "conversations_select_participant"
  on public.conversations
  for select
  to authenticated
  using (participant_a_id = auth.uid() or participant_b_id = auth.uid());

create policy "conversations_insert_participant"
  on public.conversations
  for insert
  to authenticated
  with check (participant_a_id = auth.uid() or participant_b_id = auth.uid());

create policy "conversations_update_participant"
  on public.conversations
  for update
  to authenticated
  using (participant_a_id = auth.uid() or participant_b_id = auth.uid())
  with check (participant_a_id = auth.uid() or participant_b_id = auth.uid());

-- -----------------------------------------------------------------------
-- Messages
-- -----------------------------------------------------------------------

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id, created_at desc)
  where deleted_at is null;
create index messages_sender_id_idx on public.messages (sender_id)
  where deleted_at is null;

create trigger messages_set_updated_at
  before update on public.messages
  for each row execute function public.set_updated_at();

alter table public.messages enable row level security;

create policy "messages_select_participant"
  on public.messages
  for select
  to authenticated
  using (
    deleted_at is null and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (c.participant_a_id = auth.uid() or c.participant_b_id = auth.uid())
    )
  );

create policy "messages_insert_sender_participant"
  on public.messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid() and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (c.participant_a_id = auth.uid() or c.participant_b_id = auth.uid())
    )
  );

create policy "messages_update_sender"
  on public.messages
  for update
  to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

create policy "messages_delete_sender"
  on public.messages
  for delete
  to authenticated
  using (sender_id = auth.uid());

-- -----------------------------------------------------------------------
-- Notifications
-- -----------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('message', 'friend_request', 'friend_request_accepted')),
  entity_type text not null check (entity_type in ('conversation', 'message', 'friendship')),
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_recipient_id_idx on public.notifications (recipient_id, created_at desc)
  where read_at is null;
create index notifications_entity_idx on public.notifications (entity_type, entity_id);

create trigger notifications_set_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using (recipient_id = auth.uid());

create policy "notifications_insert_actor"
  on public.notifications
  for insert
  to authenticated
  with check (actor_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications
  for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "notifications_delete_own"
  on public.notifications
  for delete
  to authenticated
  using (recipient_id = auth.uid());

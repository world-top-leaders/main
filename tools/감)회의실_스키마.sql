-- World Top Leaders meeting room schema
-- 작성: 오호(클로드) 2026-09-22
create extension if not exists pgcrypto;
create table if not exists meeting_rooms (
  id text primary key,
  title text not null,
  created_at timestamptz default now()
);
insert into meeting_rooms (id, title) values ('default', 'World Top Leaders 상시 회의실') on conflict (id) do nothing;
create table if not exists meeting_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references meeting_rooms(id) default 'default',
  sender text not null check (sender in ('아주','그록','제미니','클로드')),
  role text not null default 'ai' check (role in ('human','ai')),
  content text not null,
  reply_to uuid references meeting_messages(id),
  created_at timestamptz default now()
);
create index if not exists meeting_messages_room_time_idx on meeting_messages (room_id, created_at);
alter table meeting_rooms enable row level security;
alter table meeting_messages enable row level security;
drop policy if exists "rooms_read" on meeting_rooms;
create policy "rooms_read" on meeting_rooms for select using (true);
drop policy if exists "messages_read" on meeting_messages;
create policy "messages_read" on meeting_messages for select using (true);
drop policy if exists "messages_insert" on meeting_messages;
create policy "messages_insert" on meeting_messages for insert with check (true);
alter publication supabase_realtime add table meeting_messages;

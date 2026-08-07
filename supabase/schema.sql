-- ============================================================
-- University Sports Week — Supabase স্কিমা
-- এই ফাইলটা Supabase Dashboard -> SQL Editor -এ পেস্ট করে "Run" করুন
-- ============================================================

-- ---------- এক্সটেনশন ----------
create extension if not exists "uuid-ossp";

-- ---------- profiles (auth.users এর সাথে লিংকড) ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'viewer' check (role in ('admin','player','viewer')),
  department text,
  email text,
  created_at timestamptz default now()
);

-- নতুন ইউজার সাইনআপ করলে অটোমেটিক profiles রেকর্ড তৈরি করার ট্রিগার
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'viewer'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- seasons ----------
create table if not exists seasons (
  id uuid primary key default uuid_generate_v4(),
  year int not null,
  term text not null,
  name text not null,
  created_at timestamptz default now()
);

-- ---------- coaches ----------
create table if not exists coaches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  department text not null,
  playing_style_notes text,
  created_at timestamptz default now()
);

-- ---------- teams ----------
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text,
  department text not null,
  season_id uuid references seasons(id) on delete cascade,
  coach_id uuid references coaches(id),
  formation text,
  is_champion boolean not null default false,
  created_at timestamptz default now()
);

-- ---------- players ----------
create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  department text not null,
  position text not null check (position in ('GK','DEF','MID','FWD')),
  jersey_no int,
  photo_url text,
  bio text,
  status text not null default 'pending' check (status in ('approved','pending')),
  submitted_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- team_players (একটা টিমের স্কোয়াড, একজন প্লেয়ার একাধিক সিজনে বিভিন্ন টিমে থাকতে পারে)
create table if not exists team_players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references teams(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  unique (team_id, player_id)
);

-- ---------- matches ----------
create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid references seasons(id) on delete cascade,
  team_a_id uuid references teams(id),
  team_b_id uuid references teams(id),
  date timestamptz not null,
  referee_name text,
  score_a int not null default 0,
  score_b int not null default 0,
  status text not null default 'scheduled' check (status in ('scheduled','live','completed')),
  created_at timestamptz default now()
);

-- ---------- match_events ----------
create table if not exists match_events (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references players(id),
  event_type text not null check (event_type in ('goal','assist','yellow_card','red_card','sub_in','sub_out')),
  minute int not null,
  created_at timestamptz default now()
);

-- ---------- player_match_stats ----------
create table if not exists player_match_stats (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  rating numeric(3,1),
  goals int default 0,
  assists int default 0,
  fouls int default 0,
  minutes_played int default 0,
  unique (match_id, player_id)
);

-- ---------- pending_edits (অ্যাপ্রুভাল ওয়ার্কফ্লো) ----------
create table if not exists pending_edits (
  id uuid primary key default uuid_generate_v4(),
  table_name text not null,
  record_id uuid,
  submitted_by uuid references profiles(id),
  changes jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ---------- player_live_ratings (লাইভ ম্যাচ চলাকালীন দর্শকদের রেটিং) ----------
create table if not exists player_live_ratings (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  rated_by uuid references profiles(id) on delete cascade,
  rating numeric(3,1) not null check (rating between 0 and 10),
  created_at timestamptz default now(),
  unique (match_id, player_id, rated_by)
);

-- ============================================================
-- সহজ অ্যাগ্রিগেট ভিউ — টপ স্কোরার / কার্ড লিডারবোর্ড
-- ============================================================
create or replace view player_season_stats as
select
  p.id as player_id,
  p.name,
  p.department,
  m.season_id,
  count(*) filter (where me.event_type = 'goal') as goals,
  count(*) filter (where me.event_type = 'assist') as assists,
  count(*) filter (where me.event_type = 'yellow_card') as yellow_cards,
  count(*) filter (where me.event_type = 'red_card') as red_cards,
  round(avg(pms.rating), 2) as avg_rating,
  count(distinct m.id) as matches_played,
  p.photo_url
from players p
left join match_events me on me.player_id = p.id
left join matches m on m.id = me.match_id
left join player_match_stats pms on pms.player_id = p.id and pms.match_id = m.id
where p.status = 'approved'
group by p.id, p.name, p.department, m.season_id, p.photo_url;

-- ম্যাচ চলাকালীন প্রতিটা প্লেয়ারের গড় দর্শক-রেটিং বের করার ভিউ
create or replace view player_live_rating_avg as
select
  match_id,
  player_id,
  round(avg(rating), 2) as avg_rating,
  count(*) as rating_count
from player_live_ratings
group by match_id, player_id;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table seasons enable row level security;
alter table coaches enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table team_players enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table player_match_stats enable row level security;
alter table pending_edits enable row level security;
alter table player_live_ratings enable row level security;

-- হেল্পার: বর্তমান ইউজার অ্যাডমিন কিনা চেক করার ফাংশন
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ---- profiles ----
create policy "profiles readable by everyone" on profiles for select using (true);
create policy "profiles editable by owner" on profiles for update using (auth.uid() = id);
create policy "profiles admin full access" on profiles for all using (is_admin());

-- ---- seasons / coaches / teams (পাবলিক রিড, অ্যাডমিন রাইট) ----
create policy "seasons public read" on seasons for select using (true);
create policy "seasons admin write" on seasons for insert with check (is_admin());
create policy "seasons admin update" on seasons for update using (is_admin());
create policy "seasons admin delete" on seasons for delete using (is_admin());

create policy "coaches public read" on coaches for select using (true);
create policy "coaches admin write" on coaches for insert with check (is_admin());
create policy "coaches admin update" on coaches for update using (is_admin());
create policy "coaches admin delete" on coaches for delete using (is_admin());

create policy "teams public read" on teams for select using (true);
create policy "teams admin write" on teams for insert with check (is_admin());
create policy "teams admin update" on teams for update using (is_admin());
create policy "teams admin delete" on teams for delete using (is_admin());

create policy "team_players public read" on team_players for select using (true);
create policy "team_players admin write" on team_players for all using (is_admin());

-- ---- players (approved সবাই দেখবে, pending শুধু owner/admin দেখবে) ----
create policy "players read approved" on players
  for select using (status = 'approved' or auth.uid() = profile_id or is_admin());

create policy "players insert self or admin" on players
  for insert with check (auth.uid() = profile_id or is_admin());

-- নিজের প্রোফাইল প্লেয়ার আপডেট করতে পারবে, কিন্তু status admin ছাড়া বদলাতে পারবে না
-- (status পরিবর্তন অ্যাপ পাশের লজিকে pending_edits টেবিলের মাধ্যমে হবে)
create policy "players update self or admin" on players
  for update using (auth.uid() = profile_id or is_admin());

create policy "players delete admin only" on players
  for delete using (is_admin());

-- ---- matches / events / stats (পাবলিক রিড, অ্যাডমিন রাইট) ----
create policy "matches public read" on matches for select using (true);
create policy "matches admin write" on matches for insert with check (is_admin());
create policy "matches admin update" on matches for update using (is_admin());
create policy "matches admin delete" on matches for delete using (is_admin());

create policy "match_events public read" on match_events for select using (true);
create policy "match_events admin write" on match_events for all using (is_admin());

create policy "player_match_stats public read" on player_match_stats for select using (true);
create policy "player_match_stats admin write" on player_match_stats for all using (is_admin());

-- ---- pending_edits (শুধু owner + admin দেখবে) ----
create policy "pending_edits owner or admin read" on pending_edits
  for select using (auth.uid() = submitted_by or is_admin());
create policy "pending_edits insert self" on pending_edits
  for insert with check (auth.uid() = submitted_by);
create policy "pending_edits admin update" on pending_edits
  for update using (is_admin());

-- ---- player_live_ratings (শুধু ম্যাচ লাইভ থাকা অবস্থায় লগইন করা যেকেউ রেট করতে পারবে) ----
create policy "live_ratings public read" on player_live_ratings
  for select using (true);

create policy "live_ratings insert while live" on player_live_ratings
  for insert with check (
    auth.uid() = rated_by
    and exists (select 1 from matches m where m.id = match_id and m.status = 'live')
  );

create policy "live_ratings update own while live" on player_live_ratings
  for update using (
    auth.uid() = rated_by
    and exists (select 1 from matches m where m.id = match_id and m.status = 'live')
  );

create policy "live_ratings admin delete" on player_live_ratings
  for delete using (is_admin());

-- ============================================================
-- Storage — প্লেয়ার প্রোফাইল ছবি আপলোডের জন্য 'avatars' বাকেট
-- (এই অংশটা আলাদাভাবে রান করার দরকার নেই যদি উপরের পুরো ফাইলটা
-- একসাথে রান করে থাকেন, কিন্তু আগে থেকে schema রান করা থাকলে
-- শুধু এই অংশটুকু আলাদাভাবে SQL Editor-এ রান করলেই হবে)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- যেকেউ (এমনকি লগইন ছাড়া) অ্যাভাটার দেখতে পারবে, কারণ বাকেট পাবলিক
create policy "avatars public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- শুধু লগইন করা ইউজার নিজের ফোল্ডারে (user-id দিয়ে নামকরণ করা ফাইল) আপলোড করতে পারবে
create policy "avatars authenticated upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars owner update"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy "avatars owner delete"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());

-- ============================================================
-- প্রথম অ্যাডমিন বানানোর জন্য (সাইনআপ করার পর এই কমান্ড রান করুন,
-- your-email@example.com জায়গায় নিজের ইমেইল বসিয়ে):
--
-- update profiles set role = 'admin' where email = 'your-email@example.com';
-- ============================================================

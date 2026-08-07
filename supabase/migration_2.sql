-- ============================================================
-- মাইগ্রেশন #2 — আগে থেকে schema.sql রান করা থাকলে শুধু এই ফাইলটা
-- Supabase SQL Editor-এ কপি-পেস্ট করে রান করুন। পুরনো schema.sql
-- আবার রান করার দরকার নেই।
--
-- এই মাইগ্রেশনে যা যা যোগ হচ্ছে:
--  ১. teams টেবিলে is_champion কলাম (চ্যাম্পিয়ন পেজের জন্য)
--  ২. player_season_stats ভিউতে photo_url (লিডারবোর্ডে ছবি দেখানোর জন্য)
--  ৩. player_live_ratings টেবিল (লাইভ ম্যাচে দর্শক রেটিং)
--  ৪. player_live_rating_avg ভিউ (গড় দর্শক রেটিং বের করার জন্য)
-- ============================================================

-- ১. চ্যাম্পিয়ন ফ্ল্যাগ
alter table teams add column if not exists is_champion boolean not null default false;

-- ২. লিডারবোর্ডে ছবি দেখানোর জন্য ভিউ আপডেট
create or replace view player_season_stats as
select
  p.id as player_id,
  p.name,
  p.department,
  p.photo_url,
  m.season_id,
  count(*) filter (where me.event_type = 'goal') as goals,
  count(*) filter (where me.event_type = 'assist') as assists,
  count(*) filter (where me.event_type = 'yellow_card') as yellow_cards,
  count(*) filter (where me.event_type = 'red_card') as red_cards,
  round(avg(pms.rating), 2) as avg_rating,
  count(distinct m.id) as matches_played
from players p
left join match_events me on me.player_id = p.id
left join matches m on m.id = me.match_id
left join player_match_stats pms on pms.player_id = p.id and pms.match_id = m.id
where p.status = 'approved'
group by p.id, p.name, p.department, p.photo_url, m.season_id;

-- ৩. লাইভ ম্যাচে দর্শক-রেটিং টেবিল
create table if not exists player_live_ratings (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references matches(id) on delete cascade,
  player_id uuid references players(id) on delete cascade,
  rated_by uuid references profiles(id) on delete cascade,
  rating numeric(3,1) not null check (rating between 0 and 10),
  created_at timestamptz default now(),
  unique (match_id, player_id, rated_by)
);

alter table player_live_ratings enable row level security;

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

-- ৪. গড় দর্শক-রেটিং বের করার ভিউ
create or replace view player_live_rating_avg as
select
  match_id,
  player_id,
  round(avg(rating), 2) as avg_rating,
  count(*) as rating_count
from player_live_ratings
group by match_id, player_id;

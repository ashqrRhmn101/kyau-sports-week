-- ============================================================
-- মাইগ্রেশন #2 — আগে থেকে schema.sql রান করা থাকলে শুধু এই ফাইলটা
-- Supabase SQL Editor-এ কপি-পেস্ট করে রান করুন। পুরনো schema.sql
-- আবার রান করার দরকার নেই।
--
-- ⚠️ আগেরবার এই মাইগ্রেশনে ভিউ কলামের অর্ডার সংক্রান্ত একটা এরর হয়েছিল
-- (42P16)। PostgreSQL-এ একটা মাল্টি-স্টেটমেন্ট SQL ব্লক একসাথে একটা
-- transaction হিসেবে চলে — মাঝপথে এরর হলে আগের সব স্টেটমেন্টও রোলব্যাক
-- হয়ে যায়। তাই আগের রান থেকে এখানকার কোনো পরিবর্তনই আসলে সেভ হয়নি।
-- এই ফাইলটা এখন ঠিক করা — সম্পূর্ণটা আবার নতুন করে রান করুন, নিরাপদ।
--
-- এই মাইগ্রেশনে যা যা যোগ হচ্ছে:
--  ১. teams টেবিলে is_champion কলাম (চ্যাম্পিয়ন পেজের জন্য)
--  ২. player_season_stats ভিউতে photo_url (লিডারবোর্ডে ছবি দেখানোর জন্য)
--  ৩. player_live_ratings টেবিল (লাইভ ম্যাচে দর্শক রেটিং)
--  ৪. player_live_rating_avg ভিউ (গড় দর্শক রেটিং বের করার জন্য)
--  ৫. teams টেবিলে name কলাম (একই ডিপার্টমেন্টের একাধিক টিম আলাদা নামে
--     চেনার জন্য, যেমন department: "CSE", name: "CSE Thunder")
-- ============================================================

-- ১. চ্যাম্পিয়ন ফ্ল্যাগ
alter table teams add column if not exists is_champion boolean not null default false;

-- ৫. টিমের নিজস্ব নাম (ডিপার্টমেন্ট থেকে আলাদা)
alter table teams add column if not exists name text;

-- ২. লিডারবোর্ডে ছবি দেখানোর জন্য ভিউ আপডেট
-- (নোট: PostgreSQL-এ CREATE OR REPLACE VIEW দিয়ে মাঝখানে কলাম বসানো/নাম বদলানো যায় না,
--  নতুন কলাম শুধু একদম শেষে যোগ করতে হয় — তাই photo_url এখানে লিস্টের শেষে রাখা হয়েছে)
-- (নোট: PostgreSQL-এ CREATE OR REPLACE VIEW দিয়ে মাঝখানে কলাম বসানো/নাম বদলানো যায় না,
--  নতুন কলাম শুধু একদম শেষে যোগ করতে হয় — তাই photo_url এখানে লিস্টের শেষে রাখা হয়েছে)
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

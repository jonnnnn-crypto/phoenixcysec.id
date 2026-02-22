-- Enable Realtime for all core tables (Simplified Version)

-- 1. Identity FULL for deep sync
alter table whitehat_reports replica identity full;
alter table users replica identity full;
alter table profiles replica identity full;

-- 2. Fresh start for Publication (Avoids syntax errors with IF NOT EXISTS)
drop publication if exists supabase_realtime;
create publication supabase_realtime for table whitehat_reports, users, profiles;

-- 3. Open RLS for Public Viewers (Necessary for sync to work)
alter table profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);

alter table users enable row level security;
drop policy if exists "Public user info viewable by everyone" on users;
create policy "Public user info viewable by everyone" on users for select using (true);

alter table whitehat_reports enable row level security;
drop policy if exists "Approved reports are viewable by everyone." on whitehat_reports;
create policy "Approved reports are viewable by everyone." on whitehat_reports for select using (status = 'approved');

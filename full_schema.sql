-- ==============================================================================
-- PHOENIXCYSEC FULL SCHEMA & RLS SETUP
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- USERS
create table if not exists users (
 id uuid primary key references auth.users(id) on delete cascade,
 email text unique not null,
 username text unique not null,
 role text default 'member',
 created_at timestamp default now()
);

-- PROFILES
create table if not exists profiles (
 user_id uuid references users(id) on delete cascade,
 avatar text,
 bio text,
 skills text[],
 primary key(user_id)
);

-- WHITEHAT REPORTS
create table if not exists whitehat_reports (
 id uuid primary key default uuid_generate_v4(),
 user_id uuid references users(id),
 target text,
 vulnerability text,
 severity text,
 report_year int,
 reference_link text,
 description text,
 status text default 'pending',
 points integer default 0,
 created_at timestamp default now()
);

-- PARTNERS
create table if not exists partners (
 id uuid primary key default uuid_generate_v4(),
 name text,
 logo text,
 category text,
 description text,
 website text,
 is_active boolean default true
);

-- DOCUMENTATION
create table if not exists documentation (
 id uuid primary key default uuid_generate_v4(),
 title text,
 slug text unique,
 content text,
 category text,
 status text default 'draft',
 created_by uuid references users(id),
 created_at timestamp default now(),
 updated_at timestamp
);

-- ==========================================
-- 3. FUNCTIONS & TRIGGERS
-- ==========================================

-- AUTO POINT FUNCTION
create or replace function calculate_report_points()
returns trigger as $$
begin
 if NEW.status='approved' then
   NEW.points := 
     case NEW.severity
       when 'low' then 50
       when 'medium' then 100
       when 'high' then 200
       when 'critical' then 400
       else 0
     end;
 end if;
 return NEW;
end;
$$ language plpgsql;

-- POINT TRIGGER
drop trigger if exists trigger_points on whitehat_reports;
create trigger trigger_points
before update on whitehat_reports
for each row
execute function calculate_report_points();

-- ==========================================
-- 4. VIEWS
-- ==========================================

-- BUG HUNTER LEADERBOARD VIEW
drop view if exists bughunter_leaderboard;
create view bughunter_leaderboard with (security_invoker = on) as
select 
u.username,
count(w.id) as total_reports,
coalesce(sum(w.points),0) as total_points,
case
 when sum(w.points)>=5000 then 'Ascended Phoenix'
 when sum(w.points)>=2000 then 'Inferno Hunter'
 when sum(w.points)>=800 then 'Phoenix Hunter'
 when sum(w.points)>=300 then 'Flame Hunter'
 else 'Ember Hunter'
end as rank
from users u
left join whitehat_reports w 
on u.id=w.user_id and w.status='approved'
group by u.username
order by total_points desc;

-- ==========================================
-- 5. ADMIN PROMOTION
-- ==========================================
-- Jadikan user dengan ID ini sebagai Super Admin
UPDATE users SET role = 'admin' WHERE id = '79d56ea8-9318-4459-9bde-4f48779e4509';

-- Fungsi pembantu untuk RLS Cek Admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- Sinkronisasi Fallback SuperAdmin (Sesuai Frontend)
  IF auth.uid() = '79d56ea8-9318-4459-9bde-4f48779e4509'::uuid THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitehat_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if running multiple times
DROP POLICY IF EXISTS "Public read users" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Public read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public read partners" ON partners;
DROP POLICY IF EXISTS "Public read docs" ON documentation;
DROP POLICY IF EXISTS "Users read own reports" ON whitehat_reports;
DROP POLICY IF EXISTS "Admin manage partners" ON partners;
DROP POLICY IF EXISTS "Admin manage docs" ON documentation;
DROP POLICY IF EXISTS "Admin manage reports" ON whitehat_reports;
DROP POLICY IF EXISTS "Members insert reports" ON whitehat_reports;

-- Baca Publik
CREATE POLICY "Public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Public read docs" ON documentation FOR SELECT USING (true);
CREATE POLICY "Users read own reports" ON whitehat_reports FOR SELECT USING (auth.uid() = user_id OR status = 'approved');

-- Update Sendiri (Opsional untuk masa depan)
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Kontrol Penuh Admin
CREATE POLICY "Admin manage partners" ON partners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin manage docs" ON documentation FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin manage reports" ON whitehat_reports FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Insert Laporan (Member)
CREATE POLICY "Members insert reports" ON whitehat_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

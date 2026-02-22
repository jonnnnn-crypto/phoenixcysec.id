-- ==============================================================================
-- PHOENIXCYSEC DATABASE MIGRATION
-- Menambahkan kolom-kolom baru yang hilang di tabel profiles & whitehat_reports
-- ==============================================================================

-- 1. Update Tabel Profiles
-- Menambahkan kolom sosial media dan website
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamp;

-- 2. Update Tabel Whitehat Reports
-- Menambahkan kolom target_type untuk membedakan jenis sasaran
ALTER TABLE public.whitehat_reports
ADD COLUMN IF NOT EXISTS target_type text;

-- 3. Reload Schema Cache Supabase (Penting!)
-- Supabase REST API menggunakan schema cache. Kadang perubahan kolom via SQL 
-- tidak langsung terdeteksi. Perintah ini memaksa Supabase me-refresh cachenya.
NOTIFY pgrst, 'reload schema';

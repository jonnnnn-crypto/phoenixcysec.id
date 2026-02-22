-- ==========================================
-- ADD SOCIAL FIELDS TO PROFILES
-- ==========================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Ensure RLS allows public reading of these new fields (if not already handled by "Public read profiles")
-- Current policy: CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
-- So no additional RLS action is strictly required unless we want to refine it.

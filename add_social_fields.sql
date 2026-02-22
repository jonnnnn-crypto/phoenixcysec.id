-- ==========================================
-- ADD SOCIAL FIELDS & AVATAR TO PROFILES
-- ==========================================

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- NOTE: For the avatar field, if it's empty in the UI, we will use 
-- a random profile picture API like https://i.pravatar.cc/

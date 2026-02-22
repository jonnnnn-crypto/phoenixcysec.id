-- ==============================================================================
-- FIX FOREIGN KEY CONSTRAINT & AUTH SYNC
-- ==============================================================================

-- 1. Create a function that runs automatically when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert the public user record using username from auth metadata
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)), 
    'member'
  );
  
  -- Automatically generate the public profile record
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Database Trigger on Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill Fix: Recover any existing corrupted accounts 
-- that managed to sign up but failed to populate the public tables
INSERT INTO public.users (id, email, username, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)), 'member'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

INSERT INTO public.profiles (user_id)
SELECT id
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);

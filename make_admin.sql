-- 1. Updates a specific user to Role 'admin'
UPDATE users SET role = 'admin' WHERE id = '79d56ea8-9318-4459-9bde-4f48779e4509';

-- 2. Ensure RLS policies are in place to allow Admins to manage partners, documentation, and events.
-- We'll assume the tables `partners`, `documentation`, and (if exists) `events` have RLS enabled, and create generic policies.

-- Set up proper roles check function
CREATE OR REPLACE FUNCTION auth.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on core tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitehat_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read data
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Public read docs" ON documentation FOR SELECT USING (true);
CREATE POLICY "Users read own reports" ON whitehat_reports FOR SELECT USING (auth.uid() = user_id OR status = 'approved');

-- Admin Management Policies (ALL Privileges for Admins)
CREATE POLICY "Admin manage partners" ON partners FOR ALL USING (auth.is_admin());
CREATE POLICY "Admin manage docs" ON documentation FOR ALL USING (auth.is_admin());
CREATE POLICY "Admin manage reports" ON whitehat_reports FOR ALL USING (auth.is_admin());

-- Allow authenticating members to insert reports (Members policy)
CREATE POLICY "Members insert reports" ON whitehat_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

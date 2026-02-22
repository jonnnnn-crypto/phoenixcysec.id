-- ==============================================================================
-- EVENTS MANAGEMENT SCHEMA
-- ==============================================================================

-- 1. Create the `events` table
CREATE TABLE IF NOT EXISTS public.events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    description text,
    event_date timestamp with time zone,
    location text,
    image_url text,
    registration_link text,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    created_by uuid REFERENCES public.users(id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies
-- Public can read all active events
DROP POLICY IF EXISTS "Public read events" ON public.events;
CREATE POLICY "Public read events" ON public.events 
    FOR SELECT USING (is_active = true);

-- Admin can manage all events
DROP POLICY IF EXISTS "Admin manage events" ON public.events;
CREATE POLICY "Admin manage events" ON public.events 
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

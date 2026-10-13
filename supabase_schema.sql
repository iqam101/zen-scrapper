-- ==============================================================================
-- Zen Scrapper - Supabase Database Schema & Team Access Control
-- Agency: Zenthoz Digital Marketing (www.zenthoz.com)
-- Author: Iqam Ifthikar
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to create tables for real-time live lead sync between Chrome Extension & Vercel,
-- and set up Team Authentication + Role-Based Access (Admin vs Staff).

-- 1. Create Sessions Table (Separated Search Campaigns)
CREATE TABLE IF NOT EXISTS public.sessions (
    id TEXT PRIMARY KEY,
    search_term TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    leads_count INTEGER DEFAULT 0,
    faults_count INTEGER DEFAULT 0
);

-- 2. Create Leads Table (All 14 lead attributes + Deep Search Audit)
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES public.sessions(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    owner_contact TEXT DEFAULT 'N/A',
    email TEXT DEFAULT 'N/A',
    phone TEXT DEFAULT 'N/A',
    address TEXT DEFAULT 'N/A',
    website TEXT DEFAULT 'N/A',
    category TEXT DEFAULT 'Local Service',
    rating TEXT DEFAULT 'N/A',
    reviews_count INTEGER DEFAULT 0,
    website_faults JSONB DEFAULT '[]'::jsonb,
    website_fault_summary TEXT DEFAULT '',
    last_fb_post TEXT DEFAULT 'Pending Check',
    fb_link TEXT DEFAULT 'N/A',
    last_ig_post TEXT DEFAULT 'Pending Check',
    ig_link TEXT DEFAULT 'N/A',
    linkedin_url TEXT DEFAULT 'N/A',
    other_issues TEXT DEFAULT '',
    audit_notes JSONB DEFAULT '[]'::jsonb,
    pitch_angle TEXT DEFAULT '',
    research_audit JSONB DEFAULT '{}'::jsonb,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Team Members Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
    name TEXT DEFAULT '',
    created_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Indexes for High Performance Filtering by Niche, Status, and Session
CREATE INDEX IF NOT EXISTS idx_leads_session_id ON public.leads(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_website ON public.leads(website);
CREATE INDEX IF NOT EXISTS idx_leads_scraped_at ON public.leads(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 6. Create Permissive Policies for Zen Scrapper Extension & Web Dashboard
DROP POLICY IF EXISTS "Allow all on sessions" ON public.sessions;
CREATE POLICY "Allow all on sessions" ON public.sessions
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on leads" ON public.leads;
CREATE POLICY "Allow all on leads" ON public.leads
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on team_members" ON public.team_members;
CREATE POLICY "Allow all on team_members" ON public.team_members
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 7. Auto-Confirm Email Trigger
-- Ensures team members and admins created in the system never get blocked by "Email not confirmed"
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  NEW.confirmed_at := COALESCE(NEW.confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_confirm_user ON auth.users;
CREATE TRIGGER trigger_auto_confirm_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_confirm_user();

-- Auto-confirm any existing users (such as zenthoztechnologies@gmail.com)
UPDATE auth.users
SET email_confirmed_at = NOW(), confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Automatically register zenthoztechnologies@gmail.com as Admin in team_members
INSERT INTO public.team_members (id, email, role, name, created_by)
SELECT id::text, email, 'admin', 'Iqam Ifthikar (Admin)', 'system'
FROM auth.users
WHERE email = 'zenthoztechnologies@gmail.com'
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- If user does not exist in auth.users yet, insert placeholder admin
INSERT INTO public.team_members (id, email, role, name, created_by)
VALUES ('admin_zenthoz_primary', 'zenthoztechnologies@gmail.com', 'admin', 'Iqam Ifthikar (Admin)', 'system')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 8. Enable Realtime Replication for Live Changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

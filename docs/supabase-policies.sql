-- SQL to create hackathons table and RLS policies for Supabase

-- ============================================================================
-- HACKATHONS TABLE (UPDATED WITH PARTICIPATION TYPE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  location text,
  prize text,
  image_url text,
  participation_type text NOT NULL DEFAULT 'Individual', -- 'Individual' or 'Team'
  max_team_size integer DEFAULT 1, -- 1 for individual, 2-5 for team participation
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS enabled
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

-- Public can SELECT
CREATE POLICY IF NOT EXISTS "Public can select hackathons"
ON public.hackathons
FOR SELECT
USING (true);

-- Users can INSERT only when created_by = auth.uid()
CREATE POLICY IF NOT EXISTS "Users can insert their own hackathon"
ON public.hackathons
FOR INSERT
TO public
WITH CHECK (auth.uid() = created_by);

-- Users can UPDATE their own hackathon
CREATE POLICY IF NOT EXISTS "Users can update own hackathon"
ON public.hackathons
FOR UPDATE
TO public
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can DELETE their own hackathon
CREATE POLICY IF NOT EXISTS "Users can delete own hackathon"
ON public.hackathons
FOR DELETE
TO public
USING (auth.uid() = created_by);

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure RLS enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Users can SELECT teams they created
-- (team membership-based listing is handled via team_members queries)
CREATE POLICY IF NOT EXISTS "Users can view own teams"
ON public.teams
FOR SELECT
USING (
  auth.uid() = created_by
);

-- Users can INSERT (create) teams
CREATE POLICY IF NOT EXISTS "Authenticated users can create teams"
ON public.teams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can UPDATE their own teams
CREATE POLICY IF NOT EXISTS "Users can update own team"
ON public.teams
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can DELETE their own teams
CREATE POLICY IF NOT EXISTS "Users can delete own team"
ON public.teams
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- ============================================================================
-- TEAM_MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Ensure RLS enabled
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Users can SELECT members of teams they belong to or created
CREATE POLICY IF NOT EXISTS "Users can view team members"
ON public.team_members
FOR SELECT
USING (
  auth.uid() = user_id
  OR auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
  )
);

-- Team creator or admin can INSERT members (invite)
CREATE POLICY IF NOT EXISTS "Team creator can add members"
ON public.team_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
  )
);

-- Users can DELETE themselves from team, or creator can remove members
CREATE POLICY IF NOT EXISTS "Users can remove themselves from team"
ON public.team_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
  )
);

-- ============================================================================
-- HACKATHON_REGISTRATIONS TABLE (User and Team Participation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id uuid,  -- NULL if team registration
  team_id uuid,  -- NULL if individual registration
  registered_at timestamptz DEFAULT now(),
  -- Ensure either user_id or team_id is set, not both
  CONSTRAINT user_or_team_check CHECK (
    (user_id IS NOT NULL AND team_id IS NULL)
    OR (user_id IS NULL AND team_id IS NOT NULL)
  ),
  -- Prevent duplicate registrations
  UNIQUE(hackathon_id, user_id),
  UNIQUE(hackathon_id, team_id)
);

-- Ensure RLS enabled
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- Public can SELECT registrations (view who registered)
CREATE POLICY IF NOT EXISTS "Public can view hackathon registrations"
ON public.hackathon_registrations
FOR SELECT
USING (true);

-- Authenticated users can INSERT their own registration or their team's registration
CREATE POLICY IF NOT EXISTS "Users can register themselves or their team"
ON public.hackathon_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  -- User registering themselves
  (user_id = auth.uid() AND team_id IS NULL)
  -- Or user registering their own team
  OR (team_id IS NOT NULL AND user_id IS NULL AND auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
  ))
);

-- Users can DELETE their own registration or their team's registration
CREATE POLICY IF NOT EXISTS "Users can unregister themselves or team"
ON public.hackathon_registrations
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR auth.uid() IN (
    SELECT created_by FROM public.teams WHERE id = team_id
  )
);

-- Create `team_invitations` table used by ManageTeams UI
-- Run this in your Supabase SQL editor (or psql) to create the table and basic RLS

CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending', -- pending / accepted / declined
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create a simple index for lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON public.team_invitations (team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations (email);

-- Optional: enable Row Level Security and a basic policy that allows authenticated users
-- to insert an invitation and creators to select their team's invites. Adjust as needed.

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert invitations (they must provide invited_by = auth.uid())
CREATE POLICY "invites_insert_authenticated" ON public.team_invitations
  FOR INSERT USING (auth.role() IS NOT NULL)
  WITH CHECK (auth.role() IS NOT NULL AND (invited_by = auth.uid() OR invited_by IS NULL));

-- Allow team creators to select invites for their team
CREATE POLICY "invites_select_team_creator" ON public.team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t WHERE t.id = team_invitations.team_id AND t.created_by = auth.uid()
    )
  );

-- Allow a recipient to select their invites by email (note: auth.uid() may be null for email-only users)
CREATE POLICY "invites_select_recipient" ON public.team_invitations
  FOR SELECT USING (email = current_setting('request.jwt.claims.email', true));

-- Allow updating status by recipient or creator
CREATE POLICY "invites_update_status" ON public.team_invitations
  FOR UPDATE USING (
    (email = current_setting('request.jwt.claims.email', true))
    OR (EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_invitations.team_id AND t.created_by = auth.uid()))
  ) WITH CHECK (status IN ('pending','accepted','declined'));

-- Note: these policies are a starting point; test them in your Supabase instance and adapt to your auth claims / schema.


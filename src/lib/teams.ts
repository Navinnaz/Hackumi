import { supabase } from "@/supabaseClient";

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at?: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at?: string;
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

/**
 * Fetch all teams for the current user (created or member of)
 */
export const fetchUserTeams = async (userId: string): Promise<Team[]> => {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        description,
        created_by,
        created_at,
        team_members (
          id,
          team_id,
          user_id,
          joined_at,
          user:user_id (
            id,
            full_name,
            avatar_url
          )
        )
      `
      )
      .or(`created_by.eq.${userId},team_members.user_id.eq.${userId}`);

    if (error) throw error;

    return (
      (data as any[])?.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        created_by: t.created_by,
        created_at: t.created_at,
        members: t.team_members || [],
      })) ?? []
    );
  } catch (err) {
    console.error("Error fetching user teams:", err);
    throw err;
  }
};

/**
 * Fetch a specific team by ID with members
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        description,
        created_by,
        created_at,
        team_members (
          id,
          team_id,
          user_id,
          joined_at
        )
      `
      )
      .eq("id", teamId)
      .limit(1);

    if (error) throw error;

    const team = (data as any[])?.[0];
    if (!team) return null;

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      created_by: team.created_by,
      created_at: team.created_at,
      members: team.team_members || [],
    };
  } catch (err) {
    console.error("Error fetching team:", err);
    throw err;
  }
};

/**
 * Create a new team
 */
export const createTeam = async (
  name: string,
  description: string | undefined,
  createdBy: string
): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from("teams")
      .insert([{ name, description, created_by: createdBy }])
      .select();

    if (error) throw error;

    const team = (data as any[])?.[0];
    if (!team) return null;

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      created_by: team.created_by,
      created_at: team.created_at,
      members: [],
    };
  } catch (err) {
    console.error("Error creating team:", err);
    throw err;
  }
};

/**
 * Update a team
 */
export const updateTeam = async (
  teamId: string,
  updates: { name?: string; description?: string }
): Promise<Team | null> => {
  try {
    const { data, error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", teamId)
      .select();

    if (error) throw error;

    const team = (data as any[])?.[0];
    if (!team) return null;

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      created_by: team.created_by,
      created_at: team.created_at,
      members: [],
    };
  } catch (err) {
    console.error("Error updating team:", err);
    throw err;
  }
};

/**
 * Delete a team
 */
export const deleteTeam = async (teamId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error deleting team:", err);
    throw err;
  }
};

/**
 * Add a member to a team (invite)
 * The user must be the team creator to add members
 */
export const addTeamMember = async (
  teamId: string,
  userId: string
): Promise<TeamMember | null> => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .insert([{ team_id: teamId, user_id: userId }])
      .select();

    if (error) {
      if ((error as any)?.code === "23505") {
        throw new Error("User is already a member of this team");
      }
      throw error;
    }

    const member = (data as any[])?.[0];
    return member || null;
  } catch (err) {
    console.error("Error adding team member:", err);
    throw err;
  }
};

/**
 * Remove a member from a team
 */
export const removeTeamMember = async (
  teamId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error removing team member:", err);
    throw err;
  }
};

/**
 * Get all members of a team
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("id, team_id, user_id, joined_at")
      .eq("team_id", teamId);

    if (error) throw error;

    return (data as TeamMember[] | null) ?? [];
  } catch (err) {
    console.error("Error fetching team members:", err);
    throw err;
  }
};

/**
 * Check if a user is a member of a team
 */
export const isTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .limit(1);

    if (error) throw error;

    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error("Error checking team membership:", err);
    throw err;
  }
};

/**
 * Get user's created teams only (not member of)
 */
export const fetchCreatedTeams = async (userId: string): Promise<Team[]> => {
  try {
    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        description,
        created_by,
        created_at,
        team_members (
          id,
          team_id,
          user_id,
          joined_at
        )
      `
      )
      .eq("created_by", userId);

    if (error) throw error;

    return (
      (data as any[])?.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        created_by: t.created_by,
        created_at: t.created_at,
        members: t.team_members || [],
      })) ?? []
    );
  } catch (err) {
    console.error("Error fetching created teams:", err);
    throw err;
  }
};

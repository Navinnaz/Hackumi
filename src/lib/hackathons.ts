import { supabase } from "@/supabaseClient";

export interface Hackathon {
  id?: string;
  title: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  location?: string;
  prize?: string;
  image_url?: string;
  participation_type?: "Individual" | "Team"; // 'Individual' or 'Team'
  max_team_size?: number; // 1 for individual, 2-5 for team
  created_by?: string;
  created_at?: string;
}

export interface Registration {
  id?: string;
  hackathon_id: string;
  user_id?: string | null;
  team_id?: string | null;
  registered_at?: string;
}

export const fetchHackathons = async (): Promise<Hackathon[]> => {
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) throw error;
  return (data as Hackathon[] | null) ?? [];
};

export const createHackathon = async (payload: Hackathon) => {
  const { data, error } = await supabase
    .from("hackathons")
    .insert([payload])
    .select();

  if (error) throw error;
  return (data && (data as Hackathon[])[0]) ?? null;
};

export const fetchRecentHackathons = async (limit = 6): Promise<Hackathon[]> => {
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Hackathon[] | null) ?? [];
};

export const fetchHackathonsByUser = async (userId: string): Promise<Hackathon[]> => {
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Hackathon[] | null) ?? [];
};

export const getHackathonById = async (id: string): Promise<Hackathon | null> => {
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if ((error as any)?.code === "PGRST116") return null;
    throw error;
  }
  return (data as Hackathon) ?? null;
};

export const updateHackathon = async (payload: Hackathon) => {
  if (!payload.id) throw new Error("Missing id for update");
  const { data, error } = await supabase
    .from("hackathons")
    .update(payload)
    .eq("id", payload.id)
    .select();

  if (error) throw error;
  return (data && (data as Hackathon[])[0]) ?? null;
};

export const deleteHackathon = async (id: string) => {
  const { error } = await supabase.from("hackathons").delete().eq("id", id);
  if (error) throw error;
  return true;
};

// ============================================================================
// REGISTRATION HELPERS
// ============================================================================

/**
 * Register a user for an individual hackathon
 */
export const registerUserForHackathon = async (
  hackathonId: string,
  userId: string
): Promise<Registration | null> => {
  const { data, error } = await supabase
    .from("hackathon_registrations")
    .insert([{ hackathon_id: hackathonId, user_id: userId, team_id: null }])
    .select();

  if (error) {
    if ((error as any)?.code === "23505") {
      throw new Error("Already registered for this hackathon");
    }
    throw error;
  }
  return (data && (data as Registration[])[0]) ?? null;
};

/**
 * Register a team for a team-based hackathon
 */
export const registerTeamForHackathon = async (
  hackathonId: string,
  teamId: string
): Promise<Registration | null> => {
  // validate hackathon exists and is team-based
  const { data: hackathon, error: hErr } = await supabase
    .from("hackathons")
    .select("id, participation_type, max_team_size")
    .eq("id", hackathonId)
    .single();

  if (hErr) throw hErr;
  if (!hackathon) throw new Error("Hackathon not found");
  if (hackathon.participation_type !== "Team") throw new Error("This hackathon is not team-based");

  // count team members
  const { data: membersData, error: mErr, count } = await supabase
    .from("team_members")
    .select("user_id", { count: "exact" })
    .eq("team_id", teamId);

  if (mErr) throw mErr;
  const memberCount = (count ?? (membersData ?? []).length) as number;

  // enforce minimum team size of 2 and maximum from hackathon
  if (memberCount < 2) throw new Error("Team must have at least 2 members to register");
  if (hackathon.max_team_size && memberCount > hackathon.max_team_size) {
    throw new Error(`Team size (${memberCount}) exceeds hackathon max (${hackathon.max_team_size})`);
  }

  const { data, error } = await supabase
    .from("hackathon_registrations")
    .insert([{ hackathon_id: hackathonId, user_id: null, team_id: teamId }])
    .select();

  if (error) {
    if ((error as any)?.code === "23505") {
      throw new Error("This team is already registered for this hackathon");
    }
    throw error;
  }
  return (data && (data as Registration[])[0]) ?? null;
};

/**
 * Check if a user is already registered for a hackathon
 */
export const isUserRegistered = async (
  hackathonId: string,
  userId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("hackathon_registrations")
    .select("id")
    .eq("hackathon_id", hackathonId)
    .eq("user_id", userId)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
};

/**
 * Check if a team is already registered for a hackathon
 */
export const isTeamRegistered = async (
  hackathonId: string,
  teamId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("hackathon_registrations")
    .select("id")
    .eq("hackathon_id", hackathonId)
    .eq("team_id", teamId)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
};

/**
 * Get all users registered for a hackathon
 */
export const getHackathonRegistrations = async (
  hackathonId: string
): Promise<Registration[]> => {
  const { data, error } = await supabase
    .from("hackathon_registrations")
    .select("*")
    .eq("hackathon_id", hackathonId);

  if (error) throw error;
  return (data as Registration[] | null) ?? [];
};

/**
 * Unregister a user from a hackathon
 */
export const unregisterUserFromHackathon = async (
  hackathonId: string,
  userId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("hackathon_registrations")
    .delete()
    .eq("hackathon_id", hackathonId)
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};

/**
 * Unregister a team from a hackathon
 */
export const unregisterTeamFromHackathon = async (
  hackathonId: string,
  teamId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("hackathon_registrations")
    .delete()
    .eq("hackathon_id", hackathonId)
    .eq("team_id", teamId);

  if (error) throw error;
  return true;
};

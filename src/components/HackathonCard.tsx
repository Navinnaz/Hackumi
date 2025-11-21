import React, { useState, useEffect } from "react";
import type { Hackathon } from "@/lib/hackathons";
import { useAuth } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { isUserRegistered, isTeamRegistered, registerUserForHackathon, registerTeamForHackathon, unregisterUserFromHackathon, unregisterTeamFromHackathon } from "@/lib/hackathons";
import { fetchCreatedTeams } from "@/lib/teams";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";


interface Props {
  hackathon: Hackathon;
  onRegistrationChange?: () => void; // Callback to refresh parent state
}

export default function HackathonCard({ hackathon, onRegistrationChange }: Props) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState<string | null>(null); // Track which team is registered
  const [registering, setRegistering] = useState(false);
  const [userTeams, setUserTeams] = useState<{ id: string; name: string }[]>([]);
  const [showTeamSelection, setShowTeamSelection] = useState(false);

  // Check registration status on mount/hackathon change
  useEffect(() => {
    if (!user || !hackathon.id) {
      setIsRegistered(false);
      setRegisteredTeamId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // Check individual user registration
        const userReg = await isUserRegistered(hackathon.id!, user.id);
        if (cancelled) return;
        
        if (userReg) {
          setIsRegistered(true);
          setRegisteredTeamId(null);
          return;
        }
        
        // If not individually registered, check if any of user's teams are registered
        if (hackathon.participation_type === "Team") {
          const teams = await fetchCreatedTeams(user.id);
          for (const team of teams) {
            const registered = await isTeamRegistered(hackathon.id!, team.id);
            if (registered) {
              setIsRegistered(true);
              setRegisteredTeamId(team.id);
              return;
            }
          }
        }
        
        if (!cancelled) {
          setIsRegistered(false);
          setRegisteredTeamId(null);
        }
      } catch (err) {
        console.error("Error checking registration:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [user, hackathon.id]);

  // Fetch user's created teams when they interact with team hackathon
  const fetchTeams = async () => {
    if (!user) return;
    try {
      const teams = await fetchCreatedTeams(user.id);
      setUserTeams(teams.map(t => ({ id: t.id, name: t.name })));
      if (teams.length === 0) {
        toast.error("You haven't created any teams yet. Create a team in Manage Teams.");
        return;
      }
      setShowTeamSelection(true);
    } catch (err) {
      console.error("Error fetching teams:", err);
      toast.error("Failed to load your teams");
    }
  };

  const handleParticipate = async () => {
    if (!user || !hackathon.id) {
      toast.error("Please sign in to participate");
      return;
    }

    // If it's a team-based hackathon, show team selection
    if (hackathon.participation_type === "Team") {
      await fetchTeams();
      return;
    }

    // Individual registration
    setRegistering(true);
    try {
      await registerUserForHackathon(hackathon.id, user.id);
      setIsRegistered(true);
      toast.success("Successfully registered for the hackathon!");
      onRegistrationChange?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to register");
      console.error("Registration error:", err);
    } finally {
      setRegistering(false);
    }
  };

  const handleTeamRegister = async (teamId: string) => {
    if (!hackathon.id) {
      toast.error("Invalid hackathon");
      return;
    }

    setRegistering(true);
    try {
      await registerTeamForHackathon(hackathon.id, teamId);
      setIsRegistered(true);
      setRegisteredTeamId(teamId);
      setShowTeamSelection(false);
      toast.success("Your team has been registered for the hackathon!");
      onRegistrationChange?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to register team");
      console.error("Team registration error:", err);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || !hackathon.id) return;

    if (!confirm("Are you sure you want to unregister from this hackathon?")) return;

    setRegistering(true);
    try {
      // If a team is registered, unregister the team; otherwise unregister the user
      if (registeredTeamId) {
        await unregisterTeamFromHackathon(hackathon.id, registeredTeamId);
      } else {
        await unregisterUserFromHackathon(hackathon.id, user.id);
      }
      setIsRegistered(false);
      setRegisteredTeamId(null);
      toast.success("Successfully unregistered from the hackathon");
      onRegistrationChange?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to unregister");
      console.error("Unregister error:", err);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <article className="bg-off-white border-4 border-black p-4 rounded-lg shadow-brutal-sm">
      {hackathon.image_url && (
        <img src={hackathon.image_url} alt={hackathon.title} className="w-full h-40 object-cover rounded" />
      )}
      <h3 className="text-xl font-bold mt-3">{hackathon.title}</h3>
      
      {/* Participation Type Badge */}
      {hackathon.participation_type && (
        <div className="mt-2 inline-block">
          <span className={`inline-block px-2 py-1 text-xs font-bold rounded border-2 ${
            hackathon.participation_type === "Team"
              ? "bg-green border-black text-off-white"
              : "bg-orange border-black text-off-white"
          }`}>
            {hackathon.participation_type === "Team"
              ? `Team (Max ${hackathon.max_team_size || 5})`
              : "Individual"}
          </span>
        </div>
      )}

      {hackathon.location && <p className="text-sm text-navy/70 mt-2">{hackathon.location}</p>}
      {hackathon.description && <p className="mt-2 text-sm">{hackathon.description}</p>}
      <div className="mt-3 text-xs text-navy/70">
        {hackathon.start_date ? new Date(hackathon.start_date).toLocaleString() : "TBD"}
        {" — "}
        {hackathon.end_date ? new Date(hackathon.end_date).toLocaleString() : "TBD"}
      </div>

      {/* Participation Button */}
      {user && !hackathon.created_by?.includes(user.id) && (
        <div className="mt-4 flex gap-2">
          {!isRegistered ? (
            <Button
              onClick={handleParticipate}
              disabled={registering}
              variant="hero"
              size="sm"
              className="flex-1"
            >
              {registering ? "Registering..." : "Participate!"}
            </Button>
          ) : (
            <Button
              onClick={handleUnregister}
              disabled={registering}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Unregister
            </Button>
          )}
        </div>
      )}

      {/* Team Selection Dialog */}
      {showTeamSelection && userTeams.length > 0 && (
        <div className="mt-4 p-3 bg-green/20 border-2 border-green rounded-md">
          <p className="text-xs font-bold text-navy mb-2">Select a team to register:</p>
          <div className="space-y-2">
            {userTeams.map(team => (
              <button
                key={team.id}
                onClick={() => handleTeamRegister(team.id)}
                disabled={registering}
                className="w-full text-left p-2 border-2 border-black hover:bg-off-white bg-white text-navy font-semibold text-sm rounded-md transition-colors"
              >
                {team.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowTeamSelection(false)}
            className="w-full mt-2 text-xs text-navy/60 hover:text-navy underline"
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHackathonById, getHackathonInsights, type Hackathon } from "@/lib/hackathons";
import { useAuth } from "@/contexts/authContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface InsightsData {
  totalIndividualParticipants: number;
  totalTeams: number;
  totalTeamParticipants: number;
  teams: Array<{
    id: string;
    name: string;
    memberCount: number;
    members: Array<{ id: string; name: string }>;
  }>;
  individuals: Array<{ id: string; name: string }>;
}

export default function HackathonInsights() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) {
      navigate("/");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const h = await getHackathonById(id);

        if (cancelled) return;
        if (!h) {
          toast.error("Hackathon not found");
          navigate("/");
          return;
        }

        // Check authorization: only creator can view insights
        if (h.created_by !== user.id) {
          toast.error("You don't have permission to view this hackathon's insights");
          navigate("/");
          return;
        }

        setHackathon(h);

        // Fetch insights
        const insightsData = await getHackathonInsights(id);
        if (!cancelled) {
          setInsights(insightsData);
        }
      } catch (err) {
        console.error("Error loading insights:", err);
        if (!cancelled) {
          toast.error("Failed to load insights");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-12 text-center">
          <p className="text-navy/60">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!hackathon || !insights) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-12 text-center">
          <p className="text-navy/60">Failed to load insights</p>
        </div>
      </div>
    );
  }

  const totalParticipants = insights.totalIndividualParticipants + insights.totalTeamParticipants;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-navy hover:text-navy/70 font-semibold mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-navy mb-2">{hackathon.title}</h1>
          <p className="text-lg text-navy/70">Hackathon Insights & Analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Participants */}
          <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm uppercase font-black text-navy/70">Total Participants</h3>
              <Users className="w-6 h-6 text-navy/60" />
            </div>
            <p className="text-4xl font-black text-navy">{totalParticipants}</p>
            <p className="text-xs text-navy/60 mt-2">
              {insights.totalIndividualParticipants} individual{insights.totalIndividualParticipants !== 1 ? 's' : ''} + {insights.totalTeamParticipants} team member{insights.totalTeamParticipants !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Teams */}
          <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm uppercase font-black text-navy/70">Teams Registered</h3>
              <Users className="w-6 h-6 text-navy/60" />
            </div>
            <p className="text-4xl font-black text-navy">{insights.totalTeams}</p>
            <p className="text-xs text-navy/60 mt-2">
              {insights.totalTeamParticipants} participant{insights.totalTeamParticipants !== 1 ? 's' : ''} in teams
            </p>
          </div>

          {/* Individuals */}
          <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm uppercase font-black text-navy/70">Individual Participants</h3>
              <BarChart3 className="w-6 h-6 text-navy/60" />
            </div>
            <p className="text-4xl font-black text-navy">{insights.totalIndividualParticipants}</p>
            <p className="text-xs text-navy/60 mt-2">registered as solo</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams Section */}
          {hackathon.participation_type === "Team" && (
            <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
              <h2 className="text-2xl font-black text-navy mb-6">Teams</h2>
              {insights.teams.length === 0 ? (
                <p className="text-navy/60 italic">No teams registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {insights.teams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-navy/5 border-2 border-navy p-4 rounded-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-black text-navy">{team.name}</h3>
                        <span className="px-2 py-1 bg-navy text-off-white text-xs font-bold rounded">
                          {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Team Members */}
                      {team.members.length > 0 && (
                        <div className="mt-3 ml-2 space-y-1">
                          <p className="text-xs uppercase font-bold text-navy/70 mb-2">Members:</p>
                          <ul className="space-y-1">
                            {team.members.map((member) => (
                              <li
                                key={member.id}
                                className="text-sm text-navy/80 pl-3 border-l-2 border-orange"
                              >
                                {member.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Individual Participants Section */}
          {insights.totalIndividualParticipants > 0 && (
            <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
              <h2 className="text-2xl font-black text-navy mb-6">Individual Participants</h2>
              {insights.individuals.length === 0 ? (
                <p className="text-navy/60 italic">No individual registrations.</p>
              ) : (
                <div className="space-y-2">
                  {insights.individuals.map((individual) => (
                    <div
                      key={individual.id}
                      className="bg-orange/10 border-2 border-orange p-3 rounded-md"
                    >
                      <p className="text-sm font-semibold text-navy">{individual.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hackathon Details */}
          <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
            <h2 className="text-2xl font-black text-navy mb-6">Event Details</h2>
            <div className="space-y-4">
              {hackathon.description && (
                <div>
                  <p className="text-xs uppercase font-black text-navy/70 mb-1">Description</p>
                  <p className="text-sm text-navy/80">{hackathon.description}</p>
                </div>
              )}
              {hackathon.location && (
                <div>
                  <p className="text-xs uppercase font-black text-navy/70 mb-1">Location</p>
                  <p className="text-sm font-semibold text-navy">{hackathon.location}</p>
                </div>
              )}
              {hackathon.start_date && (
                <div>
                  <p className="text-xs uppercase font-black text-navy/70 mb-1">Start Date</p>
                  <p className="text-sm font-semibold text-navy">
                    {new Date(hackathon.start_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              {hackathon.end_date && (
                <div>
                  <p className="text-xs uppercase font-black text-navy/70 mb-1">End Date</p>
                  <p className="text-sm font-semibold text-navy">
                    {new Date(hackathon.end_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase font-black text-navy/70 mb-1">Participation Type</p>
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-full border-2 ${
                    hackathon.participation_type === "Team"
                      ? "bg-navy border-black text-off-white"
                      : "bg-orange border-black text-off-white"
                  }`}
                >
                  {hackathon.participation_type || "Individual"}
                </span>
              </div>
            </div>
          </div>

          {/* Prize and Additional Info */}
          {hackathon.prize && (
            <div className="bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm">
              <h2 className="text-2xl font-black text-navy mb-6">Prize</h2>
              <div className="bg-orange/10 border-2 border-orange p-4 rounded-md">
                <p className="text-lg font-black text-navy">{hackathon.prize}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

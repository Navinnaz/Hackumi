import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SecondaryNav from "@/components/SecondaryNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

type Team = {
  id: string;
  name: string;
  description?: string;
  members?: { id: string; full_name?: string; avatar_url?: string; role?: string }[];
  created_by?: string;
};

export default function ManageTeams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  // Create team UI
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Invite UI (controlled dialog)
  const [inviteOpenFor, setInviteOpenFor] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Safer two-step fetch to avoid complex nested selects that can fail under RLS
        // 1) fetch teams the user created
        const { data: createdTeams } = await supabase.from("teams").select("*").eq("created_by", user.id);

        // 2) fetch team memberships for the user, then fetch those teams
        const { data: memberships } = await supabase.from("team_members").select("team_id").eq("user_id", user.id);
        const memberTeamIds = (memberships ?? []).map((m: any) => m.team_id);

        let memberTeams: any[] = [];
        if (memberTeamIds.length) {
          const { data: mt } = await supabase.from("teams").select("*").in("id", memberTeamIds);
          memberTeams = mt ?? [];
        }

        if (cancelled) return;

        // merge createdTeams and memberTeams (dedupe by id)
        const combined = [...(createdTeams ?? []), ...memberTeams];
        const uniqueById = Object.values(
          combined.reduce((acc: Record<string, any>, t: any) => {
            acc[t.id] = acc[t.id] || t;
            return acc;
          }, {})
        );

        // For each team, fetch a simple members list (ids) to show avatars later if needed
        const teamIds = uniqueById.map((t: any) => t.id);
        let membersMap: Record<string, any[]> = {};
        if (teamIds.length) {
          const { data: allMembers } = await supabase.from("team_members").select("team_id, user_id").in("team_id", teamIds);
          (allMembers ?? []).forEach((m: any) => {
            membersMap[m.team_id] = membersMap[m.team_id] || [];
            membersMap[m.team_id].push({ id: m.user_id });
          });
        }

        setTeams(
          uniqueById.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            members: (membersMap[t.id] || []) as Team["members"],
            created_by: t.created_by,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Could not load teams");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreate = async () => {
    if (!newName.trim() || !user) {
      toast.error("Please provide a team name");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({ name: newName.trim(), description: newDesc, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      setTeams((s) => [{ id: (data as any).id, name: newName.trim(), description: newDesc, members: [], created_by: user.id }, ...s]);
      setNewName("");
      setNewDesc("");
      setCreating(false);
      toast.success("Team created");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create team");
      setCreating(false);
    }
  };

  const openInvite = (teamId: string) => {
    setInviteOpenFor(teamId);
    setInviteEmail("");
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteOpenFor) {
      toast.error("Enter an email to invite");
      return;
    }
    setInviting(true);
    try {
      // adapt to your invitations table/schema
      const { error } = await supabase.from("team_invitations").insert({
        team_id: inviteOpenFor,
        email: inviteEmail.trim(),
        invited_by: user?.id,
      });
      if (error) throw error;
      toast.success("Invitation sent");
      setInviteOpenFor(null);
      setInviteEmail("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-navy font-black text-xl">Please sign in to manage teams</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SecondaryNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Create team card (left column on large screens) */}
          <div className="lg:col-span-1">
            <Card className="bg-off-white border-4 border-black shadow-brutal-sm">
              <CardHeader>
                <CardTitle className="text-lg uppercase font-black">Create Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Label className="text-xs uppercase font-black text-navy">Team name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Team Neon"
                    className="placeholder:text-navy/50 mt-2"
                  />
                </div>
                <div className="mb-3">
                  <Label className="text-xs uppercase font-black text-navy">Description</Label>
                  <Input
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Short description (optional)"
                    className="placeholder:text-navy/50 mt-2"
                  />
                </div>
                <div className="text-sm text-navy/60 mb-2">
                  Teams let you group projects & members. You can invite members after creating a team.
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setNewName(""); setNewDesc(""); }} className="border border-navy text-navy">
                    Reset
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="bg-orange text-off-white border-2 border-black">
                    {creating ? "Creating..." : "Create Team"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Teams list */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-navy uppercase">Your Teams</h2>
              <div className="text-sm text-navy/60">{teams.length} teams</div>
            </div>

            {loading ? (
              <div className="bg-off-white border-4 border-black p-6 shadow-brutal-lg">Loading teams…</div>
            ) : teams.length === 0 ? (
              <Card className="bg-navy text-off-white border-4 border-black p-6 shadow-brutal-lg text-center">
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-center -space-x-3 mb-3">
                      <Avatar className="h-12 w-12 border-2 border-black">
                        <AvatarImage src="/images/avatar-placeholder-1.jpg" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-12 w-12 border-2 border-black">
                        <AvatarImage src="/images/avatar-placeholder-2.jpg" />
                        <AvatarFallback>MA</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-12 w-12 border-2 border-black">
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-xl font-black">No Teams Yet</h3>
                    <p className="text-sm mt-2 text-off-white/80">Create a team to invite members and collaborate on projects.</p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={() => setCreating(true)} className="bg-orange text-off-white border-2 border-black">+ Create Team</Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((t) => (
                  <Card key={t.id} className="bg-off-white border-4 border-black p-0 shadow-brutal-sm flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-navy">{t.name}</h4>
                            <Badge variant="outline" className="uppercase">{(t.members ?? []).length} members</Badge>
                          </div>
                          {t.description && <div className="text-xs text-navy/60 mt-1">{t.description}</div>}
                        </div>

                        <div className="flex -space-x-2 items-center">
                          {(t.members ?? []).slice(0, 4).map((m) => (
                            <Avatar key={m.id} className="h-8 w-8 border-2 border-black">
                              {m.avatar_url ? <AvatarImage src={m.avatar_url} /> : <AvatarFallback>{(m.full_name || "U").slice(0,2).toUpperCase()}</AvatarFallback>}
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="mb-3">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Member</TableHead>
                              <TableHead className="hidden md:table-cell">Role</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(t.members ?? []).map((m) => (
                              <TableRow key={m.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border-2 border-black">
                                      {m.avatar_url ? <AvatarImage src={m.avatar_url} /> : <AvatarFallback>{(m.full_name || "U").slice(0,2).toUpperCase()}</AvatarFallback>}
                                    </Avatar>
                                    <div>
                                      <div className="font-semibold text-navy">{m.full_name ?? m.id}</div>
                                      <div className="text-xs text-navy/60">{m.id}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <Badge variant="default">{m.role ?? "Member"}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-navy/60">Created by: {t.created_by === user.id ? "You" : t.created_by?.slice(0,6)}</div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => openInvite(t.id)} className="bg-orange text-off-white border-2 border-black">Invite</Button>
                          <Button onClick={() => toast("Manage team (not implemented)")} variant="outline" className="border border-navy text-navy">Manage</Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Dialog (single controlled dialog) */}
      <Dialog open={!!inviteOpenFor} onOpenChange={(open) => { if (!open) setInviteOpenFor(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to team</DialogTitle>
            <DialogDescription>Send an invite via email to join the team.</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <Label className="text-xs uppercase font-black text-navy">Email</Label>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="person@example.com"
              className="placeholder:text-navy/50 mt-2"
            />
            <div className="text-xs text-navy/60 mt-2">Invites will be sent as a one-time email with instructions.</div>
          </div>

          <DialogFooter>
            <div className="w-full flex justify-end gap-2">
              <Button variant="outline" onClick={() => setInviteOpenFor(null)} className="border border-navy text-navy">Cancel</Button>
              <Button onClick={handleInvite} disabled={inviting} className="bg-orange text-off-white border-2 border-black">
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
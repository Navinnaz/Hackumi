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
  // Manage team UI (remove members / delete team)
  const [manageOpenFor, setManageOpenFor] = useState<string | null>(null);
  const [manageMembers, setManageMembers] = useState<any[]>([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageInvites, setManageInvites] = useState<any[]>([]);
  const [myInvites, setMyInvites] = useState<any[]>([]);
  const [invitesMap, setInvitesMap] = useState<Record<string, any[]>>({});

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

        // For each team, fetch a simple members list (ids)
        const teamIds = uniqueById.map((t: any) => t.id);
        let membersMap: Record<string, any[]> = {};
        if (teamIds.length) {
          const { data: allMembers } = await supabase.from("team_members").select("team_id, user_id").in("team_id", teamIds);
          (allMembers ?? []).forEach((m: any) => {
            membersMap[m.team_id] = membersMap[m.team_id] || [];
            membersMap[m.team_id].push({ id: m.user_id });
          });
        }

        // fetch profile rows for all member ids so we can show full_name/avatar instead of UUID
        const allMemberIds = Object.values(membersMap).flat().map((m: any) => m.id);
        const uniqueMemberIds = Array.from(new Set(allMemberIds));
        let profilesMap: Record<string, any> = {};
        if (uniqueMemberIds.length) {
          const { data: profileRows } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", uniqueMemberIds);
          (profileRows ?? []).forEach((p: any) => {
            profilesMap[p.id] = p;
          });
        }

        // fetch pending invitations for these teams
        let invites: any[] = [];
        if (teamIds.length) {
          const { data: inv } = await supabase
            .from("team_invitations")
            .select("id,team_id,email,created_at,status")
            .in("team_id", teamIds)
            .eq("status", "pending");
          invites = inv ?? [];
        }

        const invitesByTeam: Record<string, any[]> = {};
        invites.forEach((iv: any) => {
          invitesByTeam[iv.team_id] = invitesByTeam[iv.team_id] || [];
          invitesByTeam[iv.team_id].push(iv);
        });

        // fetch invitations addressed to current user
        const { data: myInv } = await supabase
          .from("team_invitations")
          .select("id,team_id,email,status,team:teams(name)")
          .eq("email", user.email)
          .eq("status", "pending");

        setInvitesMap(invitesByTeam);
        setMyInvites((myInv as any) ?? []);

        setTeams(
          uniqueById.map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            members: (membersMap[t.id] || []).map((m: any) => {
              const prof = profilesMap[m.id];
              const isCurrent = m.id === user.id;
              const fallbackName = isCurrent ? (user.user_metadata?.full_name || user.email) : undefined;
              return {
                id: m.id,
                full_name: prof?.full_name ?? fallbackName ?? m.id,
                avatar_url: prof?.avatar_url ?? undefined,
              };
            }) as Team["members"],
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
      const teamId = (data as any).id;
      // add creator as member (minimal insert)
      const { error: mErr } = await supabase.from("team_members").insert({ team_id: teamId, user_id: user.id });
      if (mErr) throw mErr;
      // fetch creator profile so we can display name/avatar immediately
      let creatorProfile: any = null;
      try {
        const { data: prof } = await supabase.from("profiles").select("id,full_name,avatar_url").eq("id", user.id).single();
        creatorProfile = prof;
      } catch (e) {
        creatorProfile = null;
      }
      const creatorName = creatorProfile?.full_name ?? user.user_metadata?.full_name ?? user.email;
      setTeams((s) => [{ id: teamId, name: newName.trim(), description: newDesc, members: [{ id: user.id, full_name: creatorName, avatar_url: creatorProfile?.avatar_url }], created_by: user.id }, ...s]);
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

  const openManage = async (teamId: string) => {
    setManageOpenFor(teamId);
    setManageMembers([]);
    setManageLoading(true);
    try {
      // select members (user ids) and then fetch profiles to show names/avatars
      const { data: memberRows } = await supabase.from("team_members").select("user_id").eq("team_id", teamId);
      const userIds = (memberRows ?? []).map((m: any) => m.user_id);
      let profileRows: any[] = [];
      if (userIds.length) {
        const { data: profs } = await supabase.from("profiles").select("id,full_name,avatar_url").in("id", userIds);
        profileRows = profs ?? [];
      }
      setManageMembers((memberRows ?? []).map((m: any) => {
        const p = profileRows.find((pp) => pp.id === m.user_id);
        const isCurrent = m.user_id === user.id;
        const fallbackName = isCurrent ? (user.user_metadata?.full_name || user.email) : m.user_id;
        return { user_id: m.user_id, full_name: p?.full_name ?? fallbackName, avatar_url: p?.avatar_url };
      }));
      const { data: inv } = await supabase
        .from("team_invitations")
        .select("id,email,created_at,status")
        .eq("team_id", teamId)
        .eq("status", "pending");
      setManageInvites(inv ?? []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load team members");
    } finally {
      setManageLoading(false);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    if (!user) return;
    if (!window.confirm("Remove this member from the team?")) return;
    setManageLoading(true);
    try {
      // ensure team will have at least 2 members after removal
      const team = teams.find((t) => t.id === teamId);
      const currentCount = (team?.members?.length ?? 0);
      if (currentCount <= 2) {
        toast.error("Team must have at least 2 members");
        setManageLoading(false);
        return;
      }

      const { error } = await supabase.from("team_members").delete().match({ team_id: teamId, user_id: memberId });
      if (error) throw error;

      // update UI: remove member from local state
      setManageMembers((s) => s.filter((m) => m.user_id !== memberId));
      setTeams((s) =>
        s.map((t) => (t.id === teamId ? { ...t, members: (t.members ?? []).filter((m: any) => m.id !== memberId) } : t))
      );
      toast.success("Member removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    } finally {
      setManageLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!user) return;
    if (!window.confirm("Delete this team? This will also unregister the team from any hackathons.")) return;
    setManageLoading(true);
    try {
      // 1) remove hackathon registrations for this team
      const { error: err1 } = await supabase.from("hackathon_registrations").delete().eq("team_id", teamId);
      if (err1) throw err1;

      // 2) remove members
      const { error: err2 } = await supabase.from("team_members").delete().eq("team_id", teamId);
      if (err2) throw err2;

      // 3) remove the team
      const { error: err3 } = await supabase.from("teams").delete().eq("id", teamId);
      if (err3) throw err3;

      // update UI
      setTeams((s) => s.filter((t) => t.id !== teamId));
      setManageOpenFor(null);
      toast.success("Team deleted and team registrations revoked");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete team");
    } finally {
      setManageLoading(false);
    }
  };

  const handleCancelInvite = async (inviteId: string, teamId: string) => {
    if (!user) return;
    if (!window.confirm("Cancel this pending invite?")) return;
    try {
      const { error } = await supabase.from("team_invitations").delete().eq("id", inviteId);
      if (error) throw error;
      // update local manageInvites and invitesMap
      setManageInvites((s) => s.filter((i) => i.id !== inviteId));
      setInvitesMap((m) => ({ ...(m || {}), [teamId]: (m[teamId] || []).filter((i) => i.id !== inviteId) }));
      toast.success("Invite canceled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel invite");
    }
  };

  const handleAcceptMyInvite = async (invite: any) => {
    if (!user) return;
    setLoading(true);
    try {
      // join the team (minimal insert)
      const { error: mErr } = await supabase.from("team_members").insert({ team_id: invite.team_id, user_id: user.id });
      if (mErr) throw mErr;
      // mark invite accepted
      const { error: uErr } = await supabase.from("team_invitations").update({ status: "accepted" }).eq("id", invite.id);
      if (uErr) throw uErr;
      // fetch profile for the current user so we can display name/avatar (fallback to metadata/email)
      let myProfile: any = null;
      try {
        const { data: prof } = await supabase.from("profiles").select("id,full_name,avatar_url").eq("id", user.id).single();
        myProfile = prof;
      } catch (e) {
        myProfile = null;
      }
      const myName = myProfile?.full_name ?? user.user_metadata?.full_name ?? user.email;
      // update local state
      setMyInvites((s) => s.filter((i) => i.id !== invite.id));
      setTeams((s) => s.map((t) => (t.id === invite.team_id ? { ...t, members: [...(t.members || []), { id: user.id, full_name: myName, avatar_url: myProfile?.avatar_url }] } : t)));
      toast.success("Invite accepted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineMyInvite = async (inviteId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("team_invitations").update({ status: "declined" }).eq("id", inviteId);
      if (error) throw error;
      setMyInvites((s) => s.filter((i) => i.id !== inviteId));
      toast.success("Invite declined");
    } catch (err) {
      console.error(err);
      toast.error("Failed to decline invite");
    } finally {
      setLoading(false);
    }
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

            {/* My pending invites (for recipient) */}
            {myInvites.length > 0 && (
              <div className="mb-6">
                <Card className="bg-off-white border-4 border-black p-4">
                  <CardHeader>
                    <CardTitle className="text-sm font-black">Pending Invites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {myInvites.map((iv) => (
                        <div key={iv.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-navy">{iv.team?.name ?? iv.team_id}</div>
                            <div className="text-xs text-navy/60">Invited: {iv.email}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleAcceptMyInvite(iv)} className="bg-orange text-off-white border-2 border-black">Accept</Button>
                            <Button variant="outline" onClick={() => handleDeclineMyInvite(iv.id)} className="border border-navy text-navy">Decline</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

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
                  {/* <div className="flex justify-center">
                    <Button onClick={() => setCreating(true)} className="bg-orange text-off-white border-2 border-black">+ Create Team</Button>
                  </div> */}
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
                                      {m.avatar_url ? <AvatarImage src={m.avatar_url} /> : <AvatarFallback>{((m.full_name as string) || "U").slice(0,2).toUpperCase()}</AvatarFallback>}
                                    </Avatar>
                                    <div>
                                      <div className="font-semibold text-navy">{m.full_name ?? m.id}</div>
                                      <div className="text-xs text-navy/60">{m.full_name ? m.id : m.id}</div>
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
                      {/* Pending requests (creator view) */}
                      {invitesMap[t.id] && invitesMap[t.id].length > 0 && (
                        <div className="mt-2 border-t pt-2">
                          <div className="text-xs font-semibold text-navy mb-1">Pending requests</div>
                          <div className="space-y-1">
                            {invitesMap[t.id].map((iv) => (
                              <div key={iv.id} className="flex items-center justify-between text-sm">
                                <div className="text-navy/80">{iv.email}</div>
                                {t.created_by === user.id && (
                                  <Button size="sm" variant="outline" onClick={() => handleCancelInvite(iv.id, t.id)} className="border border-navy text-navy">Cancel</Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      <div className="flex items-center justify-between w-full">
                        <div className="text-xs text-navy/60">Created by: {t.created_by === user.id ? "You" : t.created_by?.slice(0,6)}</div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => openInvite(t.id)} className="bg-orange text-off-white border-2 border-black">Invite</Button>
                          {t.created_by === user.id && (
                            <Button onClick={() => openManage(t.id)} variant="outline" className="border border-navy text-navy">Manage</Button>
                          )}
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

      {/* Manage Dialog (remove members / delete team) */}
      <Dialog open={!!manageOpenFor} onOpenChange={(open) => { if (!open) setManageOpenFor(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage team</DialogTitle>
            <DialogDescription>Remove members or delete the team (this revokes team hackathon registrations).</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {manageLoading ? (
              <div>Loading…</div>
            ) : (
              <div className="space-y-3">
                {manageMembers.length === 0 ? (
                  <div className="text-sm text-navy/60">No members found.</div>
                ) : (
                  manageMembers.map((m) => (
                    <div key={m.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2 border-black">
                          {m.avatar_url ? <AvatarImage src={m.avatar_url} /> : <AvatarFallback>{((m.full_name as string) || m.user_id || "U").slice(0,2).toUpperCase()}</AvatarFallback>}
                        </Avatar>
                        <div>
                          <div className="font-semibold text-navy">{m.full_name ?? m.user_id}</div>
                          <div className="text-xs text-navy/60">{m.role ?? "Member"}</div>
                        </div>
                      </div>
                      <div>
                        {m.user_id === user?.id ? (
                          <Badge variant="outline">You</Badge>
                        ) : (
                          <Button disabled={manageLoading} variant="outline" onClick={() => handleRemoveMember(manageOpenFor as string, m.user_id)} className="border border-navy text-navy">Remove</Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {/* Pending invites in manage dialog */}
                {manageInvites.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <div className="text-sm font-semibold mb-2">Pending Invites</div>
                    <div className="space-y-2">
                      {manageInvites.map((iv) => (
                        <div key={iv.id} className="flex items-center justify-between">
                          <div className="text-sm text-navy/80">{iv.email}</div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleCancelInvite(iv.id, manageOpenFor as string)} className="border border-navy text-navy">Cancel</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="w-full flex justify-between gap-2">
              <Button variant="outline" onClick={() => setManageOpenFor(null)} className="border border-navy text-navy">Close</Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setManageOpenFor(null)} className="border border-navy text-navy">Done</Button>
                <Button onClick={() => handleDeleteTeam(manageOpenFor as string)} disabled={manageLoading} className="bg-red-600 text-off-white border-2 border-black">Delete Team</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
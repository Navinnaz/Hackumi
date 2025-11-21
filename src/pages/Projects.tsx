import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { Plus, Edit, Search, Link as LinkIcon, Award, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/authContext";

type Project = {
  id: string;
  title: string;
  tagline?: string;
  teamName?: string;
  members?: { id: string; name: string; avatar?: string }[];
  status?: "Draft" | "Submitted" | "Shortlisted" | "Winner";
  tech?: string[];
  score?: number;
  description?: string;
  links?: { label: string; url: string }[];
  progress?: { build: number; review: number; judging: number };
};

const sampleProjects: Project[] = [
  {
    id: "p1",
    title: "GenAI Hackathon",
    tagline: "AI-powered content assistant for developers",
    teamName: "ByteMinds",
    members: [
      { id: "u1", name: "Ava Li", avatar: "/images/avatar-placeholder-1.jpg" },
      { id: "u2", name: "Ravi K.", avatar: "/images/avatar-placeholder-2.jpg" },
    ],
    status: "Shortlisted",
    tech: ["React", "FastAPI", "PyTorch"],
    score: 87,
    description: "A tool to generate and validate developer docs and examples using large language models.",
    links: [{ label: "GitHub", url: "https://github.com/example/genai" }],
    progress: { build: 100, review: 80, judging: 60 },
  },
  {
    id: "p2",
    title: "Calcutta <Hacks/>",
    tagline: "Local marketplace for student projects",
    teamName: "Harbour",
    members: [
      { id: "u3", name: "Maya G.", avatar: "/images/avatar-placeholder-3.jpg" },
    ],
    status: "Winner",
    tech: ["Next.js", "Supabase"],
    score: 96,
    description: "A hyperlocal platform connecting student makers with early adopters.",
    links: [{ label: "Demo", url: "https://example.com/demo" }],
    progress: { build: 100, review: 100, judging: 95 },
  },
  {
    id: "p3",
    title: "GLYTCH",
    tagline: "Generative audio experiments",
    teamName: "SoundForge",
    members: [
      { id: "u4", name: "Noah P.", avatar: "/images/avatar-placeholder-4.jpg" },
      { id: "u5", name: "Lina S." },
    ],
    status: "Submitted",
    tech: ["Tone.js", "Node.js"],
    score: 72,
    description: "A generative audio playground for creative coders.",
    links: [],
    progress: { build: 90, review: 40, judging: 10 },
  },
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewTable, setViewTable] = useState(false);

  // Dialog / edit state
  const [editing, setEditing] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Derived & filtered
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.tagline || "").toLowerCase().includes(q) ||
        (p.teamName || "").toLowerCase().includes(q) ||
        (p.tech || []).join(" ").toLowerCase().includes(q)
      );
    });
  }, [projects, query, filterStatus]);

  // Add / edit handlers
  const openNew = () => {
    setEditing({ id: `p${Date.now()}`, title: "", tagline: "", teamName: "", members: [], status: "Draft", tech: [], score: 0, description: "", links: [], progress: { build: 0, review: 0, judging: 0 } });
    setIsDialogOpen(true);
  };

  const handleSave = (proj: Project) => {
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === proj.id);
      if (exists) return prev.map((p) => (p.id === proj.id ? proj : p));
      return [proj, ...prev];
    });
    setIsDialogOpen(false);
    setEditing(null);
  };

  const handleEdit = (p: Project) => {
    setEditing(p);
    setIsDialogOpen(true);
  };

  const statusBadge = (s?: Project["status"]) => {
    switch (s) {
      case "Winner":
        return <Badge className="bg-green text-off-white"><Award className="inline-block mr-1" /> Winner</Badge>;
      case "Shortlisted":
        return <Badge className="bg-orange text-off-white">Shortlisted</Badge>;
      case "Submitted":
        return <Badge className="bg-off-white">Submitted</Badge>;
      default:
        return <Badge className="bg-navy text-off-white">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background ">
        <Navbar />
      <div className="container mx-auto px-4">
        <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 md:mb-8 text-navy font-bold hover:text-orange transition-colors"
            >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            Back to Home
        </Link>
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy">Projects Showcase</h1>
            <p className="text-sm text-navy/60">Explore submissions, inspect details, and manage results.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Input placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-navy/50" />
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v || "all")}>
                <option value="all">All</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Winner">Winner</option>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setViewTable((s) => !s)} className="hidden md:inline-block">{viewTable ? "Card view" : "Table view"}</Button>
              <Button onClick={openNew} className="bg-orange text-off-white border-2 border-black">
                <Plus className="inline-block mr-2" /> New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Table view (desktop) */}
        {viewTable ? (
          <div className="bg-off-white border-4 border-black rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">Team</TableHead>
                  <TableHead className="hidden lg:table-cell">Tags</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-semibold text-navy">{p.title}</div>
                      <div className="text-xs text-navy/60">{p.tagline}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{p.teamName}</TableCell>
                    <TableCell className="hidden lg:table-cell">{(p.tech || []).slice(0,3).map((t) => <Badge key={t} className="mr-2 uppercase">{t}</Badge>)}</TableCell>
                    <TableCell>{p.score ?? 0}</TableCell>
                    <TableCell>
                      <div className="w-40">
                        <Progress value={p.progress?.judging ?? 0} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {statusBadge(p.status)}
                        <Button variant="ghost" onClick={() => handleEdit(p)}><Edit /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          // Card/grid view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <Card key={p.id} className="bg-white rounded-2xl border border-transparent hover:border-blue-400 hover:shadow-brutal-lg transition-all">
                <CardHeader className="px-6 pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <CardTitle className="text-lg font-black text-navy">{p.title}</CardTitle>
                      <div className="text-xs text-navy/60">{p.tagline}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {statusBadge(p.status)}
                      <div className="text-xs text-navy/60">{p.score ?? 0} pts</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <div className="mb-3 flex items-center -space-x-3">
                    {(p.members || []).slice(0,4).map((m) => (
                      <Avatar key={m.id} className="h-9 w-9 border-2 border-white shadow-sm">
                        {m.avatar ? <AvatarImage src={m.avatar} /> : <AvatarFallback>{(m.name || "?").slice(0,2).toUpperCase()}</AvatarFallback>}
                      </Avatar>
                    ))}
                    <div className="ml-4 text-sm text-navy/70">{p.teamName}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-navy/60 mb-2">Tech</div>
                    <div className="flex flex-wrap gap-2">{(p.tech || []).map((t) => <Badge key={t} className="uppercase">{t}</Badge>)}</div>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="details">
                      <AccordionTrigger>Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="text-sm text-navy/70 mb-3">{p.description}</div>
                        <div className="flex items-center gap-3">
                          {(p.links || []).map((l) => (
                            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-navy hover:underline">
                              <LinkIcon /> {l.label}
                            </a>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                </CardContent>

                <CardFooter className="px-6 py-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="w-1/2">
                      <div className="text-xs text-navy/60 mb-2">Judging progress</div>
                      <Progress value={p.progress?.judging ?? 0} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleEdit(p)}><Edit /></Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Edit / Add Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(o) => { if (!o) { setEditing(null); } setIsDialogOpen(o); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing?.id ? (projects.find(p=>p.id===editing.id) ? "Edit Project" : "New Project") : "Project"}</DialogTitle>
              <DialogDescription>Use this form to add or update a project.</DialogDescription>
            </DialogHeader>

            {editing && (
              <div className="space-y-3 mt-4">
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Project title" />
                <Input value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="Tagline" />
                <Input value={editing.teamName} onChange={(e) => setEditing({ ...editing, teamName: e.target.value })} placeholder="Team name" />
                <Input value={editing.tech?.join(", ")} onChange={(e) => setEditing({ ...editing, tech: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })} placeholder="Tech stack (comma separated)" />
                <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Short description" />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(null); setIsDialogOpen(false); }}>Cancel</Button>
              <Button onClick={() => { if (editing) handleSave(editing); }} className="bg-orange text-off-white border-2 border-black">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

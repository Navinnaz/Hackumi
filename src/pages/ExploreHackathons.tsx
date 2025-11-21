  import React, { useEffect, useMemo, useState } from "react";
  import Navbar from "@/components/Navbar";
  import SecondaryNav from "@/components/SecondaryNav";
  import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
  import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
  import { Badge } from "@/components/ui/badge";
  import { Input } from "@/components/ui/input";
  import { Button } from "@/components/ui/button";
  import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
  import { useAuth } from "@/contexts/authContext";
  import { supabase } from "@/supabaseClient";
  import { toast } from "sonner";

  type Hackathon = {
    id: string;
    title: string;
    short_description?: string;
    mode?: string; // Online / Offline
    tags?: string[];
    participants_count?: number;
    participant_avatars?: string[];
    starts_at?: string | null;
  };

  export default function ExploreHackathons() {
    const { user } = useAuth();
    const [items, setItems] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(false);

    // UI state
    const [query, setQuery] = useState("");
    const [filterMode, setFilterMode] = useState<string>("all");
    const [page, setPage] = useState(1);
    const perPage = 9;

    useEffect(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase.from("hackathons").select(`id, title, short_description, mode, tags, participants_count, participant_avatars, starts_at`);
          if (error) throw error;
          if (cancelled) return;
          const list = (data ?? []) as any[];
          setItems(
            list.map((r) => ({
              id: r.id,
              title: r.title,
              short_description: r.short_description,
              mode: r.mode ?? "offline",
              tags: r.tags ?? [],
              participants_count: r.participants_count ?? 0,
              participant_avatars: r.participant_avatars ?? [],
              starts_at: r.starts_at ?? null,
            }))
          );
        } catch (err) {
          console.error(err);
          toast.error("Failed to load hackathons");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []);

    // curated static examples (matches screenshot style)
    const staticExamples: Hackathon[] = [
      {
        id: "static-ctrl-alt-vibe",
        title: "Ctrl+Alt+Vibe",
        short_description: "A high-energy regional hackathon for creative hardware and music projects.",
        mode: "offline",
        tags: ["Open", "Offline"],
        participants_count: 250,
        participant_avatars: ["/images/avatar-placeholder-1.jpg", "/images/avatar-placeholder-2.jpg", "/images/avatar-placeholder-3.jpg"],
        starts_at: new Date().toISOString(),
      },
      {
        id: "static-ethindia-villa",
        title: "ETHIndia Villa",
        short_description: "Blockchain-focused hack jam and networking at villa-style venues.",
        mode: "offline",
        tags: ["Blockchain", "Open"],
        participants_count: 500,
        participant_avatars: ["/images/avatar-placeholder-2.jpg", "/images/avatar-placeholder-3.jpg"],
        starts_at: null,
      },
      {
        id: "static-hacknitr-7",
        title: "HackNITR 7.0",
        short_description: "Campus flagship hackathon with long-standing traditions and prizes.",
        mode: "offline",
        tags: ["Open"],
        participants_count: 5000,
        participant_avatars: ["/images/avatar-placeholder-1.jpg", "/images/avatar-placeholder-4.jpg"],
        starts_at: "2026-01-03",
      },
      {
        id: "static-haulout",
        title: "Haulout",
        short_description: "An online, fast-paced hackathon focused on logistics & APIs.",
        mode: "online",
        tags: ["Online", "Open"],
        participants_count: 120,
        participant_avatars: ["/images/avatar-placeholder-3.jpg"],
        starts_at: null,
      },
      {
        id: "static-technocrats",
        title: "Technocrats Hackathon",
        short_description: "A design + engineering hack day for students and professionals.",
        mode: "online",
        tags: ["Open"],
        participants_count: 500,
        participant_avatars: ["/images/avatar-placeholder-1.jpg", "/images/avatar-placeholder-4.jpg"],
        starts_at: "2025-12-05",
      },
      {
        id: "static-srm-global",
        title: "SRM Global Youth Hack",
        short_description: "A youth-focused global challenge with mentorship tracks.",
        mode: "online",
        tags: ["Open"],
        participants_count: 100,
        participant_avatars: ["/images/avatar-placeholder-2.jpg"],
        starts_at: "2025-12-03",
      },
      {
        id: "static-calcutta-hacks",
        title: "Calcutta <Hacks/>",
        short_description: "Regional open-hack festival in Kolkata.",
        mode: "offline",
        tags: ["Open", "Offline"],
        participants_count: 1000,
        participant_avatars: ["/images/avatar-placeholder-3.jpg", "/images/avatar-placeholder-1.jpg"],
        starts_at: "2025-12-27",
      },
      {
        id: "static-hack-this-fall",
        title: "Hack This Fall 2025 - Milestone Edition",
        short_description: "A milestone edition with long-running seasonal prizes.",
        mode: "online",
        tags: ["Live", "Open"],
        participants_count: 1000,
        participant_avatars: ["/images/avatar-placeholder-4.jpg"],
        starts_at: "2025-11-30",
      },
    ];

    // combine static examples with fetched items and dedupe by id
    const combined = useMemo(() => {
      const map = new Map<string, Hackathon>();
      // add static first so they appear prominently
      staticExamples.forEach((s) => map.set(s.id, s));
      items.forEach((i) => map.set(i.id, i));
      return Array.from(map.values());
    }, [items]);

    // use combined array downstream instead of items

    // Filtering / searching
    const filtered = useMemo(() => {
      let arr = combined.slice();
      if (filterMode !== "all") arr = arr.filter((i) => (i.mode || "").toLowerCase() === filterMode.toLowerCase());
      if (query.trim()) {
        const q = query.toLowerCase();
        arr = arr.filter((i) => i.title.toLowerCase().includes(q) || (i.short_description || "").toLowerCase().includes(q) || (i.tags || []).some((t) => t.toLowerCase().includes(q)));
      }
      return arr;
    }, [items, query, filterMode]);

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    useEffect(() => {
      if (page > pages) setPage(1);
    }, [pages]);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <SecondaryNav />

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="w-full md:w-2/3">
              <Input
                placeholder="Search hackathons, tags or themes..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className="placeholder:text-navy/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex gap-2">
                <button
                  className={`nav-pill ${filterMode === "all" ? "nav-pill-active" : ""}`}
                  onClick={() => { setFilterMode("all"); setPage(1); }}
                >
                  All
                </button>
                <button
                  className={`nav-pill ${filterMode === "online" ? "nav-pill-active" : ""}`}
                  onClick={() => { setFilterMode("online"); setPage(1); }}
                >
                  Online
                </button>
                <button
                  className={`nav-pill ${filterMode === "offline" ? "nav-pill-active" : ""}`}
                  onClick={() => { setFilterMode("offline"); setPage(1); }}
                >
                  Offline
                </button>
              </div>

              <div className="ml-auto md:ml-0">
                <Button onClick={() => { setQuery(""); setFilterMode("all"); setPage(1); }} className="border border-navy text-navy">
                  Reset
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && <div className="col-span-full text-center text-navy/70">Loading…</div>}

            {!loading && paged.length === 0 && (
              <div className="col-span-full">
                <Card className="bg-off-white border-4 border-black p-6 text-center">
                  <CardContent>
                    <h3 className="text-lg font-black text-navy">No hackathons found</h3>
                    <p className="text-sm text-navy/60 mt-2">Try changing filters or search keywords.</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {paged.map((h) => (
              <article
                key={h.id}
                className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-brutal-lg"
              >
                <Card className={`border-2 border-black bg-card hover:border-orange-400`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-base md:text-lg font-black text-navy">{h.title}</CardTitle>
                        <p className="text-xs text-navy/60 mt-1 line-clamp-2">{h.short_description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge className="uppercase">{h.mode ?? "Offline"}</Badge>
                        <div className="text-xs text-navy/60">{(h.starts_at && new Date(h.starts_at).toLocaleDateString()) || "TBD"}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center -space-x-2">
                        {(h.participant_avatars ?? []).slice(0, 4).map((a, i) => (
                          <Avatar key={i} className="h-8 w-8 border-2 border-black">
                            {a ? <AvatarImage src={a} /> : <AvatarFallback>{`U${i}`}</AvatarFallback>}
                          </Avatar>
                        ))}

                        <div className="ml-3 text-sm text-navy/70">+{h.participants_count ?? 0} participating</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="border border-navy text-navy">⋯</Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56">
                            <div className="flex flex-col gap-2">
                              <div className="text-sm font-semibold">Quick actions</div>
                              <button
                                className="text-left text-sm px-2 py-1 rounded nav-pill"
                                onClick={() => window.open(`/hackathons/${h.id}`, "_self")}
                              >
                                View Details
                              </button>
                              <button
                                className="text-left text-sm px-2 py-1 rounded nav-pill"
                                onClick={() => window.open(`/hackathons/${h.id}/apply`, "_self")}
                              >
                                Apply / Register
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <Button className="bg-orange text-off-white border-2 border-black" onClick={() => window.open(`/hackathons/${h.id}/apply`, "_self")}>
                          Apply now
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <div className="flex items-center justify-between w-full text-xs text-navy/60">
                      <div className="flex items-center gap-2">
                        {(h.tags ?? []).slice(0, 3).map((t) => (
                          <Badge key={t} variant="outline" className="uppercase">{t}</Badge>
                        ))}
                      </div>
                      <div>{/* placeholder for future stats */}</div>
                    </div>
                  </CardFooter>
                </Card>
              </article>
            ))}
          </div>

          {/* Pagination controls */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button className="border border-navy text-navy" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </Button>
            <div className="text-sm text-navy/70">Page {page} of {pages}</div>
            <Button className="border border-navy text-navy" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
              Next
            </Button>
          </div>
        </main>
      </div>
    );
  }

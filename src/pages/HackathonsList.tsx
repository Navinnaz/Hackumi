import React, { useEffect, useState } from "react";
import { fetchHackathons, type Hackathon } from "@/lib/hackathons";
import HackathonCard from "@/components/HackathonCard";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function HackathonsList() {
  const [list, setList] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Individual" | "Team">("All");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchHackathons();
        setList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const normalize = (s = "") => s.replace(/[^a-z0-9]/gi, "").toLowerCase();

  const filtered = list.filter((h) => {
    // filter by participation type
    if (filter !== "All" && h.participation_type !== filter) return false;

    // search by title (alphanumeric normalized)
    if (!query) return true;
    const q = normalize(query);
    const title = normalize(h.title || "");
    return title.includes(q);
  });

  if (loading) return <p className="text-center mt-10">Loading hackathons...</p>;
  if (!list.length) return <p className="text-center mt-10">No hackathons posted yet.</p>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
      <Link
                  to="/"
                  className="inline-flex items-center gap-2 mb-6 md:mb-8 text-navy font-bold hover:text-orange transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                  Back to Home
        </Link>

      <div className="container mx-auto py-8">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hackathons by name..."
            className="w-full md:flex-1 p-2 border-2 border-black rounded-md bg-off-white text-navy"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("All")}
              className={`px-3 py-2 border-2 rounded-md font-bold ${filter === "All" ? "bg-navy text-off-white" : "bg-off-white text-navy"}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("Individual")}
              className={`px-3 py-2 border-2 rounded-md font-bold ${filter === "Individual" ? "bg-navy text-off-white" : "bg-off-white text-navy"}`}
            >
              Individual
            </button>
            <button
              onClick={() => setFilter("Team")}
              className={`px-3 py-2 border-2 rounded-md font-bold ${filter === "Team" ? "bg-navy text-off-white" : "bg-off-white text-navy"}`}
            >
              Team
            </button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center mt-10">No hackathons match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((h) => (
              <HackathonCard key={h.id} hackathon={h} />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
    
  );
}

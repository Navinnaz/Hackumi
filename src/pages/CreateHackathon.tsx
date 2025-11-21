import React, { useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { createHackathon } from "@/lib/hackathons";
import { useNavigate, Link } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";

export default function CreateHackathonForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    prize: "",
    image_url: "",
    participation_type: "Individual" as "Individual" | "Team",
    max_team_size: 1,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please sign in");

    setSaving(true);
    try {
      await createHackathon({ ...form, created_by: user.id });
      navigate("/hackathons");
    } catch (err: any) {
      console.error("Create failed", err);
      alert(err.message || "Failed to create hackathon");
    } finally {
      setSaving(false);
    }
  };

  const isTeam = form.participation_type === "Team";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 md:mb-8 text-navy font-bold hover:text-orange transition-colors">
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            Back to Home
          </Link>

          <div className="max-w-2xl mx-auto relative">
            <div className="bg-off-white border-2 border-black shadow-brutal-lg p-8 md:p-12">
              <div className="mb-6 md:mb-8">
                <div className="inline-block border-4 border-black bg-orange px-2 py-1 md:px-3 md:py-1 mb-4 shadow-brutal-sm">
                  <span className="text-xs md:text-sm font-black uppercase text-off-white">Create</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-navy uppercase mb-2">Create Hackathon</h1>
                <p className="text-navy/70 font-semibold text-sm md:text-base">Fill in the details to post a new hackathon</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-black uppercase text-navy">Title</Label>
                  <Input id="title" value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-black uppercase text-navy">Description</Label>
                  <textarea id="description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full p-3 border-4 border-black shadow-brutal-sm rounded-md" rows={4} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date" className="text-sm font-black uppercase text-navy">Start Date</Label>
                    <Input id="start_date" type="datetime-local" value={form.start_date} onChange={(e)=>setForm({...form, start_date: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="end_date" className="text-sm font-black uppercase text-navy">End Date</Label>
                    <Input id="end_date" type="datetime-local" value={form.end_date} onChange={(e)=>setForm({...form, end_date: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-black uppercase text-navy">Location</Label>
                  <Input id="location" value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize" className="text-sm font-black uppercase text-navy">Prize</Label>
                  <Input id="prize" value={form.prize} onChange={(e)=>setForm({...form, prize: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url" className="text-sm font-black uppercase text-navy">Image URL (optional)</Label>
                  <Input id="image_url" value={form.image_url} onChange={(e)=>setForm({...form, image_url: e.target.value})} />
                </div>

                {/* PARTICIPATION TYPE */}
                <div className="space-y-3 pt-4 border-t-2 border-black">
                  <Label className="text-sm font-black uppercase text-navy">Participation Type</Label>
                  <RadioGroup value={form.participation_type} onValueChange={(value) => {
                    setForm({
                      ...form,
                      participation_type: value as "Individual" | "Team",
                      max_team_size: value === "Team" ? 2 : 1
                    });
                  }}>
                    <div className="flex items-center gap-3 p-3 border-2 border-black rounded-md hover:bg-off-white/50 cursor-pointer">
                      <RadioGroupItem value="Individual" id="individual" />
                      <Label htmlFor="individual" className="flex-1 cursor-pointer text-sm font-semibold text-navy">
                        Individual Participation
                      </Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 border-2 border-black rounded-md hover:bg-off-white/50 cursor-pointer">
                      <RadioGroupItem value="Team" id="team" />
                      <Label htmlFor="team" className="flex-1 cursor-pointer text-sm font-semibold text-navy">
                        Team Participation
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* TEAM SIZE - CONDITIONAL */}
                {isTeam && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="max_team_size" className="text-sm font-black uppercase text-navy">
                      Max Team Size (2-5)
                    </Label>
                    <Input
                      id="max_team_size"
                      type="number"
                      min="2"
                      max="5"
                      value={form.max_team_size}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 2 && val <= 5) {
                          setForm({ ...form, max_team_size: val });
                        }
                      }}
                      className="border-4 border-black"
                    />
                    <p className="text-xs text-navy/60">The maximum number of people allowed per team</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={saving}>{saving ? "Creating..." : "Create Hackathon"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

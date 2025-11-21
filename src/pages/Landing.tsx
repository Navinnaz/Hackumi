import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import { Users, Trophy, Calendar, Zap } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import { fetchRecentHackathons, fetchHackathonsByUser, deleteHackathon, type Hackathon } from "@/lib/hackathons";
import HackathonCard from "@/components/HackathonCard";
import SecondaryNav from "@/components/SecondaryNav";
const Landing = () => {
  const { user } = useAuth();
  const [recent, setRecent] = useState<Hackathon[]>([]);
  const [myHackathons, setMyHackathons] = useState<Hackathon[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setRecent([]);
      setMyHackathons([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingDashboard(true);
        const [recentRes, myRes] = await Promise.all([
          fetchRecentHackathons(6),
          fetchHackathonsByUser(user.id),
        ]);

        if (cancelled) return;
        setRecent(recentRes ?? []);
        setMyHackathons(myRes ?? []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        if (!cancelled) setLoadingDashboard(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative z-50">
        <Navbar />
        {user && <SecondaryNav />}
      </div>


      {/* Hero Section */}
      <section className={`container mx-auto px-4 ${user ? "pt-16 md:pt-20" : "pt-6 md:pt-10"} pb-20 md:pb-30`}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block border-4 border-black bg-orange px-4 py-2 shadow-brutal-sm">
              <p className="text-sm font-black uppercase text-off-white">A next-gen hackathon management platform</p>
            </div>

            {/* Dynamic Hero Text based on Auth */}
            {user ? (
              // AUTHENTICATED HERO TEXT
              <>
                <h1 className="text-5xl md:text-7xl font-black leading-none text-navy">
                  Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}!
                </h1>
                <p className="text-xl font-semibold text-navy/80 max-w-md">
                  Explore hackathons, create new events, and manage your profile.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/hackathons">
                    <Button variant="hero" size="lg">View Hackathons</Button>
                  </Link>
                  <Link to="/hackathons/create">
                    <Button variant="outline" size="lg">Create Hackathon</Button>
                  </Link>
                </div>
              </>
            ) : (
              // UNAUTHENTICATED HERO TEXT
              <>
                <h1 className="text-5xl md:text-7xl font-black leading-none text-navy">
                  ORGANIZE.<br />MANAGE.<br /><span className="text-orange">TRACK.</span>
                </h1>
                <p className="text-xl font-semibold text-navy/80 max-w-md">
                  The ultimate platform for running smarter hackathons with automated workflows, real-time tracking, and integrated judging tools.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <Button variant="hero" size="lg">Get started for free!</Button>
                  </Link>
                  <Link to="/hackathons">
                    <Button variant="outline" size="lg">Browse Hackathons!</Button>
                  </Link>
                </div>
              </>
            )}

            {/* METRICS - Only shown if USER IS NOT LOGGED IN */}
            {!user && (
              <div className="flex items-center gap-8 pt-4">
                <div className="border-l-4 border-black pl-4">
                  <p className="text-3xl font-black text-navy">10K+</p>
                  <p className="text-sm font-bold text-navy/70">Expected Active Users</p>
                </div>
                <div className="border-l-4 border-black pl-4">
                  <p className="text-3xl font-black text-navy">500+</p>
                  <p className="text-sm font-bold text-navy/70">Hackathons Managed</p>
                </div>
              </div>
            )}
          </div>

          {/* Hero Visual (Right Side) */}
          <div className="relative">
            <div className="absolute -top-6 -right-8 w-64 h-64 bg-orange border-4 border-black shadow-brutal-lg hidden md:block" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-green border-4 border-black shadow-brutal hidden md:block" />
            <div className="relative bg-navy border-4 border-black shadow-brutal p-8 md:p-12">
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-off-white border-4 border-black p-4 shadow-brutal-sm">
                  <div className="w-12 h-12 bg-orange border-2 border-black" />
                  <div className="flex-1">
                    <div className="h-3 bg-green border-2 border-black mb-2" />
                    <div className="h-3 bg-green/50 border-2 border-black w-2/3" />
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-off-white border-4 border-black p-4 shadow-brutal-sm">
                  <div className="w-12 h-12 bg-green border-2 border-black" />
                  <div className="flex-1">
                    <div className="h-3 bg-orange border-2 border-black mb-2" />
                    <div className="h-3 bg-orange/50 border-2 border-black w-3/4" />
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-off-white border-4 border-black p-4 shadow-brutal-sm">
                  <div className="w-12 h-12 bg-navy border-2 border-black" />
                  <div className="flex-1">
                    <div className="h-3 bg-navy border-2 border-black mb-2" />
                    <div className="h-3 bg-navy/50 border-2 border-black w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Dashboard (If User) vs Features (If Guest) */}
      {user ? (
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar Stats */}
            <div className="col-span-1 bg-off-white border-4 border-black p-6 rounded-lg shadow-brutal-sm h-fit">
              <h3 className="text-xl font-black text-navy mb-4">Your Dashboard</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy/80">Recent hackathons</span>
                  <span className="text-lg font-black">{recent.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy/80">Your hackathons</span>
                  <span className="text-lg font-black">{myHackathons.length}</span>
                </div>
              </div>
              <div className="mt-6">
                <Link to="/hackathons" className="inline-block">
                  <Button variant="hero">Browse All</Button>
                </Link>
                <Link to="/hackathons/create" className="inline-block ml-3">
                  <Button variant="outline">Create</Button>
                </Link>
              </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="col-span-2 space-y-8">
              {/* Recent Hackathons */}
              <div>
                <h3 className="text-2xl font-black text-navy mb-4">Recent Hackathons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recent.map((h) => (
                    <HackathonCard key={h.id} hackathon={h} />
                  ))}
                  {recent.length === 0 && <p className="text-navy/60 italic">No recent hackathons found.</p>}
                </div>
              </div>

              {/* My Events */}
              <div>
                <h3 className="text-2xl font-black text-navy mb-4">Your Events</h3>
                {myHackathons.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myHackathons.map((h) => (
                      <div key={h.id} className="space-y-2">
                        <HackathonCard hackathon={h} />
                        <div className="flex gap-2">
                          <Link to={`/hackathons/${h.id}/edit`} className="inline-block">
                            <Button variant="outline">Edit</Button>
                          </Link>
                          <Button
                            variant="default"
                            className="bg-red-600 text-off-white border-4 border-black hover:bg-red-700"
                            onClick={async () => {
                              if (!h.id) return;
                              if (!confirm("Delete this hackathon? This action cannot be undone.")) return;
                              try {
                                setDeletingId(h.id);
                                await deleteHackathon(h.id);
                                setMyHackathons((prev) => prev.filter((x) => x.id !== h.id));
                                setRecent((prev) => prev.filter((x) => x.id !== h.id));
                              } catch (err) {
                                console.error("Delete failed", err);
                                alert("Failed to delete hackathon");
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                            disabled={deletingId === h.id}
                          >
                            {deletingId === h.id ? "Deleting..." : "Delete"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-navy/70">You haven't created any hackathons yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        // GUEST CONTENT
        <>
          {/* Features Section */}
          <section className="bg-green border-y-4 border-black py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black text-navy mb-4 uppercase">Why Choose Us?</h2>
                <p className="text-xl font-semibold text-navy/80 max-w-2xl mx-auto">Everything you need to run successful hackathons in one single powerful platform</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard icon={Users} title="Team Management" description="Build and manage your dream team with powerful collaboration tools" color="navy" />
                <FeatureCard icon={Calendar} title="Event Scheduling" description="Plan and track hackathon timelines with our intuitive calendar system" color="orange" />
                <FeatureCard icon={Trophy} title="Judging System" description="Fair and transparent evaluation process with real-time leaderboards" color="green" />
                <FeatureCard icon={Zap} title="Real-time Updates" description="Stay connected with instant notifications and live activity feeds" color="navy" />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20 md:py-32">
            <div className="bg-orange border-4 border-black shadow-brutal-lg p-8 md:p-16 text-center">
              <h2 className="text-4xl md:text-6xl font-black text-off-white mb-6 uppercase">Ready to Start Building?</h2>
              <p className="text-xl font-semibold text-off-white/90 mb-8 max-w-2xl mx-auto">Join the community of innovators and start your hackathon journey today. No credit card required.</p>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="bg-off-white text-orange border-4 border-black shadow-brutal hover:bg-navy hover:text-off-white">Create Free Account</Button>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-navy border-t-4 border-black py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-off-white font-bold">
            © 2025 FoundationStack | Built with <span className="text-orange">❤️</span> for students, communities, universities :)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
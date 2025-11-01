import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import { Users, Trophy, Calendar, Zap } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block border-4 border-black bg-orange px-4 py-2 shadow-brutal-sm">
              <p className="text-sm font-black uppercase text-off-white">
                Next-Gen Hackathon Platform
              </p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-none text-navy">
              BUILD.<br />
              COMPETE.<br />
              <span className="text-orange">WIN.</span>
            </h1>
            
            <p className="text-xl font-semibold text-navy/80 max-w-md">
              The ultimate platform for organizing, managing, and participating in hackathons. 
              Join thousands of innovators worldwide.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button variant="hero" size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="border-l-4 border-black pl-4">
                <p className="text-3xl font-black text-navy">10K+</p>
                <p className="text-sm font-bold text-navy/70">Active Users</p>
              </div>
              <div className="border-l-4 border-black pl-4">
                <p className="text-3xl font-black text-navy">500+</p>
                <p className="text-sm font-bold text-navy/70">Hackathons</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-orange border-4 border-black shadow-brutal-lg hidden md:block" />
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

      {/* Features Section */}
      <section className="bg-green border-y-4 border-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-navy mb-4 uppercase">
              Why Choose Us?
            </h2>
            <p className="text-xl font-semibold text-navy/80 max-w-2xl mx-auto">
              Everything you need to run successful hackathons in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Users}
              title="Team Management"
              description="Build and manage your dream team with powerful collaboration tools"
              color="navy"
            />
            <FeatureCard
              icon={Calendar}
              title="Event Scheduling"
              description="Plan and track hackathon timelines with our intuitive calendar system"
              color="orange"
            />
            <FeatureCard
              icon={Trophy}
              title="Judging System"
              description="Fair and transparent evaluation process with real-time leaderboards"
              color="green"
            />
            <FeatureCard
              icon={Zap}
              title="Real-time Updates"
              description="Stay connected with instant notifications and live activity feeds"
              color="navy"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="bg-orange border-4 border-black shadow-brutal-lg p-8 md:p-16 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-off-white mb-6 uppercase">
            Ready to Start Building?
          </h2>
          <p className="text-xl font-semibold text-off-white/90 mb-8 max-w-2xl mx-auto">
            Join the community of innovators and start your hackathon journey today. 
            No credit card required.
          </p>
          <Link to="/signup">
            <Button variant="outline" size="lg" className="bg-off-white text-orange border-4 border-black shadow-brutal hover:bg-navy hover:text-off-white">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy border-t-4 border-black py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-off-white font-bold">
            © 2025 HACKATHON. Built with <span className="text-orange">❤️</span> for innovators.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

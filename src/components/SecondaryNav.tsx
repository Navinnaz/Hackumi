import { Link, useLocation } from "react-router-dom";
import { Users, Calendar, Trophy, Activity, Zap } from "lucide-react"; // NO Settings import here
import { useEffect, useRef, useState } from "react";
import "../index.css";

export default function SecondaryNav() {
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path;

  const [scrolled, setScrolled] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(64);
  const [secondaryHeight, setSecondaryHeight] = useState(56);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const measure = () => {
      const bn = document.getElementById("main-navbar");
      setNavbarHeight(bn?.offsetHeight ?? 64);
      setSecondaryHeight(navRef.current?.offsetHeight ?? 56);
    };

    measure();
    window.addEventListener("resize", measure);
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // small negative overlap so content sits a bit higher under the nav (prevents a large empty gap)
  const OVERLAP = 80; // px
  const spacerHeight = scrolled
    ? Math.max(0, secondaryHeight - OVERLAP)
    : Math.max(0, navbarHeight + secondaryHeight - OVERLAP);

  // transition timing used for both spacer and nav for a smooth feel
  const transition = "top 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 200ms";

  return (
    <>
      {/* Spacer so content doesn't jump when secondary nav is fixed below the top Navbar */}
      <div
        style={{
          height: `${spacerHeight}px`,
          transition: "height 220ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />

      <nav
        ref={(el) => (navRef.current = el)}
        className="fixed left-0 right-0 z-40 backdrop-blur-lg border-b"
        style={{
          top: scrolled ? 0 : navbarHeight,
          transition,
          willChange: "top, box-shadow, background-color",  
          // darker, layered shadow when stuck; softer when below navbar
          boxShadow: scrolled
            ? "0 22px 60px rgba(3,12,33,0.55), 0 8px 24px rgba(0,0,0,0.28)"
            : "0 8px 30px rgba(3,12,33,0.15), 0 4px 12px rgba(0,0,0,0.08)",
          // slightly darker background when scrolled to improve contrast
          backgroundColor: scrolled ? " rgba(211, 197, 197, 0.6)" : "rgba(255, 255, 255, 0.22)",
          borderColor: scrolled ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
        }}
        aria-label="Secondary navigation"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <ul className="flex items-center justify-center py-3 gap-8">
            <li>
              <Link
                to="/teams"
                className={`nav-pill ${isActive("/teams") ? "nav-pill-active" : ""}`}
              >
                <Users className="w-5 h-5" />
                <span>Manage Teams</span>
              </Link>
            </li>

            <li>
              <Link
                to="/hackathons"
                className={`nav-pill ${isActive("/hackathons") ? "nav-pill-active" : ""}`}
              >
                <Calendar className="w-5 h-5" />
                <span>Explore Hackathons</span>
              </Link>
            </li>

            <li>
              <Link
                to="/projects"
                className={`nav-pill ${isActive("/projects") ? "nav-pill-active" : ""}`}
              >
                <Trophy className="w-5 h-5" />
                <span>Projects</span>
              </Link>
            </li>

            <li>
              <Link
                to="/events"
                className={`nav-pill ${isActive("/events") ? "nav-pill-active" : ""}`}
              >
                <Activity className="w-5 h-5" />
                <span>Track Event</span>
              </Link>
            </li>

            <li>
              <Link
                to="/leaderboard"
                className={`nav-pill ${isActive("/leaderboard") ? "nav-pill-active" : ""}`}
              >
                <Zap className="w-5 h-5" />
                <span>Leaderboard</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

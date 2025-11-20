import { Link, useLocation } from "react-router-dom";
import { Users, Calendar, Trophy, Activity, Zap } from "lucide-react"; // NO Settings import here
import "../index.css";

export default function SecondaryNav() {
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Spacer so content doesn't jump when secondary nav is sticky below the top Navbar */}
      <div className="h-25" />

      <nav
        className="
          sticky top-16 z-40
          backdrop-blur-md bg-white/30
          border-b border-white/20 shadow-md
        "
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
                <span>View Hackathons</span>
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
                <span>Track Events</span>
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

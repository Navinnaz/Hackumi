import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Code2, LogOut, Settings, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAuthPage =
    location.pathname === "/signin" || location.pathname === "/signup";
  const isProfilePage = location.pathname === "/profile";


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    window.location.href = "/";
  };

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || user?.email || "User"
    )}&background=random`;

  return (
          <nav
            id="main-navbar"
            className={`bg-navy border-b-4 border-black shadow-md w-full 
              ${isProfilePage ? "fixed top-0 left-0 z-[99999]" : ""}
            `}
          >
          
      <div className="w-full">
        {/* 🔥 FULL WIDTH — no max-w container */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 w-full">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="p-1.5 md:p-2 bg-orange border-4 border-black shadow-brutal-sm
                          group-hover:translate-x-[2px] group-hover:translate-y-[2px]
                          group-hover:shadow-none transition-all"
            >
              <Code2 className="h-5 w-5 md:h-6 md:w-6 text-off-white" />
            </div>
            <span className="text-xl md:text-2xl font-black text-off-white tracking-tight">
              HACK<span className="text-orange">UMI</span>
            </span>
          </Link>

          {/* Right Side */}
          {!isAuthPage && (
            <div className="flex items-center gap-2 md:gap-4">
              {user ? (
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full border-2 border-orange cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                  />

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white border-2 border-black 
                                 rounded-lg shadow-lg text-sm font-bold text-navy z-50"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-orange hover:text-white"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        Profile
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-orange hover:text-white"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </Link>

                      <button
                        className="flex items-center w-full px-4 py-2 hover:bg-orange hover:text-white"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} className="mr-2" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/signin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-off-white border-off-white hover:bg-off-white hover:text-navy text-sm md:text-base"
                    >
                      Sign In
                    </Button>
                  </Link>

                  <Link to="/signup">
                    <Button variant="hero" size="sm" className="text-sm md:text-base">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

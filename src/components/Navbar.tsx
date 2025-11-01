import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <nav className="border-b-4 border-black bg-navy">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-orange border-4 border-black shadow-brutal-sm group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
              <Code2 className="h-6 w-6 text-off-white" />
            </div>
            <span className="text-2xl font-black text-off-white tracking-tight">
              HACK<span className="text-orange">ATHON</span>
            </span>
          </Link>

          {!isAuthPage && (
            <div className="flex items-center gap-4">
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="text-off-white border-off-white hover:bg-off-white hover:text-navy">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20 lg:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6 md:mb-8">
            <div className="inline-block border-4 border-black bg-orange px-3 py-1 md:px-4 md:py-2 shadow-brutal-sm mb-6 md:mb-8">
              <p className="text-xs md:text-sm font-black uppercase text-off-white">
                Page Not Found
              </p>
            </div>

            <div className="mb-6 md:mb-8">
              <AlertTriangle className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 mx-auto text-orange mb-4" />
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-navy mb-4">404</h1>
              <h2 className="text-xl md:text-2xl lg:text-4xl font-black text-navy uppercase mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-base md:text-lg font-semibold text-navy/80 max-w-md mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <Link to="/">
                <Button variant="hero" size="lg" className="mr-2 md:mr-4 w-full sm:w-auto">
                  <Home className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={() => window.history.back()} className="w-full sm:w-auto">
                Go Back
              </Button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-16 md:top-20 right-4 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-orange border-4 border-black shadow-brutal hidden lg:block -z-10" />
          <div className="absolute bottom-16 md:bottom-20 left-4 w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-green border-4 border-black shadow-brutal hidden lg:block -z-10" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;

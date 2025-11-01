import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      toast.success("Sign in successful! 🎉");
      // Simulate navigation to dashboard
      setTimeout(() => navigate("/"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-navy font-bold hover:text-orange transition-colors">
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="bg-off-white border-4 border-black shadow-brutal-lg p-8">
            <div className="mb-8">
              <div className="inline-block border-4 border-black bg-green px-3 py-1 mb-4 shadow-brutal-sm">
                <span className="text-sm font-black uppercase text-navy">Welcome Back</span>
              </div>
              <h1 className="text-4xl font-black text-navy uppercase mb-2">Sign In</h1>
              <p className="text-navy/70 font-semibold">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-black uppercase text-navy">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm font-bold text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-black uppercase text-navy">
                    Password
                  </Label>
                  <button type="button" className="text-sm font-bold text-orange hover:text-navy transition-colors">
                    Forgot?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({ ...errors, password: undefined });
                  }}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm font-bold text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-semibold text-navy">
                Don't have an account?{" "}
                <Link to="/signup" className="font-black text-orange hover:text-navy transition-colors">
                  SIGN UP
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 right-4 w-24 h-24 bg-orange border-4 border-black shadow-brutal hidden lg:block -z-10" />
          <div className="absolute bottom-20 left-4 w-32 h-32 bg-green border-4 border-black shadow-brutal hidden lg:block -z-10" />
        </div>
      </div>
    </div>
  );
};

export default SignIn;

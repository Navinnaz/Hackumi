import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/contexts/authContext";

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Email + password sign-in
  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(email)) newErrors.email = "Please enter a valid email address";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        return;
      }

      // Set user in context so Navbar updates immediately
      setUser(data.user);
      toast.success("Signed in successfully! 🎉");
      navigate("/");
    } catch (err) {
      console.error("SignIn error", err);
      toast.error("Unexpected error during sign-in");
    } finally {
      setLoading(false);
    }
  };

  // OAuth sign-in with graceful handling for email conflicts
  const oauthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      // Sign out first to avoid a stale/silent session interfering with provider flows.
      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
        },
      });

      if (error) {
        // Detect the "multiple accounts" server error and show a friendly message
        if (error.message?.includes("Multiple accounts")) {
          toast.error(
            "An account already exists with this email using another provider. Please sign in with that provider (e.g., Google) or link accounts from your profile."
          );
        } else {
          toast.error(error.message || "OAuth sign-in failed. Try again.");
        }
      }
      // If no immediate error, browser will redirect to provider and later back to your app
    } catch (err) {
      console.error("OAuth error", err);
      toast.error("OAuth sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 md:mb-8 text-navy font-bold hover:text-orange transition-colors">
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="bg-off-white border-4 border-black shadow-brutal-lg p-6 md:p-8">
            <div className="mb-6 md:mb-8">
              <div className="inline-block border-4 border-black bg-green px-2 py-1 md:px-3 md:py-1 mb-4 shadow-brutal-sm">
                <span className="text-xs md:text-sm font-black uppercase text-navy">Welcome Back</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-navy uppercase mb-2">Sign In</h1>
              <p className="text-navy/70 font-semibold text-sm md:text-base">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleEmailPasswordSignIn} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-black uppercase text-navy">Email Address</Label>
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
                {errors.email && <p className="text-sm font-bold text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-black uppercase text-navy">Password</Label>
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
                {errors.password && <p className="text-sm font-bold text-red-600 mt-1">{errors.password}</p>}
              </div>

              <Button type="submit" variant="default" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="flex flex-col gap-3">
                <Button onClick={() => oauthSignIn("google")} className="w-full" disabled={loading}>
                  Continue with Google
                </Button>

                <Button onClick={() => oauthSignIn("github")} className="w-full" disabled={loading}>
                  Continue with GitHub
                </Button>
              </div>
            </div>

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

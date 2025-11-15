// src/pages/SignUp.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/supabaseClient";
// try both possible import casings — use the one in your project
import { useAuth } from "@/contexts/authContext"; // if your file is authContext.tsx (lowercase)
// import { useAuth } from "@/contexts/AuthContext"; // uncomment if your context file is AuthContext.tsx

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  // Try to get setUser from your AuthContext — if not available we'll skip setting it
  const auth = useAuth?.() as any;
  const setUser = auth?.setUser;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // EMAIL + PASSWORD SIGN UP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // client-side validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = "Password must include uppercase, lowercase, and number";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // sign up with Supabase; add user's name to user_metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        // common friendly messages
        if (error.message?.toLowerCase().includes("duplicate") || error.message?.toLowerCase().includes("already")) {
          toast.error("An account with this email already exists. Try signing in.");
        } else {
          toast.error(error.message || "Sign up failed. Try again.");
        }
        console.error("SignUp error:", error);
        return;
      }

      // If Supabase returns a user object and a session (auto-confirmed), we are signed in immediately
      if (data?.user) {
        // update global user state if context method exists
        try { setUser && setUser(data.user); } catch(e) { /* ignore if setUser not provided */ }

        toast.success("Account created and confirm email! 🎉");
        navigate("/");
        return;
      }

      // Otherwise: typical flow — user must confirm email
      toast.success("Account created. Check your email to confirm your account.");
      // you might still want to redirect the user to the home or a "Check your email" page
      navigate("/");
    } catch (err) {
      console.error("Unexpected sign-up error:", err);
      toast.error("Unexpected error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // OAUTH SIGN UP (Google / GitHub)
  const oauthSignUp = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      // sign out local session first to avoid silent reuse
      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
        },
      });

      if (error) {
        // handle multiple accounts error gracefully
        if (error.message?.includes("Multiple accounts")) {
          toast.error("An account already exists with this email using another provider. Please sign in with that provider (e.g., Google) or link accounts from your profile.");
        } else {
          toast.error(error.message || "OAuth sign-up failed. Try again.");
        }
        console.error("OAuth error:", error);
      }
      // If no immediate error, the browser will redirect to provider and later back to your app
    } catch (err) {
      console.error("OAuth start error:", err);
      toast.error("Failed to start OAuth flow.");
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

        <div className="max-w-md mx-auto relative">
          <div className="bg-off-white border-4 border-black shadow-brutal-lg p-6 md:p-8">
            <div className="mb-6 md:mb-8">
              <div className="inline-block border-4 border-black bg-orange px-2 py-1 md:px-3 md:py-1 mb-4 shadow-brutal-sm">
                <span className="text-xs md:text-sm font-black uppercase text-off-white">Join Us</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-navy uppercase mb-2">Sign Up</h1>
              <p className="text-navy/70 font-semibold text-sm md:text-base">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-black uppercase text-navy">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm font-bold text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-black uppercase text-navy">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm font-bold text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-black uppercase text-navy">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm font-bold text-red-600 mt-1">{errors.password}</p>}
                <p className="text-xs font-semibold text-navy/60 mt-1">Min. 8 characters with uppercase, lowercase, and number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-black uppercase text-navy">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && <p className="text-sm font-bold text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-semibold text-navy">
                Already have an account?{" "}
                <Link to="/signin" className="font-black text-orange hover:text-navy transition-colors">SIGN IN</Link>
              </p>
            </div>

            {/* Social Sign Up Section */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-20 bg-navy/30" />
                <span className="text-navy/70 text-sm font-semibold">or sign up with</span>
                <div className="h-px w-20 bg-navy/30" />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center gap-3 mt-4">
                <Button
                  onClick={() => oauthSignUp("google")}
                  variant="outline"
                  className="w-full md:w-auto bg-white border-2 border-navy text-navy font-bold hover:bg-orange hover:text-off-white transition-all"
                  disabled={loading}
                >
                  <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-5 w-5 mr-2" />
                  Continue with Google
                </Button>

                <Button
                  onClick={() => oauthSignUp("github")}
                  variant="outline"
                  className="w-full md:w-auto bg-white border-2 border-navy text-navy font-bold hover:bg-navy hover:text-off-white transition-all"
                  disabled={loading}
                >
                  <img src="https://www.svgrepo.com/show/475654/github-color.svg" alt="GitHub" className="h-5 w-5 mr-2" />
                  Continue with GitHub
                </Button>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-navy border-4 border-black shadow-brutal hidden lg:block -z-10" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green border-4 border-black shadow-brutal hidden lg:block -z-10" />
        </div>
      </div>
    </div>
  );
};

export default SignUp;

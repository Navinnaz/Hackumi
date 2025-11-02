import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must include uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      toast.success("Account created successfully! 🎉");
      setTimeout(() => navigate("/"), 1500);
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
                <Label htmlFor="name" className="text-sm font-black uppercase text-navy">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm font-bold text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-black uppercase text-navy">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm font-bold text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-black uppercase text-navy">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm font-bold text-red-600 mt-1">{errors.password}</p>
                )}
                <p className="text-xs font-semibold text-navy/60 mt-1">
                  Min. 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-black uppercase text-navy">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm font-bold text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full">
                Create Account
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-semibold text-navy">
                Already have an account?{" "}
                <Link to="/signin" className="font-black text-orange hover:text-navy transition-colors">
                  SIGN IN
                </Link>
              </p>
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

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/supabaseClient";
import { useAuth } from "@/contexts/authContext";
import type { Profile } from "@/pages/ProfilePage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Embedded SVG data URI used as a safe offline placeholder avatar
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect fill='%23e5e7eb' width='100%25' height='100%25'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='40' fill='%236b7280'>?</text></svg>";

interface ProfileEditorProps {
  profile: Profile | null;
  onProfileUpdated: () => void;
}

export default function ProfileEditor({
  profile,
  onProfileUpdated,
}: ProfileEditorProps) {
  const { user } = useAuth();

  const [form, setForm] = useState<Profile>({
    id: "",
    full_name: "",
    username: "",
    bio: "",
    country: "",
    avatar_url: "",
    updated_at: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculateProgress = (data: Profile) => {
    const required = [
      "full_name",
      "username",
      "bio",
      "country",
      "avatar_url",
    ] as const;

    const filled = required.filter((field) => {
      const value = data[field];
      return value && value.trim() !== "";
    }).length;

    return Math.round((filled / required.length) * 100);
  };

  useEffect(() => {
    if (profile) {
      setForm(profile);
      setProgress(calculateProgress(profile));
    }
  }, [profile]);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);

    const updates = {
      ...form,
      id: user.id,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = (await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)) as unknown as {
        data: Profile[] | null;
        error: any;
      };

      if (error) {
        console.error("Update failed:", error);
        alert("Profile update failed");
      } else if (!data || data.length === 0) {
        const { error: insertError } = (await supabase
          .from("profiles")
          .upsert([updates], {
            onConflict: "id",
          })) as { data: Profile[] | null; error: any };

        if (insertError) {
          console.error("Insert failed:", insertError);
          if ((insertError as any)?.code === "42501") {
            alert(
              "Profile insert blocked by RLS. Add a policy allowing authenticated users to create their own profile."
            );
          } else {
            alert("Profile insert failed");
          }
        } else {
          alert("Profile created successfully!");
        }
      } else {
        alert("Profile updated successfully!");
      }

      onProfileUpdated();
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const updated = { ...form, avatar_url: data.publicUrl };

      setForm(updated);
      setProgress(calculateProgress(updated));
    } catch (err) {
      console.error(err);
      alert("Unable to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-navy font-black text-xl">
              Please sign in to manage teams
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 🔥 NAVBAR OUTSIDE WRAPPER — FULL WIDTH */}
      <Navbar />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 md:mb-8 text-navy font-bold hover:text-orange transition-colors"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            Back to Home
          </Link>

          <div className="max-w-md mx-auto relative">
            <div className="bg-off-white border-4 border-black shadow-brutal-lg p-6 md:p-8">
              {/* Header */}
              <div className="mb-6 md:mb-8">
                <div className="inline-block border-4 border-black bg-orange px-2 py-1 md:px-3 md:py-1 mb-4 shadow-brutal-sm">
                  <span className="text-xs md:text-sm font-black uppercase text-off-white">
                    Profile
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-navy uppercase mb-2">
                  Edit Profile
                </h1>
                <p className="text-navy/70 font-semibold text-sm md:text-base">
                  Update your profile information
                </p>
              </div>

              {/* Progress */}
              <div className="mb-5">
                <p className="text-sm text-navy mb-1 font-semibold">
                  Profile Completion: {progress}%
                </p>
                <div className="border-4 border-black shadow-brutal-sm bg-off-white h-4 w-full overflow-hidden rounded-lg">
                  <div
                    className="h-full bg-orange transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="flex items-center gap-4 mb-5">
                <img
                  src={form.avatar_url || DEFAULT_AVATAR}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      DEFAULT_AVATAR;
                  }}
                  className="w-20 h-20 rounded-full object-cover border-4 border-black shadow-brutal-sm"
                />
                <label className="cursor-pointer bg-orange px-3 py-1 rounded-md border-4 border-black shadow-brutal-sm font-bold text-off-white hover:bg-navy transition-colors">
                  {uploading ? "Uploading..." : "Change Photo"}
                  <input type="file" hidden onChange={uploadAvatar} />
                </label>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="full_name"
                    className="text-sm font-black uppercase text-navy"
                  >
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-black uppercase text-navy"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="text-sm font-black uppercase text-navy"
                  >
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) =>
                      setForm({ ...form, bio: e.target.value })
                    }
                    className="w-full p-3 border-4 border-black shadow-brutal-sm rounded-md"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-sm font-black uppercase text-navy"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) =>
                      setForm({ ...form, country: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleUpdate}
                variant="hero"
                size="lg"
                className="w-full mt-6"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Decorative Blocks */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-navy border-4 border-black shadow-brutal hidden lg:block -z-10" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-green border-4 border-black shadow-brutal hidden lg:block -z-10" />
          </div>
        </div>
      </div>
    </>
  );
}

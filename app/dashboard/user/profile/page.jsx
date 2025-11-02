"use client"; // must be first line (no space or comment above)

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Save, User, Lock } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });

  // ✅ Load user profile (auto-create if missing)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error("Please log in again.");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email, whatsapp")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Profile fetch error:", error.message);
          toast.error("Error fetching profile.");
        } else if (!data) {
          // 🆕 Create profile if missing
          const { error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: user.id,
                email: user.email,
                full_name: "",
                whatsapp: "",
                role: "user",
              },
            ]);
          if (insertError)
            console.error("Auto-create profile error:", insertError.message);
          setProfile({
            full_name: "",
            email: user.email,
            whatsapp: "",
          });
        } else {
          setProfile({
            full_name: data.full_name || "",
            email: data.email || user.email,
            whatsapp: data.whatsapp || "",
          });
        }
      } catch (err) {
        console.error("Profile load exception:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Save profile
  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: profile.email,
        full_name: profile.full_name,
        whatsapp: profile.whatsapp,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Save error:", err.message);
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Change password
  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setPasswords({ new: "", confirm: "" });
    } catch (err) {
      console.error("Password error:", err.message);
      toast.error("Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 size={30} className="animate-spin text-[#142B6F]" />
        <p className="mt-3 text-sm">Loading your profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 max-w-3xl mx-auto space-y-10"
    >
      {/* 🧍 Profile Info */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#FFD601]/30 flex items-center justify-center">
            <User size={24} className="text-[#142B6F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#142B6F]">My Profile</h1>
        </div>

        {/* Full Name */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FFD601]/50 outline-none text-gray-700"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={profile.whatsapp}
              onChange={(e) =>
                setProfile({ ...profile, whatsapp: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FFD601]/50 outline-none text-gray-700"
              placeholder="e.g. +233501234567"
            />
          </div>

          {/* Save Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full flex justify-center items-center gap-2 bg-[#142B6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1A2D7A] transition-all disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* 🔒 Password Section */}
      <div>
        <div className="flex items-center gap-3 mb-6 mt-12">
          <div className="w-12 h-12 rounded-full bg-[#142B6F]/10 flex items-center justify-center">
            <Lock size={22} className="text-[#142B6F]" />
          </div>
          <h2 className="text-xl font-bold text-[#142B6F]">Change Password</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords({ ...passwords, new: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FFD601]/50 outline-none text-gray-700"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FFD601]/50 outline-none text-gray-700"
              placeholder="Confirm new password"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="w-full flex justify-center items-center gap-2 bg-[#FFD601] text-[#142B6F] py-3 rounded-xl font-semibold hover:bg-[#ffde33] transition-all disabled:opacity-70"
          >
            {changingPassword ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Updating...
              </>
            ) : (
              <>
                <Lock size={18} />
                Update Password
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

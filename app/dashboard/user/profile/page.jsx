"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Save, User, Lock } from "lucide-react";
import toast from "react-hot-toast";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // For password change
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // ✅ Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Please log in again.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, whatsapp")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Could not fetch profile.");
      } else {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || user.email,
          whatsapp: data.whatsapp || "",
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  // ✅ Update profile details
  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        whatsapp: profile.whatsapp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } else {
      toast.success("Profile updated successfully!");
    }

    setSaving(false);
  };

  // ✅ Change password
  const handleChangePassword = async () => {
    if (!passwords.new || !passwords.confirm) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    });

    if (error) {
      console.error(error);
      toast.error("Failed to change password.");
    } else {
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    }

    setChangingPassword(false);
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
      {/* 🧍 User Info Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#FFD601]/30 flex items-center justify-center">
            <User size={24} className="text-[#142B6F]" />
          </div>
          <h1 className="text-2xl font-bold text-[#142B6F]">My Profile</h1>
        </div>

        <div className="space-y-5">
          {/* Full Name */}
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
            <p className="text-xs text-gray-400 mt-1">
              (Your account email cannot be changed)
            </p>
          </div>

          {/* WhatsApp Number */}
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
}

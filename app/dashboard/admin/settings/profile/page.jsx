"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState({ id: "", full_name: "", phone: "" });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    });
  }, []);

  const updateProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", profile.id);

    if (error) alert(error.message);
    else alert("✅ Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-[#142B6F] text-white p-6 max-w-lg">
      <h1 className="text-2xl font-bold text-[#FFD601] mb-6">Update Profile</h1>

      <div className="space-y-4">
        <input
          className="p-3 rounded-lg bg-[#1A2D7A] border border-white/20 w-full"
          placeholder="Full Name"
          value={profile.full_name}
          onChange={(e) =>
            setProfile({ ...profile, full_name: e.target.value })
          }
        />

        <input
          className="p-3 rounded-lg bg-[#1A2D7A] border border-white/20 w-full"
          placeholder="Phone Number"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        />

        <button
          onClick={updateProfile}
          className="bg-[#FFD601] text-[#142B6F] px-4 py-2 rounded-lg font-semibold w-full"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { User2, Mail, Phone, Loader2, Calendar, Users } from "lucide-react";

const NAVY = "#142B6F";
const DARK_NAVY = "#0E1F52";
const GOLD = "#FFD601";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // ✅ Delete User API call
  const deleteUser = async (id) => {
    try {
      await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id }),
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  // ✅ Promote
  const promote = async (id) => {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "admin" } : u))
    );
  };

  // ✅ Demote
  const demote = async (id) => {
    await supabase.from("profiles").update({ role: "user" }).eq("id", id);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: "user" } : u))
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E1F52]">
        <Loader2
          size={38}
          className="text-[#FFD601] animate-spin"
          strokeWidth={2.5}
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0E1F52] text-white p-6 sm:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FFD601] mb-1">
            Users Management
          </h1>
          <p className="text-gray-300 text-sm">
            View and manage all registered RoomQuest users
          </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className="mt-4 sm:mt-0 bg-[#FFD601]/10 border border-[#FFD601]/40 rounded-xl shadow-md px-6 py-4 flex items-center gap-3 text-white"
        >
          <Users size={24} className="text-[#FFD601]" />
          <div>
            <p className="text-xs uppercase text-[#FFD601]/90 font-semibold">
              Total Users
            </p>
            <p className="text-xl font-bold text-white">{users.length}</p>
          </div>
        </motion.div>
      </div>

      {/* ✅ NEW CARD VIEW */}
      {users.length === 0 ? (
        <div className="text-center text-gray-300 py-20 text-lg">
          No registered users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#132863]/80 backdrop-blur-md border border-[#FFD601]/30 rounded-2xl shadow-lg p-5 hover:shadow-[#FFD601]/30 hover:-translate-y-1 transition-all"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-[#FFD601]/20 border border-[#FFD601]/40 flex items-center justify-center">
                  <User2 size={26} className="text-[#FFD601]" />
                </div>
              </div>

              {/* Name */}
              <h2 className="text-lg font-semibold text-center text-white">
                {u.full_name || "Unnamed User"}
              </h2>

              {/* Email */}
              <p className="text-xs text-gray-300 text-center mt-1 flex justify-center items-center gap-1">
                <Mail size={12} className="text-[#FFD601]" /> {u.email || "—"}
              </p>

              {/* Phone */}
              <p className="text-xs text-gray-300 text-center mt-1 flex justify-center items-center gap-1">
                <Phone size={12} className="text-[#FFD601]" /> {u.phone || "—"}
              </p>

              {/* Role Badge */}
              <div className="mt-4 flex justify-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    u.role === "admin"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[#FFD601]/20 text-[#FFD601]"
                  }`}
                >
                  {u.role}
                </span>
              </div>

              {/* ✅ Action Buttons */}
              <div className="mt-5 flex justify-center gap-2 flex-wrap">
                {u.role === "admin" ? (
                  <button
                    onClick={() => demote(u.id)}
                    className="px-3 py-1 text-sm rounded-md bg-[#FFD601] text-black font-semibold"
                  >
                    Demote
                  </button>
                ) : (
                  <button
                    onClick={() => promote(u.id)}
                    className="px-3 py-1 text-sm rounded-md bg-green-500 text-white font-semibold"
                  >
                    Promote
                  </button>
                )}

                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-3 py-1 text-sm rounded-md bg-red-500 text-white font-semibold"
                >
                  Delete
                </button>
              </div>

              {/* Joined Date */}
              <p className="text-center text-gray-400 text-xs mt-3 flex justify-center items-center gap-1">
                <Calendar size={12} />{" "}
                {new Date(u.created_at).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

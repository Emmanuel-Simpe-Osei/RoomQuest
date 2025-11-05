"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  User2,
  Mail,
  Phone,
  Shield,
  Loader2,
  Calendar,
  Users,
} from "lucide-react";

const NAVY = "#142B6F";
const DARK_NAVY = "#0E1F52";
const GOLD = "#FFD601";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users from Supabase profiles table
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, role, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

      {/* Table Section */}
      {users.length === 0 ? (
        <div className="text-center text-gray-300 py-20 text-lg">
          No registered users found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#132863]/80 backdrop-blur-sm shadow-xl rounded-2xl border border-[#FFD601]/20">
          <table className="min-w-full text-sm text-gray-100">
            <thead className="bg-[#FFD601]/10 text-[#FFD601] uppercase text-xs border-b border-[#FFD601]/30">
              <tr>
                <th className="py-3 px-4 text-left">User</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-center">Role</th>
                <th className="py-3 px-4 text-center">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[#FFD601]/10 hover:bg-[#1A2D7A]/50 transition-all"
                >
                  {/* Name */}
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFD601]/20 border border-[#FFD601]/40 flex items-center justify-center">
                      <User2 size={18} className="text-[#FFD601]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {u.full_name || "Unnamed User"}
                      </p>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Shield size={11} /> ID: {u.id.slice(0, 8)}...
                      </p>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 text-gray-300 flex items-center gap-2">
                    <Mail size={13} className="text-[#FFD601]" />
                    {u.email || "—"}
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-4 text-gray-300 flex items-center gap-2">
                    <Phone size={13} className="text-[#FFD601]" />
                    {u.phone || "—"}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-[#FFD601]/20 text-[#FFD601]"
                      }`}
                    >
                      {u.role || "user"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-center text-gray-400 flex items-center justify-center gap-1">
                    <Calendar size={12} />
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import StatCard from "@/components/admin/StatCard";
import { Bed, Building2, Users, Calendar } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Fetch counts from each table
        const [
          { count: roomsCount },
          { count: hostelsCount },
          { count: usersCount },
        ] = await Promise.all([
          supabase.from("rooms").select("*", { count: "exact", head: true }),
          supabase.from("hostels").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);

        // ✅ Count bookings (rooms + hostels)
        const [{ count: roomBookingsCount }, { count: hostelBookingsCount }] =
          await Promise.all([
            supabase
              .from("bookings")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("hostel_bookings")
              .select("*", { count: "exact", head: true }),
          ]);

        setStats({
          rooms: roomsCount || 0,
          hostels: hostelsCount || 0,
          users: usersCount || 0,
          bookings: (roomBookingsCount || 0) + (hostelBookingsCount || 0),
        });

        // ✅ Fetch recent bookings — correct join syntax
        const { data: recent } = await supabase
          .from("bookings")
          .select(
            `
            id,
            created_at,
            status,
            profiles:profiles!bookings_user_id_fkey ( full_name ),
            rooms:rooms!bookings_room_id_fkey ( name )
          `
          )
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentBookings((recent || []).slice(0, 3)); // ✅ Show latest 3 only
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#142B6F] text-[#FFD601] text-lg">
        Loading dashboard...
      </div>
    );
  }

  const statCards = [
    { label: "Total Rooms", value: stats.rooms, Icon: Bed },
    { label: "Total Hostels", value: stats.hostels, Icon: Building2 },
    { label: "Total Users", value: stats.users, Icon: Users },
    { label: "Bookings Made", value: stats.bookings, Icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#142B6F] text-white">
      <div className="pt-16 pb-6 px-4">
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#FFD601] mb-1">
          Dashboard Overview
        </h1>
        <p className="text-white/70 text-sm mb-8">
          Welcome to your admin dashboard
        </p>

        {/* ✅ Stat Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* ✅ Recent Bookings */}
        <div className="bg-[#1A2D7A] rounded-2xl border border-[#FFD601]/40 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#FFD601]">
              Recently Booked
            </h2>

            {/* ✅ Navigation Works Now */}
            <button
              onClick={() => router.push("/dashboard/admin/bookings")}
              className="bg-[#FFD601] text-[#142B6F] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFD601]/90 transition-all"
            >
              View All Bookings
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-center text-gray-300 py-10">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#203785] rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {b.profiles?.full_name || "Unknown User"}
                      </p>
                      <p className="text-white/80 text-xs mt-1">
                        {b.rooms?.name || "Room Unknown"}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        b.status === "Confirmed"
                          ? "bg-green-500/20 text-green-400"
                          : b.status === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {new Date(b.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="h-8"></div>
      </div>
    </div>
  );
}

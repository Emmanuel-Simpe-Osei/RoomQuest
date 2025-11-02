"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function UserDashboardPage() {
  const [userName, setUserName] = useState("");
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user name + booking count
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1️⃣ Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) return;

        // 2️⃣ Get user profile info
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.warn("No profile found, using email fallback");
          setUserName(user.email?.split("@")[0] || "User");
        } else {
          setUserName(profile?.full_name || user.email?.split("@")[0]);
        }

        // 3️⃣ Count user's bookings
        const { count, error: bookingError } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (bookingError) console.error("Booking count error:", bookingError);
        setTotalBookings(count || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="space-y-8">
      {/* 👋 Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-[#142B6F] mb-2">
          {loading ? "Loading..." : `Welcome back, ${userName} 👋🏽`}
        </h1>
        <p className="text-gray-600">
          Here’s your latest RoomQuest booking summary.
        </p>
      </motion.div>

      {/* 📊 Total Bookings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="p-3 rounded-full bg-[#142B6F]/10 text-[#142B6F] flex items-center justify-center">
            <Home size={22} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
            <h3 className="text-lg font-bold text-gray-800">
              {loading ? "..." : totalBookings}
            </h3>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

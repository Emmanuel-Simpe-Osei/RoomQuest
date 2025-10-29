"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import HostelCard from "@/components/public/HostelCard";

const NAVY = "#142B6F";

export default function HostelsPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch hostels (check your actual table name)
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        setLoading(true);

        // 🔥 change "hostels" if your table name differs
        const { data, error } = await supabase
          .from("hostels")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setHostels(data || []);
      } catch (err) {
        console.error("❌ Error fetching hostels:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-6 md:px-16 py-10">
      <div className="max-w-6xl mx-auto">
        {/* 🔹 Header (no extra search bar) */}
        <h1 className="text-3xl font-bold text-[#142B6F] mb-6">
          Explore Available Hostels
        </h1>

        {/* 🔹 Content */}
        {loading ? (
          <div className="text-center text-gray-500 mt-10 animate-pulse">
            Loading hostels...
          </div>
        ) : hostels.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {hostels.map((hostel) => (
              <HostelCard key={hostel.id} hostel={hostel} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center text-gray-600 mt-20">
            No hostels found.
          </div>
        )}
      </div>
    </main>
  );
}

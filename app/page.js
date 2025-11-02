"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import HeroSection from "@/components/public/HeroSection";
import Link from "next/link";
import { Home, ShieldCheck, Smartphone, Wallet } from "lucide-react";

// 🎨 brand colors
const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch featured listings from Supabase
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const [{ data: roomData }, { data: hostelData }] = await Promise.all([
          supabase.from("rooms").select("*").limit(3),
          supabase.from("hostels").select("*").limit(3),
        ]);
        setRooms(roomData || []);
        setHostels(hostelData || []);
      } catch (err) {
        console.error("❌ Error fetching listings:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <main className="min-h-screen">
      {/* 🏠 HERO SECTION */}
      <HeroSection />

      {/* 🌟 FEATURED LISTINGS */}
      <section className="py-16 bg-gray-50 px-6 md:px-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center text-[#142B6F] mb-10"
        >
          Featured Listings
        </motion.h2>

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Loading listings...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...rooms, ...hostels].map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={
                    Array.isArray(item.images)
                      ? item.images[0]
                      : item.images
                      ? JSON.parse(item.images)[0]
                      : "https://via.placeholder.com/400x250"
                  }
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {item.description || "No description available."}
                  </p>
                  <p className="text-[#142B6F] font-bold text-lg">
                    ₵
                    {item.price_per_semester
                      ? item.price_per_semester.toLocaleString()
                      : item.price?.toLocaleString() || "—"}
                  </p>
                  <Link
                    href={
                      item.hostel_type
                        ? `/hostels/${item.id}`
                        : `/rooms/${item.id}`
                    }
                    className="inline-block text-center w-full bg-[#142B6F] text-white font-semibold py-2 rounded-lg hover:bg-[#1a2d7a] transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 💡 WHY CHOOSE ROOMQUEST */}
      <section className="py-20 bg-white text-center px-6 md:px-20">
        <h2 className="text-3xl font-bold text-[#142B6F] mb-12">
          Why Choose RoomQuest
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            {
              icon: <ShieldCheck size={36} className="text-[#FFD601]" />,
              title: "Verified Listings",
              desc: "Every hostel and room is verified by our local agents before appearing online.",
            },
            {
              icon: <Smartphone size={36} className="text-[#FFD601]" />,
              title: "Book Easily",
              desc: "Use your phone to reserve rooms instantly via WhatsApp or Paystack.",
            },
            {
              icon: <Wallet size={36} className="text-[#FFD601]" />,
              title: "Secure Payments",
              desc: "All payments are powered by Paystack with 24/7 security monitoring.",
            },
            {
              icon: <Home size={36} className="text-[#FFD601]" />,
              title: "Variety of Options",
              desc: "Explore hostels, apartments, and single rooms — all in one platform.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg text-[#142B6F] mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🚀 CALL TO ACTION */}
      <section className="py-20 bg-[#142B6F] text-white text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Next Place?
          </h2>
          <p className="text-gray-300 mb-8">
            Browse verified listings or list your own property with ease on
            RoomQuest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/rooms"
              className="bg-[#FFD601] text-[#142B6F] font-semibold px-6 py-3 rounded-full hover:bg-[#f4c900] transition-all"
            >
              Explore Rooms
            </Link>
            <Link
              href="/hostels"
              className="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#142B6F] transition-all"
            >
              View Hostels
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

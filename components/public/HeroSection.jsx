"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Images are now served directly from /public/images/
const heroImages = ["/images/img1.jpg", "/images/img2.jpg", "/images/img3.jpg"];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // 🌀 Auto-rotate backgrounds every 5 seconds
  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % heroImages.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  // 🔍 Search redirect
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/rooms?q=${query}`);
  };

  return (
    <section className="relative h-[100vh] w-full overflow-hidden flex items-center justify-center text-center">
      {/* 🖼 Background slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={heroImages[current]}
            alt="RoomQuest hero background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* 🌟 Hero content */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 max-w-2xl px-6 text-white"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
          Find Safe Rooms & Verified Hostels Across Ghana
        </h1>

        <p className="text-base md:text-lg text-gray-200 mb-8">
          Discover affordable student accommodations near your campus.
        </p>

        {/* 🔍 Search bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="bg-white/90 backdrop-blur-md rounded-full flex items-center px-4 py-2 shadow-lg mb-6 w-full max-w-md mx-auto"
        >
          <Search size={20} className="text-gray-500 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rooms or hostels..."
            className="flex-1 bg-transparent outline-none text-gray-700 text-sm md:text-base"
          />
          <button
            type="submit"
            className="bg-[#142B6F] text-white font-semibold px-5 py-2 rounded-full text-sm md:text-base hover:bg-[#0f2257] transition-all"
          >
            Search
          </button>
        </motion.form>

        {/* 🧭 Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-3 mt-2 w-full max-w-xs mx-auto"
        >
          <Link
            href="/rooms"
            className="flex-1 text-center bg-[#FFD601] text-[#142B6F] font-semibold px-5 py-3 rounded-full hover:bg-[#e6c100] transition-all min-w-[130px]"
          >
            Browse Rooms
          </Link>
          <Link
            href="/hostels"
            className="flex-1 text-center bg-white/10 border border-white text-white font-semibold px-5 py-3 rounded-full hover:bg-white/20 transition-all min-w-[130px]"
          >
            View Hostels
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

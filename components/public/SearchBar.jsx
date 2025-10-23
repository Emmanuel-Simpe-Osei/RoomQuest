"use client";

import { useState, useEffect } from "react"; // ✅ Added these imports
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const GOLD = "#FFD601";
const NAVY = "#142B6F";

export default function SearchBar({ onSearch, value = "" }) {
  const [query, setQuery] = useState(value);

  // 🧠 Debounce input to trigger search automatically after typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full flex items-center justify-center"
    >
      <div className="relative w-full max-w-3xl">
        {/* 🔍 Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>

        {/* ✏️ Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rooms by title, location, type, or price..."
          className="w-full py-4 pl-12 pr-32 bg-white text-gray-800 border border-gray-200 rounded-full 
                     shadow-sm hover:shadow-md focus:border-[#FFD601] focus:ring-2 
                     focus:ring-[#FFD601]/20 focus:outline-none transition-all duration-200"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* 🟡 Search Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#FFD601] 
                     text-[#142B6F] px-6 py-2.5 rounded-full font-semibold hover:bg-[#FFE769] 
                     transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </div>
    </motion.form>
  );
}

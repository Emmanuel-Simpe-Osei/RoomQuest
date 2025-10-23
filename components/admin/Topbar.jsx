"use client";

import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Topbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 🧠 Hide topbar when scrolling down, show when scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          exit={{ y: -80 }}
          transition={{ duration: 0.25 }}
          className="sticky top-0 z-50 w-full bg-[#142B6F] border-b border-[#FFD601]/20 shadow-md"
        >
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            {/* 🟡 Left Section (Hamburger + Title) */}
            <div className="flex items-center space-x-3">
              {/* Hamburger (visible only on mobile) */}
              <button
                className="md:hidden text-[#FFD601] hover:opacity-80 transition"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("toggle-sidebar"))
                }
              >
                <Menu size={26} />
              </button>

              <h1 className="text-lg md:text-2xl font-bold text-[#FFD601]">
                Admin Dashboard
              </h1>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

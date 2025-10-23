"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function NavbarPublic() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // 🧠 Fetch session & role
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setRole(profile?.role);
      }
    };
    getUser();
  }, []);

  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  // Dynamic dashboard route
  const dashboardLink =
    role === "admin" ? "/dashboard/admin" : "/dashboard/user";

  return (
    <>
      {/* Fixed Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: NAVY }}
          >
            Room<span style={{ color: GOLD }}>Quest</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 text-[15px] font-medium">
            <Link href="/" className="hover:text-[#FFD601] transition-colors">
              Home
            </Link>
            <Link
              href="/rooms"
              className="hover:text-[#FFD601] transition-colors"
            >
              Rooms
            </Link>
            <Link
              href="/hostels"
              className="hover:text-[#FFD601] transition-colors"
            >
              Hostels
            </Link>
            <Link
              href="/about"
              className="hover:text-[#FFD601] transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="hover:text-[#FFD601] transition-colors"
            >
              Contact
            </Link>

            {user ? (
              <Link
                href={dashboardLink}
                className="bg-[#FFD601] text-[#142B6F] px-4 py-2 rounded-full font-semibold hover:opacity-90 transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-[#142B6F] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#0f1f54] transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#142B6F] hover:text-[#0f1f54] transition"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Overlay (dim background when menu open) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            {/* Slide-in Drawer */}
            <motion.div
              className="fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white shadow-2xl z-50 flex flex-col justify-between"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <div className="p-6 flex justify-between items-center border-b border-gray-200">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="text-2xl font-extrabold tracking-tight"
                  style={{ color: NAVY }}
                >
                  Room<span style={{ color: GOLD }}>Quest</span>
                </Link>
                <button
                  onClick={closeMenu}
                  className="text-gray-600 hover:text-red-500"
                >
                  <X size={26} />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-6 px-6 mt-8 text-lg font-semibold text-[#142B6F]">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="hover:text-[#FFD601]"
                >
                  Home
                </Link>
                <Link
                  href="/rooms"
                  onClick={closeMenu}
                  className="hover:text-[#FFD601]"
                >
                  Rooms
                </Link>
                <Link
                  href="/hostels"
                  onClick={closeMenu}
                  className="hover:text-[#FFD601]"
                >
                  Hostels
                </Link>
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="hover:text-[#FFD601]"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="hover:text-[#FFD601]"
                >
                  Contact
                </Link>
              </div>

              {/* Bottom CTA */}
              <div className="px-6 mb-8">
                {user ? (
                  <Link
                    href={dashboardLink}
                    onClick={closeMenu}
                    className="block w-full text-center bg-[#FFD601] text-[#142B6F] py-3 rounded-full font-bold hover:opacity-90 transition"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block w-full text-center bg-[#142B6F] text-white py-3 rounded-full font-bold hover:bg-[#0f1f54] transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

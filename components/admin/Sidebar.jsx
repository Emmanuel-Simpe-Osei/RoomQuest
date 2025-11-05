"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bed,
  Building2,
  Users,
  Calendar,
  LogOut,
  X,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // ✅ Logout action
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/"); // back to public homepage
  };

  const links = [
    { name: "Dashboard", href: "/dashboard/admin", icon: Home },
    { name: "Rooms", href: "/dashboard/admin/rooms", icon: Bed },
    { name: "Hostels", href: "/dashboard/admin/hostels", icon: Building2 },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Bookings", href: "/dashboard/admin/bookings", icon: Calendar },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ];

  // Sidebar toggle listener (mobile)
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  // Disable body scroll when open (mobile)
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <>
      {/* 🟡 Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between h-screen w-64 bg-[#142B6F] text-white shadow-lg">
        {/* Logo */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#FFD601]/20">
            <h1 className="text-xl font-bold">
              <span className="text-white">Room</span>
              <span className="text-[#FFD601]">Quest</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-4 space-y-2">
            {links.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className="flex items-center space-x-3 text-white/90 hover:bg-[#FFD601] hover:text-[#142B6F] px-3 py-2 rounded-lg transition"
              >
                <Icon size={18} />
                <span>{name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* ✅ Go to Homepage + Logout */}
        <div className="p-4 border-t border-[#FFD601]/20 space-y-3">
          {/* ✅ Go to Homepage */}
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white/10 text-white border border-white/20 font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition"
          >
            <Home size={18} />
            <span>Go to Homepage</span>
          </button>

          {/* ✅ Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-[#FFD601] text-[#142B6F] font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90 transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* 🟣 Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-64 bg-[#142B6F] z-50 flex flex-col justify-between shadow-xl"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#FFD601]/20">
                  <h1 className="text-xl font-bold">
                    <span className="text-white">Room</span>
                    <span className="text-[#FFD601]">Quest</span>
                  </h1>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[#FFD601]"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Links */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                  {links.map(({ name, href, icon: Icon }) => (
                    <Link
                      key={name}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 text-white/90 hover:bg-[#FFD601] hover:text-[#142B6F] px-3 py-2 rounded-lg transition"
                    >
                      <Icon size={18} />
                      <span>{name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* ✅ Mobile Footer */}
              <div className="p-4 border-t border-[#FFD601]/20 space-y-3">
                {/* Go Home */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/");
                  }}
                  className="w-full bg-white/10 text-white border border-white/20 font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition"
                >
                  <Home size={18} />
                  <span>Go to Homepage</span>
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-[#FFD601] text-[#142B6F] font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90 transition"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

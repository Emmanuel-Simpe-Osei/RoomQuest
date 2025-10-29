"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Home,
  Video, // 🎥 Added for Distance Booking link
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const NAVY = "#142B6F";
const GOLD = "#FFD601";

export default function UserDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  // ✅ Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // ✅ Navigation Links (added Distance Booking)
  const navLinks = [
    { name: "Dashboard", href: "/dashboard/user", icon: LayoutDashboard },
    {
      name: "My Bookings",
      href: "/dashboard/user/bookings",
      icon: ClipboardList,
    },
    { name: "Profile", href: "/dashboard/user/profile", icon: User },
    {
      name: "Distance Booking",
      href: "/dashboard/user/distance-info",
      icon: Video, // 🎥 New icon
    },
    { name: "Support", href: "/dashboard/user/support", icon: MessageCircle },
    { name: "Rooms", href: "/rooms", icon: Home }, // 🔥 Quick room access
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🌙 Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🧭 Sidebar (always visible on desktop) */}
      <aside
        ref={sidebarRef}
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } fixed md:static z-40 md:z-auto w-64 bg-white shadow-lg h-full flex flex-col justify-between transition-transform duration-300`}
      >
        <div>
          {/* Logo Section */}
          <div
            className="flex items-center justify-between p-5 border-b border-gray-100"
            style={{ backgroundColor: GOLD }}
          >
            <h1 className="text-xl font-extrabold tracking-wide text-[#142B6F]">
              RoomQuest
            </h1>
            <button
              className="md:hidden text-[#142B6F]"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col mt-5 space-y-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-r-full transition-all duration-200 ${
                    active
                      ? "bg-[#142B6F] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#142B6F]/10 hover:text-[#142B6F]"
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-3 m-4 text-sm font-semibold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* 📱 Mobile Menu Button */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 bg-[#142B6F] text-white p-2 rounded-md shadow-lg"
        >
          <Menu size={20} />
        </button>
      )}

      {/* 📤 Main Section */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 🧭 Top Navbar (Desktop) */}
        <header className="hidden md:flex items-center justify-between w-full h-16 bg-white border-b border-gray-100 shadow-sm px-8">
          <h1 className="text-xl font-bold text-[#142B6F]">User Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Hi, Emmanuel 👋🏽</span>
            <div className="w-10 h-10 rounded-full bg-[#FFD601]/40 flex items-center justify-center text-[#142B6F] font-bold">
              E
            </div>
          </div>
        </header>

        {/* 📄 Main Content */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

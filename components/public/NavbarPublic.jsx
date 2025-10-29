"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Menu, X, Search, LogIn, LogOut, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

export default function NavbarPublic() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [session, setSession] = useState(null);
  const sidebarRef = useRef(null);

  // ✅ Screen size detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Supabase auth session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, newSession) => setSession(newSession)
    );
    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push("/login");
  };

  // ✅ Close drawer if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ✅ Search bar settings
  const showSearch =
    pathname.startsWith("/rooms") || pathname.startsWith("/hostels");
  const placeholder = pathname.includes("/hostels")
    ? "Search hostels..."
    : "Search rooms...";

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("q", val);
    else params.delete("q");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // ✅ Add Home link to navigation
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/rooms" },
    { name: "Hostels", href: "/hostels" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      {/* 🔹 MOBILE TOPBAR */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <h1 className="text-xl font-extrabold text-[#142B6F]">
              Room<span className="text-[#FFD601]">Quest</span>
            </h1>
          </Link>

          {/* Search bar (always visible) */}
          {showSearch && (
            <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 w-[65%] shadow-sm">
              <Search size={18} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleSearch}
                className="bg-transparent outline-none text-sm text-gray-700 flex-1"
              />
            </div>
          )}

          {/* Hamburger button */}
          <button
            onClick={() => setOpen(!open)}
            className="text-[#142B6F] ml-2 focus:outline-none"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      )}

      {/* 🔹 DESKTOP NAVBAR */}
      {!isMobile && (
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-1">
            <h1 className="text-2xl font-extrabold text-[#142B6F]">
              Room<span className="text-[#FFD601]">Quest</span>
            </h1>
          </Link>

          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold ${
                  pathname === link.href
                    ? "text-[#142B6F]"
                    : "text-gray-600 hover:text-[#142B6F]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {showSearch && (
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
              <Search size={18} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={handleSearch}
                className="bg-transparent outline-none text-gray-700 flex-1 text-sm"
              />
            </div>
          )}

          {/* 🔐 Auth buttons */}
          {!session ? (
            <div className="flex items-center gap-3 ml-6">
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#142B6F]"
              >
                <LogIn size={16} /> Login
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1 bg-[#142B6F] text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-[#0f2257]"
              >
                <UserPlus size={16} /> Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#142B6F]"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-red-600 font-semibold hover:text-red-700"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      )}

      {/* 📱 SIDE DRAWER MENU */}
      <AnimatePresence>
        {open && isMobile && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-64 h-full bg-white shadow-2xl z-50 flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-xl font-extrabold text-[#142B6F]">
                    Room<span className="text-[#FFD601]">Quest</span>
                  </h1>
                  <button onClick={() => setOpen(false)}>
                    <X size={24} className="text-[#142B6F]" />
                  </button>
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`block text-base font-semibold py-2 ${
                      pathname === link.href
                        ? "text-[#142B6F]"
                        : "text-gray-700 hover:text-[#142B6F]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <hr className="my-4 border-gray-200" />

                {!session ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#142B6F]"
                      onClick={() => setOpen(false)}
                    >
                      <LogIn size={16} /> Login
                    </Link>
                    <Link
                      href="/signup"
                      className="flex items-center gap-2 text-sm font-medium text-[#142B6F] hover:text-[#0f2257]"
                      onClick={() => setOpen(false)}
                    >
                      <UserPlus size={16} /> Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#142B6F]"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </>
                )}
              </div>

              <div className="text-xs text-gray-400 text-center pb-4">
                © {new Date().getFullYear()} RoomQuest
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

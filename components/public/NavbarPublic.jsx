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
  const sidebarRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [session, setSession] = useState(null);

  // ✅ Screen size detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Auth session
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

  // ✅ Dynamic search (supports text + numeric)
  const fetchResults = async (val) => {
    if (!val.trim()) return setResults([]);

    const cleanVal = val.replace(/,/g, "").trim();
    setLoading(true);

    try {
      const table = pathname.startsWith("/hostels") ? "hostels" : "rooms";
      const textFields =
        table === "rooms"
          ? ["title", "location", "description"]
          : ["title", "location", "hostel_type", "description"];

      const isNumber = !isNaN(cleanVal);
      let queryBuilder = supabase.from(table).select("*").limit(8);

      if (isNumber) {
        queryBuilder = queryBuilder.or(
          table === "rooms"
            ? `price.eq.${cleanVal},price.gte.${cleanVal}`
            : `price_per_semester.eq.${cleanVal},price_per_semester.gte.${cleanVal}`
        );
      } else {
        const textQuery = textFields
          .map((f) => `${f}.ilike.%${cleanVal}%`)
          .join(",");
        queryBuilder = queryBuilder.or(textQuery);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;
      setResults(data || []);
    } catch (err) {
      console.error("❌ Search error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) fetchResults(query);
      else setResults([]);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, pathname]);

  // ✅ FIXED: Scroll to hostel card instead of navigating to non-existent page
  const handleResultClick = (id) => {
    // Close mobile sidebar if open
    if (isMobile && open) {
      setOpen(false);
    }

    // Clear search
    setQuery("");
    setResults([]);

    // Wait a moment for UI to update, then scroll to the element
    setTimeout(() => {
      const elementId = `hostel-${id}`;
      const element = document.getElementById(elementId);

      if (element) {
        // Smooth scroll to the hostel card
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Add a visual highlight effect
        element.classList.add("ring-2", "ring-[#FFD601]", "ring-offset-2");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-[#FFD601]", "ring-offset-2");
        }, 1500);
      } else {
        // Fallback: Update URL with hash for manual scrolling
        window.history.pushState(null, "", `${pathname}#${elementId}`);
        console.warn(
          `Element with ID "${elementId}" not found. Make sure hostel cards have id="hostel-${id}"`
        );
      }
    }, 100);
  };

  // ✅ Handle URL hash on page load (for direct links)
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#hostel-")) {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }
      }
    };

    // Initial check
    handleHashScroll();

    // Also check after navigation
    const timeoutId = setTimeout(handleHashScroll, 500);
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  // ✅ Detect page for showing search
  const showSearch =
    pathname.startsWith("/rooms") || pathname.startsWith("/hostels");
  const placeholder = pathname.includes("/hostels")
    ? "Search hostels..."
    : "Search rooms...";

  const renderDropdown = () => (
    <AnimatePresence>
      {query && (
        <motion.div
          key="dropdown"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="absolute top-10 left-0 w-full bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden"
        >
          {loading ? (
            <div className="p-2 text-xs text-gray-500 text-center">
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((r) => (
              <motion.button
                key={r.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleResultClick(r.id);
                }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-none text-xs"
              >
                <img
                  src={
                    Array.isArray(r.images)
                      ? r.images[0]
                      : typeof r.images === "string"
                      ? JSON.parse(r.images || "[]")[0]
                      : r.image_url ||
                        "https://res.cloudinary.com/demo/image/upload/no_image.png"
                  }
                  alt={r.title}
                  className="w-10 h-10 object-cover rounded-md border border-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#142B6F] truncate">
                    {r.title || "Untitled"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {r.location || "Unknown"}
                  </p>
                  <p className="text-[11px] text-[#FFD601] font-semibold mt-0.5">
                    GH₵ {r.price || r.price_per_semester || "—"}
                  </p>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="p-2 text-xs text-gray-500 text-center">
              No results found.
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/rooms" },
    { name: "Hostels", href: "/hostels" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm w-full">
      {/* ✅ MOBILE TOP BAR */}
      {isMobile && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 relative w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <h1 className="text-xl font-extrabold text-[#142B6F]">
              Room<span className="text-[#FFD601]">Quest</span>
            </h1>
          </Link>

          {/* Search */}
          {showSearch && (
            <div className="relative w-[55%] sm:w-[65%]">
              <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                <Search size={16} className="text-gray-500 mr-2" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 flex-1"
                />
              </div>
              {renderDropdown()}
            </div>
          )}

          {/* Menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="text-[#142B6F] ml-2 focus:outline-none flex-shrink-0"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* ✅ DESKTOP NAVBAR */}
      {!isMobile && (
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <h1 className="text-2xl font-extrabold text-[#142B6F]">
              Room<span className="text-[#FFD601]">Quest</span>
            </h1>
          </Link>

          {/* Links */}
          <nav className="flex gap-8">
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

          {/* Search bar */}
          {showSearch && (
            <div className="relative flex items-center bg-gray-100 rounded-full px-4 py-2 w-80">
              <Search size={18} className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700 flex-1"
              />
              {renderDropdown()}
            </div>
          )}

          {/* Auth */}
          <div className="flex items-center gap-3">
            {!session ? (
              <>
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* ✅ MOBILE SIDE DRAWER */}
      <AnimatePresence>
        {open && isMobile && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpen(false)}
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

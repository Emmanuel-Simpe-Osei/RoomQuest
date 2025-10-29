"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// ✅ Validation schema
const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [slowNote, setSlowNote] = useState("");
  const slowTimer = useRef(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  // 🧹 Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(slowTimer.current);
  }, []);

  // ✅ Listen for session changes (redirects after login)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setRedirecting(true);
          const user = session.user;

          // Fetch role from profiles table
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          const role = profile?.role || "user";
          toast.success(
            `Welcome back, ${role === "admin" ? "Admin" : "User"}!`
          );

          if (role === "admin") {
            router.replace("/dashboard/admin");
          } else {
            router.replace("/rooms");
          }
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [router]);

  // ✅ If user already logged in, skip login page
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session) {
        setRedirecting(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const role = profile?.role || "user";
        if (role === "admin") router.replace("/dashboard/admin");
        else router.replace("/rooms");
      }
    }
    checkSession();
  }, [router]);

  // ✅ Sign-in logic
  const onSubmit = async (values) => {
    setLoading(true);
    setSlowNote("");
    slowTimer.current = setTimeout(() => {
      setSlowNote("Still processing... Your network seems a bit slow.");
    }, 6000);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast.success("Login successful!");
      // Redirection handled by the session listener
    } catch (err) {
      console.error(err);
      const msg = err?.message?.includes("Invalid")
        ? "Invalid email or password."
        : err?.message || "Could not sign in. Try again.";
      toast.error(msg);
      setError("email", { type: "manual", message: msg });
    } finally {
      clearTimeout(slowTimer.current);
      setSlowNote("");
      setLoading(false);
    }
  };

  // 🌀 Redirect spinner UI
  if (redirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-[#142B6F] border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-[#FFD601] animate-pulse"></div>
        </div>
      </div>
    );
  }

  // 🌈 Login Form UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#142B6F] via-[#1A3A8E] to-[#0D1F5A] px-4 relative overflow-hidden">
      {/* Animated background bubbles */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 bg-[#FFD601]/10 rounded-full blur-xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-16 w-16 h-16 bg-[#FFD601]/15 rounded-full blur-lg"
        animate={{ y: [0, 15, 0], scale: [1, 1.2, 1] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-12 h-12 bg-[#FFD601]/10 rounded-full blur-lg"
        animate={{ y: [0, -15, 0], scale: [1, 1.3, 1] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Login card */}
      <motion.div
        className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-[#142B6F] mb-2">
            Welcome to <span className="text-[#FFD601]">RoomQuest</span>
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to your account to continue
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-10 pr-4 rounded-xl border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD601] focus:border-transparent transition-all duration-200"
                {...register("email")}
              />
            </div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-600 mt-2"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full pl-10 pr-12 rounded-xl border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD601] focus:border-transparent transition-all duration-200"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-600 mt-2"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Forgot password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-right"
          >
            <Link
              href="/forgot-password"
              className="text-sm text-[#142B6F] hover:text-[#FFD601] transition-colors duration-200"
            >
              Forgot your password?
            </Link>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#142B6F] to-[#1A3A8E] text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 relative overflow-hidden"
            >
              <motion.span
                className="relative z-10"
                animate={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </motion.span>
              {loading && (
                <motion.div
                  className="absolute inset-0 bg-[#FFD601]"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </button>

            {slowNote && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-600 text-center mt-3"
              >
                {slowNote}
              </motion.p>
            )}
          </motion.div>

          {/* Sign up */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center pt-4 border-t border-gray-200"
          >
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#142B6F] font-semibold hover:text-[#FFD601] transition-colors duration-200 underline"
              >
                Sign up
              </Link>
            </p>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

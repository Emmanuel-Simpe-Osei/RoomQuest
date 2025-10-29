"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";

// ✅ Validation schema
const schema = z
  .object({
    fullName: z.string().min(3, "Please enter your full name"),
    phone: z
      .string()
      .min(8, "Enter a valid phone number")
      .max(20, "Phone number is too long"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    terms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms & Conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [slowNote, setSlowNote] = useState("");
  const slowTimer = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => () => clearTimeout(slowTimer.current), []);

  const onSubmit = async (values) => {
    setLoading(true);
    setSlowNote("");
    slowTimer.current = setTimeout(() => {
      setSlowNote("Still processing... Your network seems a bit slow.");
    }, 6000);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            phone: values.phone,
          },
        },
      });

      // ⚠️ Handle duplicate user gracefully
      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error(
            "That email is already registered. Redirecting to login..."
          );
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }
        throw error;
      }

      const user = data?.user;
      if (!user) throw new Error("Signup failed — user not returned.");

      // ✅ Create or update profile (no duplicate key)
      await supabase.from("profiles").upsert([
        {
          id: user.id,
          email: values.email,
          full_name: values.fullName,
          phone: values.phone,
          role: "user",
          created_at: new Date().toISOString(),
        },
      ]);

      // 🚀 Instant redirect — don’t wait for session sync
      toast.success("Account created successfully!");
      setTimeout(() => {
        const isAdmin = values.email.toLowerCase().includes("admin");
        router.replace(isAdmin ? "/dashboard/admin" : "/rooms");
      }, 1200);
    } catch (err) {
      console.error(err);
      const msg = err?.message?.includes("already")
        ? "That email is already registered."
        : err?.message || "Could not create account. Try again.";
      toast.error(msg);
      setError("email", { type: "manual", message: msg });
    } finally {
      clearTimeout(slowTimer.current);
      setSlowNote("");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#142B6F] via-[#1A3A8E] to-[#0D1F5A] px-4 relative overflow-hidden">
      {/* Floating background orbs */}
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
        className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20 relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#142B6F] mb-2">
            Join <span className="text-[#FFD601]">RoomQuest</span>
          </h1>
          <p className="text-gray-600 text-sm">
            Create your account and get started today.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 rounded-xl border border-gray-300 py-3 focus:ring-2 focus:ring-[#FFD601]"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full pl-10 pr-4 rounded-xl border border-gray-300 py-3 focus:ring-2 focus:ring-[#FFD601]"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 rounded-xl border border-gray-300 py-3 focus:ring-2 focus:ring-[#FFD601]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-12 rounded-xl border border-gray-300 py-3 focus:ring-2 focus:ring-[#FFD601]"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-12 rounded-xl border border-gray-300 py-3 focus:ring-2 focus:ring-[#FFD601]"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              className="accent-[#142B6F] rounded"
              {...register("terms")}
            />
            <p className="text-sm text-gray-700">
              I agree to the{" "}
              <Link href="/terms" className="text-[#142B6F] underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#142B6F] underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-600">{errors.terms.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#142B6F] to-[#1A3A8E] text-white font-semibold py-3 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {slowNote && (
            <p className="text-xs text-gray-600 text-center mt-3">{slowNote}</p>
          )}

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#142B6F] font-semibold underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

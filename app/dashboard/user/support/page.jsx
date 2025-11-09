"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { MessageCircle, Send, Loader2, Headphones } from "lucide-react";
import toast from "react-hot-toast";

const NAVY = "#142B6F";
const GOLD = "#FFD601";
const ADMIN_WHATSAPP = "233538171713"; // ✅ Clean business WhatsApp number (no plus)

export default function SupportPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please type a message first.");
      return;
    }

    setSending(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Please log in again.");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("support_messages").insert([
      {
        user_id: user.id,
        message,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to send message. Try again.");
    } else {
      toast.success("Message sent successfully!");
      setMessage("");
    }

    setSending(false);
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      "Hello, I need help with my RoomQuest booking or account."
    );
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${text}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#FFD601]/30 flex items-center justify-center">
          <Headphones size={24} className="text-[#142B6F]" />
        </div>
        <h1 className="text-2xl font-bold text-[#142B6F]">Support & Help</h1>
      </div>

      <p className="text-gray-600 mb-6">
        Need help? You can reach our support team directly via WhatsApp or send
        us a message below — we’ll get back to you soon.
      </p>

      {/* 💬 WhatsApp Support Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleWhatsAppChat}
        className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-[#1ebe5c] transition-all mb-8"
      >
        <MessageCircle size={18} />
        Chat on WhatsApp
      </motion.button>

      {/* 📝 Send Message Form */}
      <div className="space-y-4">
        <textarea
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#FFD601]/50 outline-none resize-none"
          placeholder="Describe your issue or question..."
        ></textarea>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSendMessage}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 bg-[#142B6F] text-white py-3 rounded-xl font-semibold hover:bg-[#1A2D7A] transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
        >
          {sending ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" />
              Sending...
            </>
          ) : (
            <>
              <Send size={18} />
              Send Message
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

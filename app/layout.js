import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientWrapper from "@/components/ClientWrapper";
import SeoSchema from "./components/SeoSchema";

export const metadata = {
  title: "RoomQuest",
  description: "Find and book hostel rooms with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* 🔴 BRAND IDENTITY FOR GOOGLE AI */}
        <SeoSchema />
      </head>

      <body className="bg-gray-50 text-gray-900 font-sans min-h-screen flex flex-col">
        <ClientWrapper>{children}</ClientWrapper>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

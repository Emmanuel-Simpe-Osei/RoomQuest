import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import NavbarPublic from "@/components/public/NavbarPublic";

export const metadata = {
  title: "RoomQuest",
  description: "Find and book hostel rooms with ease.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans min-h-screen flex flex-col">
        <NavbarPublic />
        <main className="flex-1">{children}</main>
        {/* <Footer /> */}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

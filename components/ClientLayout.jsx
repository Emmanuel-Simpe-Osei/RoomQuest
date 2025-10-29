"use client";

import NavbarPublic from "@/components/public/NavbarPublic";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }) {
  return (
    <>
      <NavbarPublic />
      <main>{children}</main>
      <Footer />
    </>
  );
}

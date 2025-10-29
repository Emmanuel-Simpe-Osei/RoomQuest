"use client";

export default function Footer() {
  return (
    <footer className="bg-[#142B6F] text-white py-6 mt-auto text-center text-sm">
      <p>
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">RoomQuest</span>. All rights reserved.
      </p>
      <p className="mt-1 text-gray-300">
        Built with ❤️ by{" "}
        <span className="font-medium">Emmanuel Simpe Osei</span>
      </p>
    </footer>
  );
}

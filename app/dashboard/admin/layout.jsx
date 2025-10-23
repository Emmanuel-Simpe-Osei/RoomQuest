import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";

export default function AdminLayout({ children }) {
  return (
    <div className="h-screen w-full flex bg-[#142B6F] overflow-hidden relative">
      {/* 🟦 Desktop Sidebar (fixed left) */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-30 bg-[#142B6F] border-r border-[#FFD601]/20">
        <Sidebar />
      </div>

      {/* 🟢 Mobile Sidebar (renders separately for slide animation) */}
      <div className="md:hidden">
        <Sidebar />
      </div>

      {/* 🟨 Main Section */}
      <div className="flex-1 flex flex-col md:ml-64 relative">
        {/* ✅ Fixed Topbar */}
        <div className="fixed top-0 left-0 md:left-64 right-0 z-40 bg-[#142B6F] border-b border-[#FFD601]/20 shadow-md">
          <Topbar />
        </div>

        {/* ✅ Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-[70px] md:mt-[75px] scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}

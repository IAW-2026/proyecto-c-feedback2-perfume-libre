"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Shield, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar (Admin Theme) */}
      <header className="flex h-16 items-center justify-between bg-teal-700 px-4 text-white shadow-md relative z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-teal-600 rounded-md transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="p-2 bg-teal-600 rounded-md hidden md:block">
            <Shield size={24} className="text-white" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">
            Panel de Moderación
          </span>
        </div>
        <div>
          <UserButton />
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <div
          className={`absolute inset-y-0 left-0 z-50 w-64 shrink-0 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0`}
        >
          <nav className="flex flex-col p-4 gap-2">
            <Link
              href="/soporte"
              onClick={closeSidebar}
              className={`p-3 text-left rounded-md transition-colors ${
                pathname === "/soporte"
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Reportes pendientes
            </Link>
            <Link
              href="/soporte/historial"
              onClick={closeSidebar}
              className={`p-3 text-left rounded-md transition-colors ${
                pathname === "/soporte/historial"
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Historial de reportes
            </Link>
          </nav>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/20 md:hidden"
            onClick={closeSidebar}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

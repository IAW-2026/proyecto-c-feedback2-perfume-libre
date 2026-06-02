"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import BuyerDashboard from "./BuyerDashboard";
import SellerDashboard from "./SellerDashboard";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<"buyer" | "seller">("buyer");

  useEffect(() => {
    const savedView = localStorage.getItem("feedback_active_view") as "buyer" | "seller" | null;
    if (savedView === "buyer" || savedView === "seller") {
      setActiveView(savedView);
    }
  }, []);

  const handleViewChange = (view: "buyer" | "seller") => {
    setActiveView(view);
    localStorage.setItem("feedback_active_view", view);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between bg-teal-700 px-4 text-white shadow-md relative z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-teal-600 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-semibold text-lg hidden sm:block">
            Feedback Perfume Libre
          </span>
        </div>
        <div>
          <UserButton />
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <div
          className={`absolute left-0 top-0 z-50 h-full w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col p-4 gap-2">
            <button
              onClick={() => handleViewChange("buyer")}
              className={`p-3 text-left rounded-md transition-colors ${
                activeView === "buyer"
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Dejar una reseña
            </button>
            <button
              onClick={() => handleViewChange("seller")}
              className={`p-3 text-left rounded-md transition-colors ${
                activeView === "seller"
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Reseñas a mis productos
            </button>
          </nav>
        </div>

        {/* Overlay */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/20"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full max-w-5xl mx-auto">
          <div className={activeView === "buyer" ? "block" : "hidden"}>
            <BuyerDashboard />
          </div>
          <div className={activeView === "seller" ? "block" : "hidden"}>
            <SellerDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}

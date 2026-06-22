import { UserButton } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navbar (Admin Theme) */}
      <header className="flex h-16 items-center justify-between bg-slate-800 px-4 text-white shadow-md relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-slate-700 rounded-md">
            <Shield size={24} className="text-teal-400" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">
            Panel de Moderación
          </span>
        </div>
        <div>
          <UserButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}

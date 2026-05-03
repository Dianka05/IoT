import { useState } from "react";
import { Menu, Bell, RotateCcw } from "lucide-react";

export default function AdminDashboardHeader({ setSidebarOpen }) {
  const [spin, setSpin] = useState(false);

  const handleRefresh = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 300);
  };

  return (
    <header className="w-full mb-10">

      <div
        className="
          flex flex-col md:flex-row
          md:items-center md:justify-between
          gap-4 md:gap-0
        "
      >

        <div className="order-2 md:order-1">
          <h1 className="text-3xl md:text-4xl font-[900] text-slate-800 uppercase tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, Admin
          </p>
        </div>

        <div className="flex items-center justify-between order-1 md:order-2">

          <button
            onClick={() => setSidebarOpen(true)}
            className="
              md:hidden p-2 rounded-xl transition-all duration-200
              hover:bg-slate-100 hover:scale-110 hover:rotate-6
              active:rotate-0
            "
          >
            <Menu size={24} className="text-slate-700" />
          </button>

          <div className="flex items-center gap-3">

            <button
              className="
                p-2 rounded-xl transition-all duration-200
                hover:bg-slate-100 hover:scale-110 hover:rotate-6
                active:rotate-0
              "
            >
              <Bell size={24} className="text-slate-700" />
            </button>

            <button
              onClick={handleRefresh}
              className="
                p-2 rounded-xl transition-all duration-200
                hover:bg-slate-100 hover:scale-110
              "
            >
              <RotateCcw
                size={24}
                className={`
                  text-slate-700 transition-transform duration-300
                  ${spin ? "rotate-[120deg]" : "rotate-0"}
                `}
              />
            </button>

          </div>
        </div>

      </div>

    </header>
  );
}

import { useState } from "react";
import { RotateCcw, Menu } from "lucide-react";

export default function Header({ setSidebarOpen, onRefresh }) {
  const [isPressed, setIsPressed] = useState(false);

  const handleRefresh = () => {
    setIsPressed(true);
    onRefresh?.();
    setTimeout(() => setIsPressed(false), 250);
  };

  return (
    <header className="flex items-center justify-between mb-8 w-full overflow-x-hidden">

      <div className="flex items-center gap-4">

        <button
          className="
            md:hidden p-2 rounded-xl transition-all duration-200
            hover:bg-slate-100 hover:scale-110 hover:rotate-6
            active:rotate-0
          "
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} className="text-slate-700" />
        </button>

        <div>
          <h1 className="text-4xl font-[900] text-[#1e293b] tracking-tight uppercase">
            System Security Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time monitoring of IoT equipment activities and access attempts.
          </p>
        </div>

      </div>

      <button
        onClick={handleRefresh}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
          border border-slate-200
          ${isPressed
            ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
            : "bg-white text-slate-700 hover:bg-slate-100"
          }
        `}
      >
        <RotateCcw size={18} className={isPressed ? "animate-spin" : ""} />
        Refresh
      </button>

    </header>
  );
}

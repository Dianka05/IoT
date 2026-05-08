import { useState } from "react";
import { Bell, UserPlus, Menu, RotateCcw } from "lucide-react";

export default function UsersListHeader({
  setSidebarOpen,
  onRefresh,
  refreshing = false,
}) {
  const [spin, setSpin] = useState(false);

  const handleRefresh = async () => {
    setSpin(true);

    try {
      await onRefresh?.();
    } finally {
      setTimeout(() => setSpin(false), 300);
    }
  };

  return (
    <header className="w-full mb-8">
      <div
        className="
          flex flex-col md:flex-row
          md:items-center md:justify-between
          gap-4 md:gap-0
        "
      >
        <div className="order-2 md:order-1">
          <h1 className="text-3xl md:text-4xl font-[900] text-[#1e293b] tracking-tight uppercase">
            System Users
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage and control access for all registered system users.
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

          <div className="flex items-center gap-4">
            <button
              className="
                flex items-center gap-2
                bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold
                hover:bg-orange-600 transition
              "
            >
              <UserPlus size={20} />
              Add New User
            </button>

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
              disabled={refreshing}
              className="
                p-2 rounded-xl transition-all duration-200
                hover:bg-slate-100 hover:scale-110
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <RotateCcw
                size={24}
                className={`
                  text-slate-700 transition-transform duration-300
                  ${spin || refreshing ? "rotate-90" : "rotate-0"}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
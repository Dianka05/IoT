import { useState } from "react";
import { Menu, RotateCcw } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  setSidebarOpen,
  onRefresh,
  refreshing = false,
  action = null,
  className = "mb-8",
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
    <header className={`w-full ${className}`.trim()}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="order-2 md:order-1">
          <h1 className="text-3xl font-[900] uppercase tracking-tight text-slate-800 md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="order-1 flex items-center justify-between md:order-2">
          <button
            onClick={() => setSidebarOpen?.(true)}
            className="rounded-xl p-2 transition-all duration-200 hover:rotate-6 hover:scale-110 hover:bg-slate-100 active:rotate-0 md:hidden cursor-pointer"
          >
            <Menu size={24} className="text-slate-700" />
          </button>

          <div className="flex items-center gap-3 md:gap-4">
            {action}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="rounded-xl p-2 transition-all duration-200 hover:scale-110 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw
                  size={24}
                  className={`text-slate-700 transition-transform duration-300 ${
                    spin || refreshing ? "rotate-90" : "rotate-0"
                  }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import { Menu, Bell } from "lucide-react";

export default function HeaderEquipment({ title, setSidebarOpen }) {
  return (
    <header className="flex items-center justify-between mb-8 w-full">

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
            {title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure and manage access permissions for IoT equipment.
          </p>
        </div>

      </div>

      <button
        className="
          p-2 rounded-xl transition-all duration-200
          hover:bg-slate-100 hover:scale-110 hover:rotate-6
          active:rotate-0
        "
      >
        <Bell size={24} className="text-slate-700" />
      </button>

    </header>
  );
}

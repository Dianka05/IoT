import { Bell, UserPlus, Menu } from "lucide-react";

export default function UsersListHeader({ setSidebarOpen }) {
  return (
  <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-8">

      <div className="flex items-center gap-4">

        <button
          className="
            md:hidden p-2 rounded-xl transition-all duration-200
            hover:bg-slate-100
            hover:scale-110
            hover:rotate-6
            active:rotate-0
          "
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24} className="text-slate-700" />
        </button>


        <h1 className="text-2xl md:text-4xl font-[900] text-[#1e293b] tracking-tight uppercase">

          System Users
        </h1>
      </div>

      <div className="flex items-center gap-4">

        <button
          className="
            p-2 rounded-xl transition-all duration-200
            hover:bg-slate-100
            hover:scale-110
            hover:rotate-6
            active:rotate-0
          "
        >
          <Bell
            size={22}
            className="text-slate-600 transition-colors duration-200"
          />
        </button>

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

      </div>

    </div>
  );
}

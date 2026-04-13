import { useState, useMemo } from "react";

export default function UserSelectorEquipment({ users, selectedUser, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="w-full mb-6">

      <div
        className="
          w-full bg-white border border-slate-200 rounded-2xl shadow-sm
          p-6
          max-h-[300px]
          flex flex-col
        "
      >

        <h2 className="text-lg font-semibold text-slate-700 mb-3">
          Select User
        </h2>

        <div className="mb-3 w-full">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full px-3 py-2 rounded-lg border border-slate-300
              text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              bg-white
            "
          />
        </div>

        <div
          className="
            w-full overflow-y-auto
            flex flex-col gap-2
            pr-1
          "
        >
          {filtered.map((u) => {
            const isActive = selectedUser?.id === u.id;

            return (
              <button
                key={u.id}
                onClick={() => onSelect(u)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-xl border transition
                  ${
                    isActive
                      ? "bg-orange-50 border-orange-300 shadow-sm"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <div
                  className={`
                    h-9 w-9 rounded-full flex items-center justify-center text-white font-semibold text-sm
                    ${isActive ? "bg-orange-400" : "bg-slate-400"}
                  `}
                >
                  {u.name[0]}
                </div>

                <div className="flex flex-col leading-tight">
                  <p className="font-semibold text-slate-800 text-sm">
                    {u.name}
                  </p>
                  <p className="text-xs text-slate-500">{u.role}</p>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}

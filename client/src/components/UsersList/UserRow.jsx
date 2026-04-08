import { Users, Edit, Trash2 } from "lucide-react";

const UserRow = ({ name, role, rfid, equipment, limit, status }) => {
  // Цвета для ролей прямо здесь
  const roleColors = {
    Admin: "bg-blue-100 text-blue-700",
    Technician: "bg-orange-100 text-orange-700",
    User: "bg-slate-200 text-slate-700",
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-all cursor-pointer">
      
      {/* USER NAME */}
      <td className="px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
          <Users size={18} />
        </div>
        <span className="font-bold text-slate-700 text-[15px]">{name}</span>
      </td>

      {/* ROLE — ЛЕЙБЛ */}
      <td className="px-6 py-4">
        <span
          className={`
            px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide
            transition hover:brightness-110
            ${roleColors[role] || "bg-slate-200 text-slate-700"}
          `}
        >
          {role}
        </span>
      </td>

      {/* RFID */}
      <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">
        {rfid}
      </td>

      {/* EQUIPMENT */}
      <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">
        {equipment.join(", ")}
      </td>

      {/* TIME LIMIT */}
      <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">
        {limit}
      </td>

      {/* STATUS BADGE */}
      <td className="px-6 py-4">
        <span
          className={`
            text-[11px] font-black px-2 py-1 rounded-md uppercase
            ${status === "Active"
              ? "bg-green-50 text-green-600"
              : "bg-slate-100 text-slate-400"}
          `}
        >
          {status}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="px-6 py-4 flex gap-3">
        <button className="text-slate-400 hover:text-orange-500 transition">
          <Edit size={16} />
        </button>
        <button className="text-slate-400 hover:text-red-500 transition">
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default UserRow;

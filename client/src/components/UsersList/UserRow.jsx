import { Edit, Trash2, Users } from "lucide-react";

const UserRow = ({
  name,
  role,
  rfid,
  equipment = [],
  limit,
  status,
  onEdit,
  onDelete,
}) => {
  const roleColors = {
    Admin: "bg-blue-100 text-blue-700",
    Technician: "bg-orange-100 text-orange-700",
    User: "bg-slate-200 text-slate-700",
  };

  const equipmentText = equipment.length > 0 ? equipment.join(", ") : "No equipment";

  return (
    <tr className="cursor-pointer transition-all hover:bg-slate-50/50">
      <td className="flex items-center gap-3 px-6 py-4">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
          <Users size={18} />
        </div>

        <span className="text-[15px] font-bold text-slate-700">{name}</span>
      </td>

      <td className="px-6 py-4">
        <span
          className={`
            rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-wide
            transition hover:brightness-110
            ${roleColors[role] || "bg-slate-200 text-slate-700"}
          `}
        >
          {role}
        </span>
      </td>

      <td className="whitespace-nowrap px-6 py-4 text-[14px] font-medium text-slate-600">
        {rfid || "-"}
      </td>

      <td className="max-w-[300px] truncate px-6 py-4 text-[14px] font-medium text-slate-600">
        {equipmentText}
      </td>

      <td className="px-6 py-4 text-[14px] font-medium text-slate-600">
        {limit || "Default"}
      </td>

      <td className="px-6 py-4">
        <span
          className={`
            rounded-md px-2 py-1 text-[11px] font-black uppercase
            ${status === "Active"
              ? "bg-green-50 text-green-600"
              : "bg-slate-100 text-slate-400"}
          `}
        >
          {status}
        </span>
      </td>

      <td className="flex gap-3 px-6 py-4">
        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer text-slate-400 transition hover:text-orange-500"
        >
          <Edit size={16} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="cursor-pointer text-slate-400 transition hover:text-red-500"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default UserRow;

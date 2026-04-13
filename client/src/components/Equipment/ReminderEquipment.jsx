import { Info } from "lucide-react";

export default function ReminderEquipment() {
  return (
    <div
      className="
        mt-8 p-5 rounded-xl border border-slate-200 shadow-sm
        bg-[#fdf7ee]   /* мягкий бежевый фон */
        flex items-start gap-4
      "
    >
      <div
        className="
          h-8 w-8 rounded-full bg-white border border-slate-300
          flex items-center justify-center
          text-slate-600
        "
      >
        <Info size={18} />
      </div>

      <div className="flex flex-col">
        <p className="font-semibold text-slate-900 text-sm">
          Security Policy Reminder
        </p>
        <p className="text-slate-700 text-sm mt-1 leading-snug">
          Every “Approve” is logged with timestamps and user IDs.
        </p>
      </div>
    </div>
  );
}

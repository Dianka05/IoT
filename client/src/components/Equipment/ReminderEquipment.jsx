import { Info } from "lucide-react";
import SurfaceCard from "../surfaceCard";

export default function ReminderEquipment() {
  return (
    <SurfaceCard
      className="
        mt-8 p-5 border border-[#ec5b131a] shadow-sm
        bg-[#ec5b130d]
        flex items-start gap-4
      "
    >
      
      <Info size={18} color="#FF8C00" />

      <div className="flex flex-col">
        <p className="font-semibold text-slate-900 text-sm">
          Security Policy Reminder
        </p>
        <p className="text-slate-700 text-sm mt-1 leading-snug">
          Every “Approve” is logged with timestamps and user IDs.
        </p>
      </div>
    </SurfaceCard>
  );
}

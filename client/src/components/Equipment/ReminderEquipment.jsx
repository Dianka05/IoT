import { Info } from "lucide-react";
import SurfaceCard from "../surfaceCard";

export default function ReminderEquipment() {
  return (
    <SurfaceCard
      className="
        mt-8 flex items-start gap-4 border border-[#ec5b131a]
        bg-[#ec5b130d] p-5 shadow-sm
      "
    >
      <Info size={18} color="#FF8C00" />

      <div className="flex flex-col">
        <p className="text-sm font-semibold text-slate-900">
          Access Reminder
        </p>
        <p className="mt-1 text-sm leading-snug text-slate-700">
          If something looks unavailable, it may already be reserved, in use, offline, or under maintenance.
        </p>
      </div>
    </SurfaceCard>
  );
}

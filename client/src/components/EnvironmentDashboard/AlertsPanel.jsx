import { AlertTriangle, Droplets, Info } from "lucide-react";
import SurfaceCard from "../surfaceCard";

const iconByTone = {
  warning: Droplets,
  error: Info,
  info: AlertTriangle,
};

const toneClasses = {
  warning: {
    card: "border-yellow-100 bg-yellow-50/50",
    icon: "text-yellow-600",
    tag: "text-yellow-600",
    label: "Warning",
  },
  error: {
    card: "border-red-100 bg-red-50/50",
    icon: "text-red-600",
    tag: "text-red-600",
    label: "Critical",
  },
  info: {
    card: "border-blue-100 bg-blue-50/50",
    icon: "text-blue-600",
    tag: "text-blue-600",
    label: "Info",
  },
};

export default function AlertsPanel({ alerts = [], loading = false }) {
  return (
    <SurfaceCard className="p-4">
      <div className="mb-6 flex items-center gap-2">
        <AlertTriangle size={20} className="text-red-500" />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
          Active Alerts
        </h3>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm font-semibold text-slate-500">
            Loading alerts...
          </div>
        )}

        {!loading && alerts.length === 0 && (
          <SurfaceCard className="border-green-100 bg-green-50/60 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} className="text-green-600" />
              <div>
                <h4 className="text-sm font-black text-slate-800">No active alerts</h4>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Latest status payload looks healthy.
                </p>
              </div>
            </div>
          </SurfaceCard>
        )}

        {!loading && alerts.map((alert, index) => {
          const tone = toneClasses[alert.tone] || toneClasses.info;
          const Icon = iconByTone[alert.tone] || AlertTriangle;

          return (
            <div key={`${alert.title}-${index}`} className={`rounded-2xl border p-4 ${tone.card}`}>
              <div className="mb-1 flex items-center gap-3">
                <Icon size={16} className={tone.icon} />
                <h4 className="text-sm font-black text-slate-800">{alert.title}</h4>
              </div>
              <p className="ml-7 text-xs font-bold text-slate-500">{alert.description}</p>
              <span className={`ml-7 mt-2 block text-[9px] font-black uppercase tracking-widest ${tone.tag}`}>
                {alert.level || tone.label}
              </span>
            </div>
          );
        })}

        <button className="w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-50">
          Live Status Feed
        </button>
      </div>
    </SurfaceCard>
  );
}

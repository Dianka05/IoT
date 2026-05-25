import { Radio } from "lucide-react";
import SurfaceCard from "../surfaceCard";

export default function SensorTable({ rows = [], loading = false }) {
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-50 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Radio size={18} className="text-orange-500" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800 md:text-xs">
            Live Status Metrics
          </h3>
        </div>
        <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-500">
          Live
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4">Metric</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  Loading status metrics...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                  No status metrics received yet.
                </td>
              </tr>
            )}

            {!loading && rows.map((row, index) => (
              <tr
                key={`${row.name}-${index}`}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/50"
              >
                <td className="px-6 py-5 text-sm font-black text-slate-700">{row.name}</td>
                <td className={`px-6 py-5 text-sm font-bold ${
                  row.status === "warning"
                    ? "text-yellow-500"
                    : row.status === "error"
                      ? "text-red-500"
                      : "text-slate-600"
                }`}>
                  {row.value}
                </td>
                <td className="px-6 py-5">
                  <div
                    className={`mx-auto h-2 w-2 rounded-full ${
                      row.status === "warning"
                        ? "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                        : row.status === "error"
                          ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                          : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    }`}
                  />
                </td>
                <td className="px-6 py-5 text-right text-[11px] font-bold text-slate-300">
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

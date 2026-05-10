import SurfaceCard from "../surfaceCard";

export default function SystemIdentity({ info = [] }) {
  return (
    <SurfaceCard className="p-4">
      <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-800">
        System Identity
      </h3>

      <div className="space-y-4">
        {info.length === 0 && (
          <div className="text-[11px] font-bold text-slate-400">
            No identity data available yet.
          </div>
        )}

        {info.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex items-center justify-between text-[11px] font-bold">
            <span className="uppercase tracking-tight text-slate-300">
              {item.label}
            </span>
            <span className={`uppercase ${item.status === "active" ? "flex items-center gap-2 text-green-500" : "text-slate-800"}`}>
              {item.status === "active" && (
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              )}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

import SurfaceCard from './surfaceCard';

export default function StatCard({ icon: Icon, label, value, trend, status, iconBg }) {
  return (
    <SurfaceCard className="flex h-36 flex-col justify-between rounded-xl p-4 md:h-40 md:p-6">
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 md:p-3 ${iconBg}`}>
          <Icon size={18} className="text-slate-700 md:size-5" />
        </div>

        {trend && (
          <span className="rounded-lg bg-green-50 px-2 py-1 text-[9px] font-[1000] uppercase tracking-tight text-green-500 md:text-[10px]">
            {trend}
          </span>
        )}

        {status && (
          <span className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-[1000] uppercase tracking-tight text-slate-400 md:text-[10px]">
            {status}
          </span>
        )}
      </div>

      <div>
        <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 md:text-[10px]">
          {label}
        </p>
        <p className="text-2xl font-[1000] leading-none text-slate-800 md:text-3xl">
          {value}
        </p>
      </div>
    </SurfaceCard>
  );
}

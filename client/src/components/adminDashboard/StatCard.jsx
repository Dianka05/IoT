const StatCard = ({ icon: Icon, label, value, trend, status, iconBg }) => (
  <div className="bg-white p-4 md:p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between h-36 md:h-40">
    <div className="flex justify-between items-start">
      <div className={`p-2.5 md:p-3 rounded-xl ${iconBg}`}>
        <Icon size={18} className="text-slate-700 md:size-5" />
      </div>
      {trend && <span className="text-[9px] md:text-[10px] font-[1000] text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-tight">{trend}</span>}
      {status && <span className="text-[9px] md:text-[10px] font-[1000] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-tight">{status}</span>}
    </div>
    <div>
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-[1000] text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

export default StatCard;
const StatCard = ({ icon: Icon, label, value, trend, status, iconBg }) => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col justify-between h-40">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl ${iconBg}`}>
        <Icon size={20} className="text-slate-700" />
      </div>

      {trend && (
        <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}

      {status && (
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          {status}
        </span>
      )}
    </div>

    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  </div>
);

export default StatCard;

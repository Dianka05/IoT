const StatusBadge = ({ isOnline }) => (
  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
    <span className="relative flex h-3 w-3">
      {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
    </span>
    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {isOnline ? 'Gateway Online' : 'Gateway Offline'}
    </span>
  </div>
);

export default StatusBadge;
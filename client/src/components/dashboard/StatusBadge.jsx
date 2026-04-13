const StatusBadge = ({ isOnline }) => (
  <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
    isOnline ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
  }`}>
    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
      isOnline ? 'text-green-600' : 'text-red-600'
    }`}>
      {isOnline ? 'System Online' : 'System Offline'}
    </span>
  </div>
);

export default StatusBadge;
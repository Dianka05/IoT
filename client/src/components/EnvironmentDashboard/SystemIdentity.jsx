const SystemIdentity = () => {
  const info = [
    { label: 'Box Model', value: 'BOBABAB V11' },
    { label: 'Firmware', value: 'v2.4.0-build.88' },
    { label: 'Connection', value: '5G CONNECTED', status: 'active' },
  ];

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-50">
      <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest mb-6">System Identity</h3>
      <div className="space-y-4">
        {info.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-slate-300 uppercase tracking-tight">{item.label}</span>
            <span className={`uppercase ${item.status === 'active' ? 'text-green-500 flex items-center gap-2' : 'text-slate-800'}`}>
              {item.status === 'active' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>}
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemIdentity;
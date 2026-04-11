const FooterStats = ({ stats }) => {
  const {
    successful = 0,
    alerts = 0,
    warnings = 0,
    hours = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500">Successful Actions</p>
        <p className="text-2xl font-semibold text-slate-800 mt-1">{successful}</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500">Security Alerts</p>
        <p className="text-2xl font-semibold text-red-600 mt-1">{alerts}</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500">System Warnings</p>
        <p className="text-2xl font-semibold text-yellow-600 mt-1">{warnings}</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
        <p className="text-sm text-slate-500">Total Monitoring Hours</p>
        <p className="text-2xl font-semibold text-blue-600 mt-1">{hours}</p>
      </div>

    </div>
  );
};

export default FooterStats;

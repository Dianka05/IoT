const FooterStats = ({ stats }) => {
  const {
    successful = 0,
    alerts = 0,
    warnings = 0,
    hours = 0,
  } = stats || {};

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Successful Events</p>
        <p className="mt-1 text-2xl font-semibold text-slate-800">{successful}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Security Alerts</p>
        <p className="mt-1 text-2xl font-semibold text-red-600">{alerts}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">System Warnings</p>
        <p className="mt-1 text-2xl font-semibold text-yellow-600">{warnings}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-500">Total Entries</p>
        <p className="mt-1 text-2xl font-semibold text-blue-600">{hours}</p>
      </div>
    </div>
  );
};

export default FooterStats;

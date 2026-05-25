import TableRow from "./TableRow";

export default function LogsTable({ data = [] }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Timestamp</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Event Type</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">User</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Equipment</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Action</th>
            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                No logs found for the current filters.
              </td>
            </tr>
          ) : (
            data.map((log, index) => (
              <TableRow key={log.id || index} log={log} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

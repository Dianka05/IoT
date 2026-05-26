import TableRow from "./TableRow";

export default function LogsTable({ data = [] }) {
  return (
    <div className="w-full overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Event Type</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Equipment</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
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

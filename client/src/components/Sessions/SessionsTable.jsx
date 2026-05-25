import SessionsRow from "./SessionsRow";

export default function SessionsTable({ data, onTerminate }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Session ID</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">User</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Hardware / Box</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Mode</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Started At</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Time Remaining</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-10 text-center text-sm font-semibold text-slate-500">
                No sessions found for the current organization.
              </td>
            </tr>
          ) : (
            data.map((session, index) => (
              <SessionsRow
                key={session.id || index}
                session={session}
                onTerminate={onTerminate}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

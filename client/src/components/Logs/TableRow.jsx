export default function TableRow({ log }) {
  const { timestamp, eventType, user, equipment, action, status } = log;

  const statusColor = {
    SUCCESS: "text-green-700 bg-green-100",
    FAILED: "text-red-700 bg-red-100",
    WARNING: "text-yellow-800 bg-yellow-100",
  }[status] || "text-slate-600 bg-slate-100";

  const rowBg =
    status === "FAILED"
      ? "bg-red-50 hover:bg-red-100"
      : "hover:bg-slate-50";

  const criticalText = status === "FAILED" ? "text-red-700 font-semibold" : "";

  return (
    <tr className={`border-b border-slate-100 transition ${rowBg}`}>

      <td className="px-6 py-4 text-sm text-slate-700">{timestamp}</td>

      <td className="px-6 py-4 text-sm text-slate-700">{eventType}</td>

      <td className={`px-6 py-4 text-sm ${criticalText || "text-slate-700"}`}>
        {user}
      </td>

      <td className="px-6 py-4 text-sm text-slate-700">{equipment}</td>

      <td className={`px-6 py-4 text-sm ${criticalText || "text-slate-700"}`}>
        {action}
      </td>

      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {status}
        </span>
      </td>

    </tr>
  );
}

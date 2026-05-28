import { Link } from "react-router-dom";

export default function TableRow({ log }) {
  const { timestamp, eventType, user, rfidUid, equipment, action, status } = log;

  const statusColor = {
    SUCCESS: "bg-emerald-50 text-emerald-600",
    FAILED: "bg-red-50 text-red-600",
    WARNING: "bg-amber-50 text-amber-700",
  }[status] || "bg-slate-100 text-slate-600";

  const rowBg =
    status === "FAILED"
      ? "bg-red-50/50 hover:bg-red-50"
      : status === "WARNING"
        ? "bg-amber-50/40 hover:bg-amber-50/60"
        : "hover:bg-slate-50/70";

  const criticalText = status === "FAILED" ? "text-red-700 font-semibold" : "";

  return (
    <tr className={`transition ${rowBg}`}>

      <td className="px-6 py-4 text-sm text-slate-700">{timestamp}</td>

      <td className="px-6 py-4 text-sm text-slate-700">{eventType}</td>

      <td className={`px-6 py-4 text-sm ${criticalText || "text-slate-700"}`}>
        {rfidUid ? (
          <div className="space-y-1">
            <div>{user}</div>
            <Link
              to={`/rfid-auth?uid=${encodeURIComponent(rfidUid)}`}
              className="inline-flex text-xs font-semibold text-orange-500 transition hover:text-orange-600"
            >
              RFID {rfidUid}
            </Link>
          </div>
        ) : (
          user
        )}
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

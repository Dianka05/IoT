import { Link } from "react-router-dom";

export default function SessionsRow({ session, onTerminate }) {
  const {
    id,
    user,
    userName,
    userRole,
    hardware,
    hardwareLabel,
    boxLabel,
    mode,
    started,
    status,
    time,
    percent,
    durationMinutes,
  } = session;

  const isEnded = status === "ENDED" || status === "EXPIRED" || status === "CANCELLED";
  const [nameFallback, roleFallbackRaw] = String(user || "Unknown User (User)").split(" (");
  const name = userName || nameFallback;
  const role = userRole || roleFallbackRaw?.replace(")", "") || "User";
  const primaryHardware = hardwareLabel || String(hardware || "").split(" ")[0] || "Unknown";
  const secondaryHardware = boxLabel || String(hardware || "").split(" ").slice(1).join(" ");
  const isTerminable =
    status === "ACTIVE" ||
    status === "SCHEDULED" ||
    status === "READY" ||
    status === "MISSED";

  const statusBadge =
    status === "ACTIVE" ? (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-green-700">
        Active
      </span>
    ) : status === "SCHEDULED" ? (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-700">
        Scheduled
      </span>
    ) : status === "READY" ? (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-orange-700">
        Ready
      </span>
    ) : status === "MISSED" ? (
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-700">
        Missed
      </span>
    ) : (
      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-600">
        {status}
      </span>
    );

  const actionButton = isTerminable ? (
    <button
      onClick={() => onTerminate(id)}
      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
    >
      {status === "ACTIVE" ? "Terminate" : "Cancel"}
    </button>
  ) : (
    <Link
      to={`/logs?sessionId=${encodeURIComponent(id)}`}
      className="text-sm font-medium text-orange-600 transition hover:text-orange-800"
    >
      View Logs
    </Link>
  );

  return (
    <tr
      className={`border-b border-slate-100 transition hover:bg-slate-50 ${
        isEnded ? "text-slate-400" : "text-slate-700"
      }`}
    >
      <td className="px-6 py-4 text-sm">{id}</td>

      <td className="px-6 py-4">
        <div className="flex flex-col leading-tight">
          <span
            className={`text-sm font-bold ${
              isEnded ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {name}
          </span>
          <span className="text-xs text-slate-500">{role}</span>
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col leading-tight">
          <span
            className={`text-sm font-semibold ${
              isEnded ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {primaryHardware}
          </span>
          {secondaryHardware && (
            <span className="text-xs text-slate-500">{secondaryHardware}</span>
          )}
        </div>
      </td>

      <td className="px-6 py-4 text-sm">{mode}</td>
      <td className="px-6 py-4 text-sm">{started}</td>
      <td className="px-6 py-4">{statusBadge}</td>

      <td className="px-6 py-4 text-sm">
        {status === "ACTIVE" ? (
          <div className="flex w-40 flex-col gap-1">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>{time}</span>
              <span>{percent}%</span>
              <span>{durationMinutes}m</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ) : (
          <span>{time}</span>
        )}
      </td>

      <td className="px-6 py-4">{actionButton}</td>
    </tr>
  );
}

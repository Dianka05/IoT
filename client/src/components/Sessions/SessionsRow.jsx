export default function SessionsRow({ session, onTerminate}) {
  const { id, user, hardware, mode, started, status, time, percent, action } = session;

  const isEnded = status === "ENDED";

  const [name, roleRaw] = user.split(" (");
  const role = roleRaw?.replace(")", "");

  const statusBadge =
    status === "ACTIVE" ? (
      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-green-100 text-green-700 uppercase tracking-wide">
        ACTIVE
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-slate-200 text-slate-600 uppercase tracking-wide">
        {status}
      </span>
    );

  const actionButton =
  status === "ACTIVE" ? (
    <button
      onClick={() => onTerminate(id)}
      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
    >
      Terminate
    </button>
  ) : (
    <button className="text-orange-600 hover:text-orange-800 text-sm font-medium transition">
      View Logs
    </button>
  );


  return (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50 transition ${
        isEnded ? "text-slate-400" : "text-slate-700"
      }`}
    >

      <td className="px-6 py-4 text-sm">{id}</td>
      <td className="px-6 py-4">
        <div className="flex flex-col leading-tight">
          <span
            className={`font-bold text-sm ${
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
            <span className={`font-semibold text-sm ${isEnded ? "text-slate-400" : "text-slate-800"}`}>
              {hardware.split(" ")[0]}
            </span>
            <span className="text-xs text-slate-500">
              {hardware.split(" ")[1]}
            </span>
          </div>
        </td>

      <td className="px-6 py-4 text-sm">{mode}</td>
      <td className="px-6 py-4 text-sm">{started}</td>
      <td className="px-6 py-4">{statusBadge}</td>
      <td className="px-6 py-4 text-sm">
        {status === "ACTIVE" ? (
          <div className="flex flex-col gap-1 w-40">

          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span>{time}</span>
            <span>{percent}%</span>
            <span>{session.durationMinutes}m</span>
          </div>

      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        ></div>
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

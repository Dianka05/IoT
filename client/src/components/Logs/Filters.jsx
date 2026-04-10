import { useState } from "react";
import { RotateCcw, Filter } from "lucide-react";

const Filters = ({ onFilter, onRefresh }) => {
  const [eventType, setEventType] = useState("");
  const [user, setUser] = useState("");
  const [equipment, setEquipment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [filterPressed, setFilterPressed] = useState(false);
  const [refreshPressed, setRefreshPressed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilterPressed(true);

    onFilter({ eventType, user, equipment, dateFrom, dateTo });

    setTimeout(() => setFilterPressed(false), 250);
  };

  const handleRefresh = () => {
    setRefreshPressed(true);
    onRefresh?.();

    setEventType("");
    setUser("");
    setEquipment("");
    setDateFrom("");
    setDateTo("");

    setTimeout(() => setRefreshPressed(false), 250);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-slate-200"
    >
      <div className="flex flex-col">
        <label className="text-sm text-slate-600 mb-1">Event Type</label>
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">All</option>
          <option value="Access Login">Access Login</option>
          <option value="Intrusion Detected">Intrusion Detected</option>
          <option value="Firmware">Firmware Update</option>
          <option value="Connectivity">Connectivity</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-slate-600 mb-1">User</label>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Enter user name"
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-slate-600 mb-1">Equipment</label>
        <input
          type="text"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Enter equipment name"
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-slate-600 mb-1">Date From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col">
        <label className="text-sm text-slate-600 mb-1">Date To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-3 ml-auto">

        <button
          type="submit"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${filterPressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-blue-600 text-white hover:bg-blue-700"
            }
          `}
        >
          <Filter size={18} className={filterPressed ? "animate-spin" : ""} />
          Filter Logs
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${refreshPressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }
          `}
        >
          <RotateCcw size={18} className={refreshPressed ? "animate-spin" : ""} />
          Refresh
        </button>

      </div>
    </form>
  );
};

export default Filters;

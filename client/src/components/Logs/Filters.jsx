import { useState } from "react";
import { RotateCcw, Filter } from "lucide-react";

const Filters = ({ onFilter, onRefresh, eventTypeOptions = [] }) => {
  const [eventType, setEventType] = useState("");
  const [user, setUser] = useState("");
  const [equipment, setEquipment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [filterPressed, setFilterPressed] = useState(false);
  const [refreshPressed, setRefreshPressed] = useState(false);
  const [resetPressed, setResetPressed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilterPressed(true);

    onFilter({ eventType, user, equipment, dateFrom, dateTo });

    setTimeout(() => setFilterPressed(false), 250);
  };

  const handleRefresh = () => {
    setRefreshPressed(true);

    setTimeout(() => {
      onRefresh?.();

      setEventType("");
      setUser("");
      setEquipment("");
      setDateFrom("");
      setDateTo("");

      setRefreshPressed(false);
    }, 150);
  };

  const handleReset = () => {
    setResetPressed(true);

    setEventType("");
    setUser("");
    setEquipment("");
    setDateFrom("");
    setDateTo("");
    onFilter({ eventType: "", user: "", equipment: "", dateFrom: "", dateTo: "" });

    setTimeout(() => setResetPressed(false), 200);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-wrap items-end gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col">
        <label htmlFor="eventType" className="mb-1 text-sm text-slate-600">Event Type</label>
        <select
          id="eventType"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400"
        >
          <option value="">All</option>
          {eventTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="user" className="mb-1 text-sm text-slate-600">User</label>
        <input
          id="user"
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Enter user name"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="equipment" className="mb-1 text-sm text-slate-600">Equipment</label>
        <input
          id="equipment"
          type="text"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Enter equipment name"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="dateFrom" className="mb-1 text-sm text-slate-600">Date From</label>
        <input
          id="dateFrom"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="dateTo" className="mb-1 text-sm text-slate-600">Date To</label>
        <input
          id="dateTo"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400"
        />
      </div>

      <div className="ml-auto flex gap-3">
        <button
          type="submit"
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${filterPressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-orange-500 text-white hover:bg-orange-600"
            }
          `}
        >
          <Filter size={18} className={filterPressed ? "animate-spin" : ""} />
          Filter Logs
        </button>

        <button
          type="button"
          onClick={handleReset}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${resetPressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-white text-slate-700 hover:bg-slate-100"
            }
          `}
        >
          <RotateCcw size={18} className={resetPressed ? "animate-spin" : ""} />
          Reset All
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            border border-slate-200
            ${refreshPressed
              ? "bg-slate-300 text-slate-900 shadow-lg shadow-slate-400/50"
              : "bg-white text-slate-700 hover:bg-slate-100"
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

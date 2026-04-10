import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ totalItems, perPage = 6, page, setPage }) {
  const totalPages = Math.ceil(totalItems / perPage);

  const goPrev = () => page > 1 && setPage(page - 1);
  const goNext = () => page < totalPages && setPage(page + 1);

  const getPages = () => {
    const pages = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }export default function TableRow({ log }) {
  const { timestamp, eventType, user, equipment, action, status } = log;

  // Цвет бейджа статуса
  const statusColor = {
    SUCCESS: "text-green-700 bg-green-100",
    FAILED: "text-red-700 bg-red-100",
    WARNING: "text-yellow-800 bg-yellow-100",
  }[status] || "text-slate-600 bg-slate-100";

  // Фон строки — только для FAILED
  const rowBg =
    status === "FAILED"
      ? "bg-red-50 hover:bg-red-100"
      : "hover:bg-slate-50";

  // Красный жирный текст для критичных полей
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


    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 px-2">

      <p className="text-sm text-slate-600 mb-4 sm:mb-0">
        Showing {(page - 1) * perPage + 1} –{" "}
        {Math.min(page * perPage, totalItems)} of {totalItems} entries
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={goPrev}
          disabled={page === 1}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((p, index) => (
          <button
            key={index}
            onClick={() => typeof p === "number" && setPage(p)}
            disabled={p === "..."}
            className={`
              px-3 py-1 rounded-lg text-sm font-medium transition
              ${p === page
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 hover:bg-slate-100"}
              ${p === "..." ? "cursor-default" : ""}
            `}
          >
            {p}
          </button>
        ))}

        <button
          onClick={goNext}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

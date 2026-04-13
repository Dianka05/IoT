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

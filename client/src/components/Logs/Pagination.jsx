import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ totalItems, perPage = 6, page, setPage }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const goPrev = () => page > 1 && setPage(page - 1);
  const goNext = () => page < totalPages && setPage(page + 1);

  const getPages = () => {
    const pages = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i += 1) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPages();
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const rangeEnd = Math.min(page * perPage, totalItems);

  return (
    <div className="mt-6 flex flex-col px-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="mb-4 text-sm text-slate-600 sm:mb-0">
        Showing {rangeStart} - {rangeEnd} of {totalItems} entries
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={goPrev}
          disabled={page === 1}
          className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {pages.map((item, index) => (
          <button
            key={`${item}-${index}`}
            onClick={() => typeof item === "number" && setPage(item)}
            disabled={item === "..."}
            className={`
              rounded-lg px-3 py-1 text-sm font-medium transition
              ${item === page
                ? "bg-orange-500 text-white"
                : "border border-slate-200 bg-white hover:bg-slate-100"}
              ${item === "..." ? "cursor-default" : ""}
            `}
          >
            {item}
          </button>
        ))}

        <button
          onClick={goNext}
          disabled={page === totalPages}
          className="rounded-lg border border-slate-200 bg-white p-2 transition hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

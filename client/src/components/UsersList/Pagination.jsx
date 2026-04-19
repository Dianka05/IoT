const Pagination = ({ page, setPage, totalPages }) => {
  return (
    <div className="flex justify-end mt-6 gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`
            w-8 h-8 rounded-lg text-sm font-bold transition
            ${page === n
              ? "bg-orange-500 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"}
          `}
        >
          {n}
        </button>
      ))}
    </div>
  );
};

export default Pagination;

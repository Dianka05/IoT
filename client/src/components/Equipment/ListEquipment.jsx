import { useState } from "react";

export default function ListEquipment({ permissions, onToggle, onLimitChange, onDelete }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  return (
    <div className="space-y-3 relative">
      {permissions.map((item) => {
        const enabled = item.access;

        return (
          <div
            key={item.id}
            className="
              relative
              p-4 md:py-6 bg-white border border-slate-200 rounded-xl shadow-sm
              flex flex-col md:flex-row md:items-center md:gap-6 gap-3
            "
          >
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="h-10 w-10 bg-slate-100 rounded-lg" />

              <div className="flex flex-col">
                <span className="font-bold text-slate-900 text-base">
                  {item.name}
                </span>

                <span
                  className={`
                    text-xs font-semibold flex items-center gap-1
                    ${enabled ? "text-green-600" : "text-slate-500"}
                  `}
                >
                  <span
                    className={`
                      inline-block w-2 h-2 rounded-full
                      ${enabled ? "bg-green-500" : "bg-slate-400"}
                    `}
                  />
                  {enabled ? "ACCESS GRANTED" : "ACCESS DENIED"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-center md:flex-1 md:pr-[180px]">
              <label className="text-xs font-medium text-slate-500">
                SESSION LIMIT (MIN)
              </label>

              <input
                type="number"
                value={item.sessionLimit}
                onChange={(e) => onLimitChange(item.id, e.target.value)}
                className="
                  mt-1 w-24 px-3 py-1.5 rounded-lg border border-slate-300
                  text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                "
              />
            </div>

            <div className="flex items-center gap-4 justify-end
md:justify-normal md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2">

              <span className="text-sm font-semibold text-black whitespace-nowrap hidden md:inline">
                {enabled ? "Disapprove" : "Approve"}
              </span>

              <label className="flex items-center cursor-pointer select-none hover:opacity-80 transition">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => onToggle(item.id)}
                    className="peer sr-only"
                  />

                  <div
                    className="
                      w-12 h-6 rounded-full transition
                      peer-checked:bg-green-500 bg-slate-300
                    "
                  />

                  <div
                    className="
                      absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
                      transition peer-checked:translate-x-6
                    "
                  />
                </div>
              </label>

              <div
                className="
                  text-slate-600 hover:text-slate-900 cursor-pointer
                  p-2 rounded-lg hover:bg-slate-100 transition
                "
                onClick={() =>
                  setOpenMenuId(openMenuId === item.id ? null : item.id)
                }
              >
                ⋮
              </div>

              {openMenuId === item.id && (
                <div
                  className="
                    absolute right-2 top-20 md:top-8
                    bg-white border border-slate-200 shadow-lg rounded-lg
                    py-1 w-40 z-[9999] animate-fadeIn
                  "
                >
                  <button
                    onClick={() => {
                      setDeleteItem(item);
                      setOpenMenuId(null);
                    }}
                    className="
                      flex items-center gap-2 px-4 py-2 text-red-600
                      hover:bg-red-50 w-full text-left transition
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 7h12M9 7v10m6-10v10M4 7h16l-1 12a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7zM9 4h6l1 3H8l1-3z"
                      />
                    </svg>

                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {deleteItem && (
        <div
          className="
            fixed inset-0 bg-black/40 flex items-center justify-center z-50
          "
        >
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 animate-scaleIn">
            <h2 className="text-lg font-semibold text-slate-900">
              Delete this equipment permanently?
            </h2>

            <p className="text-sm text-slate-600 mt-2">
              This item will be removed for all users.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteItem(null)}
                className="
                  px-4 py-2 rounded-lg border border-slate-300
                  hover:bg-slate-100 transition
                "
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onDelete(deleteItem.id);
                  setDeleteItem(null);
                }}
                className="
                  px-4 py-2 rounded-lg bg-red-600 text-white
                  hover:bg-red-700 transition
                "
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

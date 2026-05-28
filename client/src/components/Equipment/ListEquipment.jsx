import { useState } from "react";
import SurfaceCard from "../surfaceCard";

export default function ListEquipment({
  permissions = [],
  onToggle = () => {},
  onLimitChange = () => {},
  onDelete = () => {},
  readOnly = false,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  if (!permissions.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h3 className="mb-2 text-lg font-black text-slate-800">
          No equipment available
        </h3>

        <p className="text-sm text-slate-500">
          No devices are assigned to this user yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-3">
      {permissions.map((item) => {
        const enabled = item.access;
        const isFree = item.status === "FREE";

        return (
          <SurfaceCard
            key={item.id}
            className="relative flex justify-between gap-3 p-4 shadow-sm md:flex-row md:items-center md:gap-6 md:py-6"
          >
            <div className="flex flex-shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-black uppercase text-slate-400">
                {String(item.type || "D").slice(0, 1)}
              </div>

              <div className="flex flex-col">
                <span className="text-base font-bold text-slate-900">
                  {item.name}
                </span>

                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    enabled ? "text-green-600" : "text-slate-500"
                  }`}
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      enabled ? "bg-green-500" : "bg-slate-400"
                    }`}
                  />
                  {enabled ? "ACCESS GRANTED" : "ACCESS DENIED"}
                </span>

                {readOnly && (
                  <>
                    <span className="mt-1 text-xs text-slate-400">
                      ID: {item.deviceId || item.id}
                      {item.boxId ? ` | Box: ${item.boxId}` : ""}
                    </span>
                    {item.occupancyLabel && (
                      <span className="mt-1 text-xs font-semibold text-orange-600">
                        {item.occupancyLabel}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start md:flex-1 md:items-center md:pr-[180px]">
              {readOnly ? (
                <>
                  <label className="text-xs font-medium text-slate-500">
                    DEVICE STATUS
                  </label>

                  <span
                    className={`mt-1 rounded-lg px-3 py-1.5 text-xs font-black ${
                      isFree
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.status || "UNKNOWN"}
                  </span>
                </>
              ) : (
                <>
                  <label className="text-xs font-medium text-slate-500">
                    SESSION LIMIT (MIN)
                  </label>

                  <input
                    type="number"
                    value={item.sessionLimit}
                    onChange={(e) => onLimitChange(item.id, e.target.value)}
                    className="mt-1 w-24 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
            </div>

            {!readOnly && (
              <div className="flex items-center justify-end gap-4 md:absolute md:right-4 md:top-1/2 md:-translate-y-1/2 md:justify-normal">
                <span className="hidden whitespace-nowrap text-sm font-semibold text-black md:inline">
                  {enabled ? "Disapprove" : "Approve"}
                </span>

                <label className="flex cursor-pointer items-center select-none transition hover:opacity-80">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => onToggle(item.id)}
                      className="peer sr-only"
                    />

                    <div className="h-6 w-12 rounded-full bg-slate-300 transition peer-checked:bg-green-500" />

                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-6" />
                  </div>
                </label>

                <div
                  className="cursor-pointer rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  onClick={() =>
                    setOpenMenuId(openMenuId === item.id ? null : item.id)
                  }
                >
                  ...
                </div>

                {openMenuId === item.id && (
                  <div className="absolute right-2 top-20 z-[9999] w-40 animate-fadeIn rounded-lg border border-slate-200 bg-white py-1 shadow-lg md:top-8">
                    <button
                      onClick={() => {
                        setDeleteItem(item);
                        setOpenMenuId(null);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 transition hover:bg-red-50"
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
            )}
          </SurfaceCard>
        );
      })}

      {!readOnly && deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 animate-scaleIn rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Delete this equipment permanently?
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              This item will be removed for all users.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onDelete(deleteItem.id);
                  setDeleteItem(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
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

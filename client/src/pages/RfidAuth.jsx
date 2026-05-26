import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { CreditCard, Search } from "lucide-react";

import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import SurfaceCard from "../components/surfaceCard";
import { getRfidCards, updateRfidCardStatus } from "../api/users";
import { useAuth } from "../auth/AuthContext";
import { canUseOperationsDashboard, getDefaultRouteForRole } from "../auth/roles";
import { formatCardUid, formatRoleLabel } from "../utils/currentUser";
import { useToast } from "../toast/ToastProvider";

function normalizeUid(value) {
  return String(value || "").replace(/[^a-fA-F0-9]/g, "").toUpperCase();
}

export default function RfidAuth() {
  const toast = useToast();
  const { role, loading: authLoading, currentOrganizationId, currentOrganization } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingCardUid, setUpdatingCardUid] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState(searchParams.get("uid") || "");
  const highlightedUid = normalizeUid(searchParams.get("uid") || "");

  const loadCards = useCallback(async () => {
    if (!currentOrganizationId) {
      setCards([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setError("");

    try {
      const items = await getRfidCards(500);
      setCards(items);
    } catch (err) {
      console.error("Failed to load RFID cards:", err);
      setError(err.message || "Failed to load RFID cards");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    setQuery(searchParams.get("uid") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && canUseOperationsDashboard(role)) {
      setLoading(true);
      loadCards();
    }
  }, [authLoading, role, loadCards]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCards();
  };

  const handleQuickStatus = async (card, status) => {
    setUpdatingCardUid(card.uid);
    setError("");

    try {
      await updateRfidCardStatus(card.uid, card.userId, status);
      await loadCards();
      toast.success(
        status === "blocked" ? "Card blocked" : "Card activated",
        status === "blocked"
          ? `RFID ${formatCardUid(card.uid)} can no longer be used.`
          : `RFID ${formatCardUid(card.uid)} can be used again.`
      );
    } catch (err) {
      console.error("Failed to update card status:", err);
      setError(err.message || "Failed to update card status");
      toast.error("Update failed", err.message || "The card status could not be updated.");
    } finally {
      setUpdatingCardUid("");
    }
  };

  const filteredCards = useMemo(() => {
    const normalizedQuery = normalizeUid(query);
    const textQuery = String(query || "").trim().toLowerCase();

    return cards.filter((card) => {
      if (!query) {
        return true;
      }

      return (
        normalizeUid(card.uid).includes(normalizedQuery) ||
        String(card.userName || "").toLowerCase().includes(textQuery) ||
        String(card.email || "").toLowerCase().includes(textQuery)
      );
    });
  }, [cards, query]);

  const stats = useMemo(() => {
    const active = cards.filter((card) => card.status === "active").length;
    const blocked = cards.filter((card) => card.status === "blocked").length;

    return {
      total: cards.length,
      active,
      blocked,
    };
  }, [cards]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canUseOperationsDashboard(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return (
    <PageShell
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      mainClassName="flex-1 overflow-y-auto p-4 md:p-8"
      contentClassName="mx-auto max-w-[1440px] space-y-6"
    >
      <PageHeader
        title="RFID Auth"
        subtitle="Review all RFID cards in the current organization and block access in one click."
        setSidebarOpen={setSidebarOpen}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SurfaceCard className="p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Organization
          </p>
          <p className="mt-2 text-lg font-black text-slate-800">
            {currentOrganization?.name || currentOrganizationId || "No organization"}
          </p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Cards
          </p>
          <p className="mt-2 text-lg font-black text-slate-800">{stats.total}</p>
        </SurfaceCard>

        <SurfaceCard className="p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            Active / Blocked
          </p>
          <p className="mt-2 text-lg font-black text-slate-800">
            {stats.active} / {stats.blocked}
          </p>
        </SurfaceCard>
      </div>

      <SurfaceCard className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by card UID, user name, or email"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-orange-400"
            />
          </div>

          {highlightedUid && (
            <button
              type="button"
              onClick={() => {
                setSearchParams({});
                setQuery("");
              }}
              className="rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
            >
              Clear linked UID
            </button>
          )}
        </div>
      </SurfaceCard>

      {highlightedUid && (
        <StatusBanner className="border-orange-200 bg-orange-50/70 text-orange-700">
          Showing result for RFID {formatCardUid(highlightedUid)}
        </StatusBanner>
      )}

      {error && <StatusBanner tone="error">{error}</StatusBanner>}
      {loading && <StatusBanner>Loading RFID cards...</StatusBanner>}

      <SurfaceCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse text-left">
            <thead className="border-b border-slate-100 bg-slate-50/50">
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">Card</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Card Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {!loading && filteredCards.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm font-semibold text-slate-500"
                  >
                    No RFID cards found.
                  </td>
                </tr>
              )}

              {filteredCards.map((card) => {
                const isHighlighted = highlightedUid && normalizeUid(card.uid) === highlightedUid;
                const isBlocked = card.status === "blocked";
                const isUpdating = updatingCardUid === card.uid;

                return (
                  <tr
                    key={card.id}
                    className={`transition hover:bg-slate-50/70 ${
                      isHighlighted ? "bg-orange-50/70" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {formatCardUid(card.uid)}
                          </p>
                          <p className="text-xs text-slate-400">{card.uid}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {card.userName || "Unnamed User"}
                      </p>
                      <p className="text-sm text-slate-500">{card.email || "-"}</p>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {formatRoleLabel(card.role)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          card.active
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {card.active ? "User Active" : "User Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          isBlocked
                            ? "bg-red-50 text-red-600"
                            : card.status === "lost"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {card.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isUpdating || !isBlocked}
                          onClick={() => handleQuickStatus(card, "active")}
                          className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Activate
                        </button>

                        <button
                          type="button"
                          disabled={isUpdating || isBlocked}
                          onClick={() => handleQuickStatus(card, "blocked")}
                          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Block
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}

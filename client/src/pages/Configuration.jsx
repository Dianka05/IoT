import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import LoadingScreen from "../components/loadingScreen";
import PageHeader from "../components/pageHeader";
import PageShell from "../components/pageShell";
import StatusBanner from "../components/statusBanner";
import { getBoxes } from "../api/equipment";
import {
  getSecurityConfiguration,
  updateSecurityConfiguration,
} from "../api/configuration";
import { useAuth } from "../auth/AuthContext";
import { canUseOperationsDashboard, getDefaultRouteForRole } from "../auth/roles";

function createFormState(source = {}) {
  return {
    enabled: source.enabled !== false,
    requireMotion: source.requireMotion !== false,
    distanceCmThreshold: String(source.distanceCmThreshold ?? 40),
    suspiciousPresenceDurationSec: String(source.suspiciousPresenceDurationSec ?? 30),
    deniedAccessLookbackSec: String(source.deniedAccessLookbackSec ?? 120),
    suspiciousPresenceCooldownSec: String(source.suspiciousPresenceCooldownSec ?? 180),
  };
}

function serializeFormState(form = {}) {
  return {
    enabled: form.enabled !== false,
    requireMotion: form.requireMotion !== false,
    distanceCmThreshold: Number(form.distanceCmThreshold || 0),
    suspiciousPresenceDurationSec: Number(form.suspiciousPresenceDurationSec || 0),
    deniedAccessLookbackSec: Number(form.deniedAccessLookbackSec || 0),
    suspiciousPresenceCooldownSec: Number(form.suspiciousPresenceCooldownSec || 0),
  };
}

function RuleFields({ form, onChange, disabled = false }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span className="font-semibold">Distance Threshold (cm)</span>
        <input
          type="number"
          min="0"
          value={form.distanceCmThreshold}
          disabled={disabled}
          onChange={(event) => onChange("distanceCmThreshold", event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span className="font-semibold">Presence Duration (sec)</span>
        <input
          type="number"
          min="0"
          value={form.suspiciousPresenceDurationSec}
          disabled={disabled}
          onChange={(event) => onChange("suspiciousPresenceDurationSec", event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span className="font-semibold">Denied Access Lookback (sec)</span>
        <input
          type="number"
          min="0"
          value={form.deniedAccessLookbackSec}
          disabled={disabled}
          onChange={(event) => onChange("deniedAccessLookbackSec", event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-slate-700">
        <span className="font-semibold">Alert Cooldown (sec)</span>
        <input
          type="number"
          min="0"
          value={form.suspiciousPresenceCooldownSec}
          disabled={disabled}
          onChange={(event) => onChange("suspiciousPresenceCooldownSec", event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
        />
      </label>
    </div>
  );
}

export default function Configuration() {
  const { role, loading: authLoading, currentOrganizationId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [defaultsForm, setDefaultsForm] = useState(createFormState());
  const [boxForms, setBoxForms] = useState({});
  const [overrideEnabled, setOverrideEnabled] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadConfiguration = useCallback(async () => {
    if (!currentOrganizationId) {
      setBoxes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [configuration, boxesList] = await Promise.all([
        getSecurityConfiguration(),
        getBoxes(200),
      ]);

      const defaults = createFormState(configuration?.presenceDetection || {});
      const nextOverrideEnabled = {};
      const nextBoxForms = {};

      boxesList.forEach((box) => {
        const boxId = String(box.boxId || box.id || "");
        const override = configuration?.boxOverrides?.[boxId];

        nextOverrideEnabled[boxId] = Boolean(override);
        nextBoxForms[boxId] = createFormState(override || configuration?.presenceDetection || {});
      });

      setDefaultsForm(defaults);
      setBoxes(boxesList);
      setOverrideEnabled(nextOverrideEnabled);
      setBoxForms(nextBoxForms);
    } catch (err) {
      console.error("Failed to load configuration:", err);
      setError(err.message || "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    if (!authLoading && canUseOperationsDashboard(role)) {
      loadConfiguration();
    }
  }, [authLoading, role, loadConfiguration]);

  const handleDefaultsChange = (field, value) => {
    setDefaultsForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBoxChange = (boxId, field, value) => {
    setBoxForms((current) => ({
      ...current,
      [boxId]: {
        ...createFormState(defaultsForm),
        ...(current[boxId] || {}),
        [field]: value,
      },
    }));
  };

  const handleOverrideToggle = (boxId, checked) => {
    setOverrideEnabled((current) => ({
      ...current,
      [boxId]: checked,
    }));

    if (checked) {
      setBoxForms((current) => ({
        ...current,
        [boxId]: current[boxId] || createFormState(defaultsForm),
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const boxOverrides = {};

      Object.entries(overrideEnabled).forEach(([boxId, enabled]) => {
        if (enabled) {
          boxOverrides[boxId] = serializeFormState(
            boxForms[boxId] || createFormState(defaultsForm)
          );
        }
      });

      await updateSecurityConfiguration({
        presenceDetection: serializeFormState(defaultsForm),
        boxOverrides,
      });

      setSuccess("Configuration saved.");
      await loadConfiguration();
    } catch (err) {
      console.error("Failed to save configuration:", err);
      setError(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const sortedBoxes = useMemo(
    () =>
      [...boxes].sort((left, right) =>
        String(left.name || left.boxId || left.id || "").localeCompare(
          String(right.name || right.boxId || right.id || "")
        )
      ),
    [boxes]
  );

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!canUseOperationsDashboard(role)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return (
    <PageShell sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <PageHeader
        title="Configuration"
        subtitle="Define how box presence data is interpreted for suspicious activity detection."
        setSidebarOpen={setSidebarOpen}
        onRefresh={loadConfiguration}
        refreshing={loading && boxes.length > 0}
        action={(
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        )}
      />

      <div className="space-y-6">
        {error && (
          <StatusBanner tone="error">
            {error}
          </StatusBanner>
        )}

        {success && (
          <StatusBanner className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {success}
          </StatusBanner>
        )}

        {loading && (
          <StatusBanner>
            Loading configuration...
          </StatusBanner>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Organization Defaults</h2>
            <p className="text-sm text-slate-500">
              These rules apply to all boxes unless a box-specific override is enabled below.
            </p>
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="font-semibold text-slate-900">Suspicious Presence Detection</div>
                <div className="text-sm text-slate-500">Turn rule-based presence logging on or off.</div>
              </div>
              <input
                type="checkbox"
                checked={defaultsForm.enabled}
                onChange={(event) => handleDefaultsChange("enabled", event.target.checked)}
                className="h-5 w-5 accent-orange-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <div className="font-semibold text-slate-900">Require Motion Flag</div>
                <div className="text-sm text-slate-500">Only count presence when the box reports motion.</div>
              </div>
              <input
                type="checkbox"
                checked={defaultsForm.requireMotion}
                onChange={(event) => handleDefaultsChange("requireMotion", event.target.checked)}
                className="h-5 w-5 accent-orange-500"
              />
            </label>
          </div>

          <RuleFields form={defaultsForm} onChange={handleDefaultsChange} disabled={!defaultsForm.enabled} />
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-slate-900">Box Overrides</h2>
            <p className="text-sm text-slate-500">
              Use this only when one box needs stricter or looser rules than the organization default.
            </p>
          </div>

          {sortedBoxes.length === 0 ? (
            <StatusBanner>
              No boxes found for the current organization.
            </StatusBanner>
          ) : (
            sortedBoxes.map((box) => {
              const boxId = String(box.boxId || box.id || "");
              const form = boxForms[boxId] || createFormState(defaultsForm);
              const isEnabled = overrideEnabled[boxId] === true;

              return (
                <article
                  key={boxId}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {box.name || boxId}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {boxId}{box.location ? ` · ${box.location}` : ""}
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(event) => handleOverrideToggle(boxId, event.target.checked)}
                        className="h-4 w-4 accent-orange-500"
                      />
                      Use box-specific rules
                    </label>
                  </div>

                  <div className="mb-5 grid gap-4 md:grid-cols-2">
                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-900">Detection Enabled</div>
                        <div className="text-sm text-slate-500">Override whether this box creates suspicious logs.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.enabled}
                        disabled={!isEnabled}
                        onChange={(event) => handleBoxChange(boxId, "enabled", event.target.checked)}
                        className="h-5 w-5 accent-orange-500 disabled:opacity-50"
                      />
                    </label>

                    <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <div>
                        <div className="font-semibold text-slate-900">Require Motion Flag</div>
                        <div className="text-sm text-slate-500">Override whether motion is mandatory for this box.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.requireMotion}
                        disabled={!isEnabled}
                        onChange={(event) => handleBoxChange(boxId, "requireMotion", event.target.checked)}
                        className="h-5 w-5 accent-orange-500 disabled:opacity-50"
                      />
                    </label>
                  </div>

                  <RuleFields
                    form={form}
                    onChange={(field, value) => handleBoxChange(boxId, field, value)}
                    disabled={!isEnabled || !form.enabled}
                  />
                </article>
              );
            })
          )}
        </section>
      </div>
    </PageShell>
  );
}

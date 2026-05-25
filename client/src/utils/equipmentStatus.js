function parseBooleanLike(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;

  if (["true", "1", "yes", "on", "online", "connected", "enabled"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off", "offline", "disconnected", "disabled"].includes(normalized)) {
    return false;
  }

  return null;
}

function normalizeMode(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized.toUpperCase() : null;
}

export function getConnectivitySnapshot(entity = {}) {
  const connectivity = entity?.connectivity || {};
  const payload = entity?.lastStatusPayload || {};

  const mode = normalizeMode(
    connectivity.mode ??
      payload.mode ??
      payload.operationMode ??
      null
  );

  const wifi = parseBooleanLike(
    connectivity.wifi ?? payload.wifi ?? null
  );

  const mqtt = parseBooleanLike(
    connectivity.mqtt ?? payload.mqtt ?? null
  );

  const online = parseBooleanLike(
    connectivity.online ??
      payload.online ??
      payload.connected ??
      payload.connection ??
      null
  );

  const reportedStatus = String(
    connectivity.reportedStatus ??
      payload.status ??
      payload.state ??
      entity?.status ??
      ""
  )
    .trim()
    .toLowerCase();

  const derivedStatus = String(
    connectivity.status ?? entity?.status ?? "offline"
  )
    .trim()
    .toLowerCase();

  return {
    mode,
    wifi,
    mqtt,
    online,
    reportedStatus,
    status: derivedStatus || "offline",
  };
}

export function getDisplayStatus(entity = {}) {
  if (entity?.active === false) {
    return "disabled";
  }

  const snapshot = getConnectivitySnapshot(entity);
  return snapshot.status || "offline";
}

export function isEntityOffline(entity = {}) {
  const snapshot = getConnectivitySnapshot(entity);
  return (
    entity?.active === false ||
    snapshot.online === false ||
    snapshot.wifi === false ||
    snapshot.mqtt === false ||
    snapshot.status === "offline"
  );
}

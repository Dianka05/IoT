function parseBooleanLike(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0

  const normalized = String(value || '')
    .trim()
    .toLowerCase()

  if (!normalized) return null
  if (['true', '1', 'yes', 'on', 'online', 'connected', 'enabled'].includes(normalized)) {
    return true
  }
  if (['false', '0', 'no', 'off', 'offline', 'disconnected', 'disabled'].includes(normalized)) {
    return false
  }

  return null
}

function getTimestampMillis(value) {
  if (!value) return null
  if (typeof value === 'number') return value
  if (value instanceof Date) return value.getTime()
  if (typeof value?._seconds === 'number') {
    return value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1000000)
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function normalizeMode(value) {
  const normalized = String(value || '').trim()
  return normalized ? normalized.toUpperCase() : null
}

function normalizeReportedStatus(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized || null
}

function deriveConnectivityState(payload = {}, entity = {}) {
  const reportedStatus = normalizeReportedStatus(payload.status || payload.state || null)
  const mode = normalizeMode(payload.mode || payload.operationMode || null)
  const wifi = parseBooleanLike(payload.wifi)
  const mqtt = parseBooleanLike(payload.mqtt)
  const onlineRaw = parseBooleanLike(
    payload.online ?? payload.connected ?? payload.connection ?? null
  )
  const enabled = parseBooleanLike(payload.enabled)
  const active = entity.active !== false && enabled !== false

  let online = onlineRaw

  if (online === null) {
    if (wifi === false || mqtt === false) {
      online = false
    } else if (wifi === true && mqtt === true) {
      online = true
    }
  }

  let status = 'offline'

  if (active) {
    if (wifi === false || mqtt === false || online === false) {
      status = 'offline'
    } else if (reportedStatus === 'busy' || reportedStatus === 'reserved' || reportedStatus === 'in_use') {
      status = reportedStatus
    } else if (reportedStatus === 'maintenance') {
      status = 'maintenance'
    } else if (reportedStatus === 'idle' || reportedStatus === 'free' || reportedStatus === 'ready') {
      status = reportedStatus
    } else if (mode === 'MAINTENANCE') {
      status = 'maintenance'
    } else if (online === true || wifi === true || mqtt === true) {
      status = 'online'
    }
  }

  return {
    status,
    connectivity: {
      online,
      wifi,
      mqtt,
      mode,
      reportedStatus,
      enabled: active,
    },
  }
}

function applyConnectivityFreshness(entity = {}, nowMs = Date.now()) {
  const staleAfterMs = Number(process.env.CONNECTIVITY_STALE_AFTER_MS || 120000)
  const snapshot = entity.connectivity || {}
  const lastSeenAt = getTimestampMillis(snapshot.lastSeenAt || entity.lastSeenAt || null)
  const active = entity.active !== false

  if (!active) {
    return {
      ...entity,
      status: 'disabled',
      connectivity: {
        ...snapshot,
        online: false,
      },
    }
  }

  const isStale = !lastSeenAt || nowMs - lastSeenAt > staleAfterMs
  if (!isStale) {
    return entity
  }

  return {
    ...entity,
    status: 'offline',
    connectivity: {
      ...snapshot,
      online: false,
    },
  }
}

module.exports = {
  parseBooleanLike,
  deriveConnectivityState,
  getTimestampMillis,
  applyConnectivityFreshness,
}

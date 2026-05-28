const { listSessionsByOrganization } = require('../modules/sessions/sessions.store.firestore')

const ACTIVE_STATUSES = new Set(['ready_for_auth', 'missed', 'active'])
const OCCUPANCY_CACHE_TTL_MS = 3000
const occupancyCache = new Map()

function toMillis(timestamp) {
  if (!timestamp) return null
  if (typeof timestamp === 'number') return timestamp
  if (timestamp instanceof Date) return timestamp.getTime()
  if (typeof timestamp?.toMillis === 'function') return timestamp.toMillis()
  if (typeof timestamp?._seconds === 'number') {
    return timestamp._seconds * 1000 + Math.floor((timestamp._nanoseconds || 0) / 1000000)
  }
  return null
}

function getEffectiveStatus(session, nowMs = Date.now()) {
  const status = String(session?.status || '').toLowerCase()
  if (status === 'active' || status === 'ended' || status === 'expired' || status === 'cancelled') {
    return status
  }

  const startMs = toMillis(session?.scheduledStartAt || session?.createdAt)
  const authWindowEndsAtMs = toMillis(session?.authWindowEndsAt)
  const endMs = toMillis(session?.scheduledEndAt)

  if (startMs === null || endMs === null) {
    return status
  }

  if (nowMs > endMs) {
    return 'expired'
  }

  if (nowMs < startMs) {
    return 'scheduled'
  }

  if (authWindowEndsAtMs !== null && nowMs <= authWindowEndsAtMs) {
    return 'ready_for_auth'
  }

  return 'missed'
}

function getPriority(status) {
  if (status === 'active') return 3
  if (status === 'missed') return 2
  if (status === 'ready_for_auth') return 1
  return 0
}

async function buildOccupancyMaps(organizationId, limit = 500) {
  if (!organizationId) {
    return {
      byDeviceId: new Map(),
      byBoxId: new Map(),
    }
  }

  const cacheKey = `${organizationId}:${limit}`
  const cached = occupancyCache.get(cacheKey)
  const nowMs = Date.now()

  if (cached && nowMs - cached.createdAt <= OCCUPANCY_CACHE_TTL_MS) {
    return cached.value
  }

  if (cached?.promise) {
    return cached.promise
  }

  const promise = (async () => {
  const sessions = await listSessionsByOrganization(organizationId, limit)
  const byDeviceId = new Map()
  const byBoxId = new Map()

  sessions.forEach((session) => {
    const status = getEffectiveStatus(session)
    if (!ACTIVE_STATUSES.has(status)) {
      return
    }

    const occupancy = {
      sessionId: session.sessionId || session.id || null,
      status,
      userId: session.userId || null,
      userName: session.userName || null,
      uid: session.uid || null,
      boxId: session.boxId || null,
      deviceIds: Array.isArray(session.deviceIds) ? session.deviceIds : [],
    }

    const currentBox = byBoxId.get(session.boxId)
    if (!currentBox || getPriority(status) > getPriority(currentBox.status)) {
      byBoxId.set(session.boxId, occupancy)
    }

    occupancy.deviceIds.forEach((deviceId) => {
      const currentDevice = byDeviceId.get(deviceId)
      if (!currentDevice || getPriority(status) > getPriority(currentDevice.status)) {
        byDeviceId.set(deviceId, occupancy)
      }
    })
  })

    return {
      byDeviceId,
      byBoxId,
    }
  })()

  occupancyCache.set(cacheKey, {
    createdAt: nowMs,
    promise,
  })

  try {
    const value = await promise
    occupancyCache.set(cacheKey, {
      createdAt: Date.now(),
      value,
    })
    return value
  } catch (error) {
    occupancyCache.delete(cacheKey)
    throw error
  }
}

function clearOccupancyCache(organizationId = null) {
  if (!organizationId) {
    occupancyCache.clear()
    return
  }

  for (const key of occupancyCache.keys()) {
    if (key.startsWith(`${organizationId}:`)) {
      occupancyCache.delete(key)
    }
  }
}

module.exports = {
  buildOccupancyMaps,
  clearOccupancyCache,
}

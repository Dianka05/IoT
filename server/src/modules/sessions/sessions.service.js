const { randomUUID } = require('crypto')
const store = require('./sessions.store.firestore')
const { publishEndSession, publishAuthResult } = require('../boxes/main-box/boxes.service')
const { publishDeviceAccessSet, publishDeviceEndSession } = require('../devices/fan-1/device.service')
const {
  logAuthDenied,
  logAuthGranted,
  logSessionStarted,
  logSessionEnded,
} = require('../logs/logs.service')
const {
  findActiveUserByUidForOrganization,
  findUserCardAccessForOrganization,
} = require('../users/users.service')
const { getBoxById } = require('../boxes/main-box/boxes.store.firestore')
const { getDevicesByIds } = require('../devices/fan-1/devices.store.firestore')
const { clearOccupancyCache } = require('../../shared/session-occupancy')

const AUTH_WINDOW_MS = 60 * 1000
const RESERVATION_BUFFER_MS = 60 * 1000
const MIN_NOTICE_MS = 60 * 1000
const MAX_FUTURE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
const FINAL_STATUSES = new Set(['ended', 'expired', 'cancelled'])
const CLAIMABLE_AUTH_STATUSES = new Set(['ready_for_auth', 'missed'])

function normalizeEntityStatus(entity = {}) {
  if (entity?.active === false) {
    return 'disabled'
  }

  return String(entity?.status || '').trim().toLowerCase()
}

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

function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

function toPositiveInteger(value, fallback) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.round(parsed)
}

function getSessionWindow(session) {
  const scheduledStartAtMs = toMillis(
    session.scheduledStartAt || session.startedAt || session.createdAt
  )
  const scheduledEndAtMs = toMillis(session.scheduledEndAt)

  if (scheduledStartAtMs !== null && scheduledEndAtMs !== null) {
    return {
      startMs: scheduledStartAtMs,
      endMs: scheduledEndAtMs,
    }
  }

  const durationSec = toPositiveInteger(session.sessionDurationSec, 0)
  if (scheduledStartAtMs !== null && durationSec > 0) {
    return {
      startMs: scheduledStartAtMs,
      endMs: scheduledStartAtMs + durationSec * 1000,
    }
  }

  return {
    startMs: scheduledStartAtMs,
    endMs: null,
  }
}

function deriveReservationStatus(session, nowMs) {
  const currentStatus = String(session.status || '').toLowerCase()
  if (FINAL_STATUSES.has(currentStatus) || currentStatus === 'active') {
    return currentStatus
  }

  const { startMs, endMs } = getSessionWindow(session)
  if (startMs === null || endMs === null) {
    return currentStatus || 'scheduled'
  }

  if (nowMs > endMs) {
    return 'expired'
  }

  if (nowMs < startMs) {
    return 'scheduled'
  }

  if (nowMs <= startMs + AUTH_WINDOW_MS) {
    return 'ready_for_auth'
  }

  return 'missed'
}

function reconcileSessionState(session, nowMs = Date.now()) {
  if (!session) return null

  const nextStatus = deriveReservationStatus(session, nowMs)
  const currentStatus = String(session.status || '').toLowerCase()
  if (nextStatus === currentStatus) {
    return session
  }

  const derivedSession = {
    ...session,
    status: nextStatus,
  }

  if (nextStatus === 'expired') {
    derivedSession.expiredAt = session.expiredAt || new Date(nowMs)
    derivedSession.expiredReason = session.expiredReason || 'reservation_window_elapsed'
    derivedSession.endedAt = session.endedAt || new Date(nowMs)
    derivedSession.endReason = session.endReason || 'reservation_window_elapsed'
  }

  return derivedSession
}

function reconcileSessions(sessions = [], nowMs = Date.now()) {
  return sessions.map((session) => reconcileSessionState(session, nowMs)).filter(Boolean)
}

function sessionUsesDevice(session, deviceId) {
  return Array.isArray(session.deviceIds) && session.deviceIds.includes(deviceId)
}

function windowsConflict(leftWindow, rightWindow) {
  if (
    leftWindow.startMs === null ||
    leftWindow.endMs === null ||
    rightWindow.startMs === null ||
    rightWindow.endMs === null
  ) {
    return false
  }

  const noConflict =
    leftWindow.endMs + RESERVATION_BUFFER_MS <= rightWindow.startMs ||
    rightWindow.endMs + RESERVATION_BUFFER_MS <= leftWindow.startMs

  return !noConflict
}

function buildConflictMessage(existingSession) {
  const status = String(existingSession.status || '').toLowerCase()

  if (status === 'active') {
    return 'Device is currently in use'
  }

  if (status === 'scheduled') {
    return 'Device already has a future reservation in the selected time window'
  }

  if (status === 'ready_for_auth') {
    return 'Device is waiting for RFID confirmation for another reservation'
  }

  if (status === 'missed') {
    return 'Device is still held by another unfinished reservation'
  }

  return 'Device is not available for the selected time window'
}

async function expireSessionForConflict(session, nowMs = Date.now()) {
  const updated = await store.updateSession(session.sessionId || session.id, {
    status: 'expired',
    expiredAt: new Date(nowMs),
    expiredReason: 'overridden_by_new_reservation',
    endedAt: new Date(nowMs),
    endReason: 'overridden_by_new_reservation',
  })
  if (session?.organizationId) {
    clearOccupancyCache(session.organizationId)
  }
  return updated
}

async function getReconciledOrganizationSessions(organizationId, limit = 500, status = null) {
  const sessions = await store.listSessionsByOrganization(organizationId, limit, status)
  return reconcileSessions(sessions, Date.now())
}

async function handleAuthRequest(msg) {
  const { uid, boxId } = msg.payload
  const box = await getBoxById(boxId)
  const cardAccess = box?.organizationId
    ? await findUserCardAccessForOrganization(uid, box.organizationId)
    : null

  if (!cardAccess) {
    await logAuthDenied({ uid, boxId, knownCard: false }, 'uid_not_recognized')

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'uid_not_recognized',
    })
  }

  const { user: recognizedUser, card } = cardAccess

  if (card.status === 'blocked') {
    await logAuthDenied(
      {
        uid,
        boxId,
        userId: recognizedUser.userId,
        userName: recognizedUser.name,
        knownCard: true,
      },
      'blocked_card'
    )

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'blocked_card',
    })
  }

  if (card.status !== 'active') {
    const reason = `card_status_${card.status}`
    await logAuthDenied(
      {
        uid,
        boxId,
        userId: recognizedUser.userId,
        userName: recognizedUser.name,
        knownCard: true,
      },
      reason
    )

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason,
    })
  }

  const user = box?.organizationId
    ? await findActiveUserByUidForOrganization(uid, box.organizationId)
    : null

  if (!user) {
    await logAuthDenied(
      {
        uid,
        boxId,
        userId: recognizedUser.userId,
        userName: recognizedUser.name,
        knownCard: true,
      },
      'user_inactive'
    )

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'user_inactive',
    })
  }

  const nowMs = Date.now()
  const sessions = box?.organizationId
    ? await getReconciledOrganizationSessions(box.organizationId, 500)
    : []
  const session = sessions
    .filter((item) => {
      if (item.uid !== uid) return false
      if ((item.boxId || null) !== boxId) return false
      if (item.startedAt) return false

      const status = String(item.status || '').toLowerCase()
      if (!CLAIMABLE_AUTH_STATUSES.has(status)) {
        return false
      }

      const { startMs, endMs } = getSessionWindow(item)
      return startMs !== null && endMs !== null && nowMs >= startMs && nowMs <= endMs
    })
    .sort((left, right) => {
      const leftStart = toMillis(left.scheduledStartAt || left.createdAt) || 0
      const rightStart = toMillis(right.scheduledStartAt || right.createdAt) || 0
      return leftStart - rightStart
    })[0]

  if (!session) {
    await logAuthDenied(
      {
        uid,
        boxId,
        userId: user.userId,
        userName: user.name,
        knownCard: true,
      },
      'no_pending_session'
    )

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'no pending session',
    })
  }

  const { endMs } = getSessionWindow(session)
  const remainingSec = Math.max(1, Math.floor((endMs - nowMs) / 1000))
  const startedSession = await store.markSessionStarted(session.sessionId, {
    startedAt: new Date(nowMs),
    sessionDurationSec: remainingSec,
  })
  if (box?.organizationId) {
    clearOccupancyCache(box.organizationId)
  }

  await logAuthGranted(startedSession)

  return publishAuthResult(boxId, {
    uid: startedSession.uid,
    allowed: true,
    userId: startedSession.userId,
    userName: startedSession.userName,
    role: startedSession.role,
    sessionId: startedSession.sessionId,
    deviceIds: startedSession.deviceIds,
    sessionDurationSec: remainingSec,
    mode: startedSession.mode,
    reason: null,
  })
}

async function handleSessionStarted(msg) {
  const { sessionId } = msg.payload
  if (!sessionId) return null

  const session = await store.markSessionStarted(sessionId)
  if (session) {
    clearOccupancyCache(session.organizationId)
    for (const deviceId of session.deviceIds || []) {
      publishDeviceAccessSet(
        deviceId,
        true,
        session.sessionId,
        session.sessionDurationSec,
      )
    }

    await logSessionStarted(
      {
        boxId: session.boxId,
        sessionId: session.sessionId,
      },
      session
    )
  }

  return session
}

async function handleSessionEnded(msg) {
  const { sessionId } = msg.payload
  if (!sessionId) return null

  const existingSession = await store.getSession(sessionId)
  if (existingSession) {
    for (const deviceId of existingSession.deviceIds || []) {
      publishDeviceEndSession(deviceId, msg.payload.reason || 'box_session_ended')
    }
  }

  const terminationRequest = existingSession?.terminationRequest || null
  const endReason =
    msg.payload.reason ||
    terminationRequest?.reason ||
    'automatic'
  const endedByUserId = terminationRequest?.requestedByUserId || null
  const endedByName = terminationRequest?.requestedByName || null
  const endedByRole = terminationRequest?.requestedByRole || null
  const forced = terminationRequest?.forced === true

  const session = await store.endSession(sessionId, {
    endReason,
    endedByUserId,
    endedByName,
    endedByRole,
    forced,
    terminationRequest: null,
  })
  if (session?.organizationId) {
    clearOccupancyCache(session.organizationId)
  }

  if (existingSession?.endLogWrittenAt) {
    return session
  }

  await logSessionEnded(msg.payload, session)
  const updated = await store.updateSession(sessionId, {
    endLogWrittenAt: new Date(),
  })
  return updated
}

function handleSessionsState(msg) {
  console.log('Sessions state: ', msg.payload)
}

async function forceEndSession(boxId, sessionId, reason = 'manual') {
  const session = await store.getSession(sessionId)
  if (!session) return null

  publishEndSession(boxId, { sessionId, reason })
  return session
}

async function forceEndSessionByDeviceId(deviceId, reason = 'manual', sessionId = null) {
  const session = sessionId
    ? await store.getSession(sessionId)
    : await store.findActiveSessionByDeviceId(deviceId)

  if (!session) return null

  if (!(session.deviceIds || []).includes(deviceId)) {
    return null
  }

  if (session.boxId) {
    publishEndSession(session.boxId, { sessionId: session.sessionId, reason })
  }

  return session
}

async function getSessionsForProfile(profile, limit = 50, status = null) {
  const sessions = await getReconciledOrganizationSessions(
    profile.currentOrganizationId,
    limit,
    status
  )

  if (profile.role === 'admin' || profile.role === 'technician') {
    return sessions
  }

  return sessions.filter((session) => session.userId === profile.userId)
}

async function getSessionByIdForProfile(profile, sessionId) {
  const session = reconcileSessionState(await store.getSession(sessionId))
  if (!session) return null

  if (session.organizationId !== profile.currentOrganizationId) {
    return null
  }

  if (profile.role === 'admin' || profile.role === 'technician') {
    return session
  }

  return session.userId === profile.userId ? session : null
}

async function createPendingSession(data = {}) {
  if (!data.boxId) throw new Error('boxId is required')
  if (!data.uid) throw new Error('uid is required')
  if (!Array.isArray(data.deviceIds) || data.deviceIds.length === 0) {
    throw new Error('deviceIds is required')
  }

  const box = await getBoxById(data.boxId)
  if (!box) {
    throw new Error('BOX_NOT_FOUND')
  }

  const organizationId = box.organizationId
  if (!organizationId) {
    throw new Error('BOX_ORGANIZATION_NOT_SET')
  }

  const boxStatus = normalizeEntityStatus(box)
  if (boxStatus === 'maintenance') {
    throw new Error('Box is in maintenance mode')
  }

  if (boxStatus === 'offline' || boxStatus === 'disabled') {
    throw new Error('Box is not available')
  }

  const user = await findActiveUserByUidForOrganization(data.uid, organizationId)
  if (!user) {
    throw new Error('Active user not found for uid in organization')
  }

  const allowedDeviceIds = new Set(user.allowedDeviceIds || [])
  const normalizedDeviceIds = [...new Set(data.deviceIds.map((deviceId) => String(deviceId)))]
  const durationSec = toPositiveInteger(
    data.sessionDurationSec,
    toPositiveInteger(user.sessionDurationSec, 1800)
  )

  const nowMs = Date.now()
  const requestedStartAt = data.scheduledStartAt ? toDate(data.scheduledStartAt) : null
  const scheduledStartAtMs = requestedStartAt ? requestedStartAt.getTime() : nowMs
  const isScheduledForLater = requestedStartAt !== null && scheduledStartAtMs > nowMs

  if (requestedStartAt && scheduledStartAtMs < nowMs) {
    throw new Error('Reservation cannot be created in the past')
  }

  if (
    isScheduledForLater &&
    scheduledStartAtMs - nowMs < MIN_NOTICE_MS
  ) {
    throw new Error('Scheduled reservations must be created at least 1 minute in advance')
  }

  if (scheduledStartAtMs - nowMs > MAX_FUTURE_WINDOW_MS) {
    throw new Error('Reservations cannot be scheduled more than 7 days ahead')
  }

  const scheduledEndAtMs = scheduledStartAtMs + durationSec * 1000
  const authWindowEndsAtMs = scheduledStartAtMs + AUTH_WINDOW_MS

  const existingSessions = await getReconciledOrganizationSessions(organizationId, 500)
  const devices = await getDevicesByIds(normalizedDeviceIds)
  const deviceMap = new Map(
    devices.map((device) => [String(device.deviceId || device.id), device])
  )
  for (const deviceId of normalizedDeviceIds) {
    const device = deviceMap.get(deviceId)

    if (!device) {
      throw new Error(`Device not found: ${deviceId}`)
    }

    if (device.organizationId !== organizationId) {
      throw new Error(`Device is outside organization: ${deviceId}`)
    }

    if ((device.boxId || null) !== data.boxId) {
      throw new Error(`Device does not belong to box: ${deviceId}`)
    }

    const deviceStatus = normalizeEntityStatus(device)
    if (deviceStatus === 'maintenance') {
      throw new Error(`Device is in maintenance mode: ${deviceId}`)
    }

    if (deviceStatus === 'offline' || deviceStatus === 'disabled') {
      throw new Error(`Device is not available: ${deviceId}`)
    }

    if (!allowedDeviceIds.has(deviceId)) {
      throw new Error(`Device is not allowed for user: ${deviceId}`)
    }

    for (const existingSession of existingSessions) {
      const existingStatus = String(existingSession.status || '').toLowerCase()
      if (FINAL_STATUSES.has(existingStatus)) {
        continue
      }

      if (!sessionUsesDevice(existingSession, deviceId)) {
        continue
      }

      const existingWindow = getSessionWindow(existingSession)
      const nextWindow = {
        startMs: scheduledStartAtMs,
        endMs: scheduledEndAtMs,
      }

      if (!windowsConflict(existingWindow, nextWindow)) {
        continue
      }

      if (existingStatus === 'missed' && !existingSession.startedAt) {
        await expireSessionForConflict(existingSession, nowMs)
        continue
      }

      throw new Error(`${buildConflictMessage(existingSession)}: ${deviceId}`)
    }
  }

  const session = {
    sessionId: randomUUID(),
    organizationId,
    boxId: data.boxId,
    uid: data.uid,
    userId: user.userId,
    userName: user.name,
    role: user.role || 'user',
    deviceIds: normalizedDeviceIds,
    sessionDurationSec: durationSec,
    originalSessionDurationSec: durationSec,
    mode: isScheduledForLater ? 'scheduled' : 'manual',
    scheduledStartAt: new Date(scheduledStartAtMs),
    scheduledEndAt: new Date(scheduledEndAtMs),
    authWindowEndsAt: new Date(authWindowEndsAtMs),
    status: deriveReservationStatus(
      {
        scheduledStartAt: new Date(scheduledStartAtMs),
        scheduledEndAt: new Date(scheduledEndAtMs),
        status: 'scheduled',
      },
      nowMs
    ),
  }

  const createdSession = await store.createSession(session)
  clearOccupancyCache(organizationId)
  return createdSession
}

async function startSessionById(sessionId) {
  const session = await store.markSessionStarted(sessionId)
  if (session?.organizationId) {
    clearOccupancyCache(session.organizationId)
  }
  return session
}

async function endSessionById(sessionId, reason = 'manual', actor = null) {
  const session = reconcileSessionState(await store.getSession(sessionId))
  if (!session) return null

  const status = String(session.status || '').toLowerCase()
  const forced =
    Boolean(actor) &&
    (actor.role === 'admin' || actor.role === 'technician') &&
    actor.userId !== session.userId

  const terminationRequest = actor
    ? {
        reason,
        requestedAt: new Date(),
        requestedByUserId: actor.userId || null,
        requestedByName: actor.name || actor.email || actor.userId || 'Operations',
        requestedByRole: actor.role || null,
        forced,
      }
    : {
        reason,
        requestedAt: new Date(),
        requestedByUserId: null,
        requestedByName: null,
        requestedByRole: null,
        forced: false,
      }

  if (status !== 'active') {
    const updated = await store.updateSession(sessionId, {
      status: 'cancelled',
      endedAt: new Date(),
      endReason: reason,
      expiredReason: null,
      terminationRequest,
    })
    clearOccupancyCache(session.organizationId)
    return updated
  }

  const endedSession = await store.endSession(sessionId, {
    endReason: reason,
    endedByUserId: terminationRequest.requestedByUserId,
    endedByName: terminationRequest.requestedByName,
    endedByRole: terminationRequest.requestedByRole,
    forced: terminationRequest.forced,
    terminationRequest,
  })

  if (session.boxId) {
    publishEndSession(session.boxId, { sessionId, reason })
  }

  await logSessionEnded(
    {
      boxId: session.boxId,
      sessionId,
      reason,
    },
    endedSession
  )

  const updated = await store.updateSession(sessionId, {
    endLogWrittenAt: new Date(),
  })
  clearOccupancyCache(session.organizationId)
  return updated
}

module.exports = {
  handleAuthRequest,
  handleSessionStarted,
  handleSessionEnded,
  handleSessionsState,
  forceEndSession,
  getSessionsForProfile,
  getSessionByIdForProfile,
  startSessionById,
  endSessionById,
  forceEndSessionByDeviceId,
  createPendingSession,
  deriveReservationStatus,
  reconcileSessionState,
  getSessionWindow,
}

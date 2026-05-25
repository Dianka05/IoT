const { v4: uuidv4 } = require('uuid')
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
const { getDeviceById } = require('../devices/fan-1/devices.store.firestore')

function normalizeEntityStatus(entity = {}) {
  if (entity?.active === false) {
    return 'disabled'
  }

  return String(entity?.status || '').trim().toLowerCase()
}

async function handleAuthRequest(msg) {
  const { uid, boxId } = msg.payload
  const box = await getBoxById(boxId)
  const cardAccess = box?.organizationId
    ? await findUserCardAccessForOrganization(uid, box.organizationId)
    : null

  if (!cardAccess) {
    await logAuthDenied({ uid, boxId }, 'uid_not_recognized')

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
      },
      'user_inactive'
    )

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'user_inactive',
    })
  }

  const session = await store.findPendingSessionForAuth(uid, boxId)
  if (!session) {
    await logAuthDenied(
      {
        uid,
        boxId,
        userId: user.userId,
        userName: user.name,
      },
      'no_pending_session'
    )

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'no pending session',
    })
  }

  await logAuthGranted(session)

  return publishAuthResult(boxId, {
    uid: session.uid,
    allowed: true,
    userId: session.userId,
    userName: session.userName,
    role: session.role,
    sessionId: session.sessionId,
    deviceIds: session.deviceIds,
    sessionDurationSec: session.sessionDurationSec,
    mode: session.mode,
    reason: null,
  })
}

async function handleSessionStarted(msg) {
  const { sessionId } = msg.payload
  if (!sessionId) return null

  const session = await store.markSessionStarted(sessionId)
  if (session) {
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

  if (existingSession?.endLogWrittenAt) {
    return session
  }

  await logSessionEnded(msg.payload, session)
  return store.updateSession(sessionId, {
    endLogWrittenAt: new Date(),
  })
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
  const sessions = await store.listSessionsByOrganization(
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
  const session = await store.getSession(sessionId)
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

  for (const deviceId of data.deviceIds) {
    const device = await getDeviceById(deviceId)

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
  }

  const session = {
    sessionId: uuidv4(),
    organizationId,
    boxId: data.boxId,
    uid: data.uid,
    userId: user.userId,
    userName: user.name,
    role: user.role || 'user',
    deviceIds: data.deviceIds,
    sessionDurationSec: data.sessionDurationSec || user.sessionDurationSec || 1800,
    mode: data.mode || 'manual',
    status: 'pending',
  }

  for (const deviceId of session.deviceIds) {
    if (await store.isDeviceBusy(deviceId, organizationId)) {
      throw new Error(`Device is busy: ${deviceId}`)
    }
  }

  return store.createSession(session)
}

async function startSessionById(sessionId) {
  return store.markSessionStarted(sessionId)
}

async function endSessionById(sessionId, reason = 'manual', actor = null) {
  const session = await store.getSession(sessionId)
  if (!session) return null

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

  return store.updateSession(sessionId, {
    endLogWrittenAt: new Date(),
  })
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
}

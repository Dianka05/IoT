const { v4: uuidv4 } = require('uuid')

const store = require('./sessions.store.firestore')
const {
  publishEndSession,
  publishAuthResult,
} = require('../boxes/main-box/boxes.service')


const {
  logAuthRequestReceived,
  logAuthDenied,
  logAuthGranted,
  logSessionStarted,
  logSessionEnded,
} = require('../logs/logs.service')

const { findActiveUserByUid } = require('../users/users.service')

async function handleAuthRequest(msg) {
  const { uid, boxId } = msg.payload

  const user = await findActiveUserByUid(uid)
  if (!user) {
    await logAuthDenied({ uid, boxId }, 'UID not recognized or user inactive')

    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'UID not recognized or user inactive',
    })
  }

  const session = await store.findPendingSessionForAuth(uid, boxId)
  if (!session) {
    await logAuthDenied({ uid, boxId }, 'no_pending_session')

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
  console.log('Session started: ', msg.payload)

  const { sessionId } = msg.payload
  if (!sessionId) return null

 const session = await store.markSessionStarted(sessionId)
  if (session) {
    await logSessionStarted({
      boxId: session.boxId,
      sessionId: session.sessionId,
    })
  }
  return session

}

async function handleSessionEnded(msg) {
  console.log('Session ended: ', msg.payload)

  const { sessionId } = msg.payload
  if (!sessionId) return null

  const session = await store.endSession(sessionId)
  await logSessionEnded(msg.payload, session)
  return session

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

async function getSessions(limit = 50, status = null) {
  return store.listSessions(limit, status)
}

async function getSessionById(sessionId) {
  return store.getSession(sessionId)
}

async function createPendingSession(data = {}) {
  if (!data.boxId) throw new Error('boxId is required')
  if (!data.uid) throw new Error('uid is required')
  


  if (!Array.isArray(data.deviceIds) || data.deviceIds.length === 0) {
    throw new Error('deviceIds is required')
  }

  const user = await findActiveUserByUid(data.uid)
  if (!user) {
    throw new Error('Active user not found for uid')
  }


  const session = {
    sessionId: uuidv4(),
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
    if (await store.isDeviceBusy(deviceId)) {
      throw new Error(`Device is busy: ${deviceId}`)
    }
  }

  return store.createSession(session)
}

async function startSessionById(sessionId) {
  return store.markSessionStarted(sessionId)
}

async function endSessionById(sessionId) {
  return store.endSession(sessionId)
}

module.exports = {
  handleAuthRequest,
  handleSessionStarted,
  handleSessionEnded,
  handleSessionsState,
  forceEndSession,
  getSessions,
  getSessionById,
  startSessionById,
  endSessionById,
  createPendingSession,
}

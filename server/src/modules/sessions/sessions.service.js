const { v4: uuidv4 } = require('uuid')

const store = require('./sessions.store.firestore')
const deviceProvider = require('../../providers/device.provider')
const { publishEndSession, publishAuthResult } = require('../boxes/main-box/boxes.service')
const { findActiveUserByUid } = require('../users/users.service')

async function handleAuthRequest(msg) {
  const { uid, boxId } = msg.payload

  console.log('Auth request received: ' + JSON.stringify(msg.payload))

  const user = await findActiveUserByUid(uid)

  if (!user) {
    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'UID not recognized or user inactive',
    })
  }

  const targetDeviceIds =
    Array.isArray(user.allowedDeviceIds) && user.allowedDeviceIds.length > 0
      ? user.allowedDeviceIds
      : ['fan-1']

  for (const deviceId of targetDeviceIds) {
    if (await store.isDeviceBusy(deviceId)) {
      return publishAuthResult(boxId, {
        uid,
        allowed: false,
        reason: 'device_busy',
      })
    }
  }

  const session = {
    sessionId: uuidv4(),
    boxId,
    uid,
    userId: user.userId,
    userName: user.name,
    role: user.role,
    deviceIds: targetDeviceIds,
    sessionDurationSec: user.sessionDurationSec || 3600,
    mode: 'normal',
    status: 'pending',
  }

  await store.createSession(session)

  publishAuthResult(boxId, {
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

  for (const deviceId of session.deviceIds) {
    await deviceProvider.publishFanSet(deviceId, true, session.sessionId)
  }
}

async function handleSessionStarted(msg) {
  console.log('Session started: ', msg.payload)

  const { sessionId } = msg.payload
  if (!sessionId) return null

  return store.markSessionStarted(sessionId)
}

async function handleSessionEnded(msg) {
  console.log('Session ended: ', msg.payload)

  const { sessionId } = msg.payload
  if (!sessionId) return null

  return store.endSession(sessionId)
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

async function createTestSession(data = {}) {
  const session = {
    sessionId: uuidv4(),
    boxId: data.boxId || 'main-1',
    uid: data.uid || 'TEST_UID_001',
    userId: data.userId || 'test-user-1',
    userName: data.userName || 'Test User',
    role: data.role || 'user',
    deviceIds: Array.isArray(data.deviceIds) && data.deviceIds.length > 0
      ? data.deviceIds
      : ['fan-1'],
    sessionDurationSec: data.sessionDurationSec || 1800,
    mode: data.mode || 'manual',
    status: 'pending',
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
  createTestSession,
  startSessionById,
  endSessionById,
}
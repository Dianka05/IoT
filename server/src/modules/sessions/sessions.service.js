const { v4: uuidv4 } = require('uuid')

const store = require('./sessions.store')
const deviceProvider = require('../../providers/device.provider')
const { publishEndSession, publishAuthResult } = require('../boxes/main-box/boxes.service')

async function handleAuthRequest(msg) {
  const { uid, boxId } = msg.payload

  console.log('Auth request received: ' + JSON.stringify(msg.payload))

  // auth simulation ...
  if (uid !== 'A27A7B38') {
    return publishAuthResult(boxId, {
      uid,
      allowed: false,
      reason: 'UID not recognized',
    })
  }

  const targetDeviceIds = ['fan-1']

  for (const deviceId of targetDeviceIds) {
    if (store.isDeviceBusy(deviceId)) {
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
    userId: 'user123',
    userName: 'Harry Potter',
    role: 'admin',
    deviceIds: targetDeviceIds,
    sessionDurationSec: 3600,
    mode: 'normal',
    status: 'pending',
  }

  store.createSession(session)

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

function handleSessionStarted(msg) {
  console.log('Session started: ' , msg.payload)
}

function handleSessionEnded(msg) {
  console.log('Session ended: ' , msg.payload)

  const { sessionId } = msg.payload
  if (!sessionId) return

  const session = store.endSession(sessionId)
  if (!session) return
}

function handleSessionsState(msg) {
  console.log('Sessions state: ', msg.payload)
}

function forceEndSession(boxId, sessionId, reason = 'manual') {
  const session = store.getSession(sessionId)
  if (!session) return null

  publishEndSession(boxId, { sessionId, reason })
  return session
}

module.exports = {
  handleAuthRequest,
  handleSessionStarted,
  handleSessionEnded,
  handleSessionsState,
  forceEndSession,
}

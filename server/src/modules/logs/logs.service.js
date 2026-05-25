const { writeLog } = require('./logs.store.firestore')
const { getBoxById } = require('../boxes/main-box/boxes.store.firestore')

function serializeError(err) {
  return {
    name: err && err.name ? err.name : 'Error',
    message: err && err.message ? err.message : String(err),
    stack: err && err.stack ? err.stack : null,
  }
}

async function resolveOrganizationId(payload = {}, session = null) {
  const boxId = payload.boxId || session?.boxId || null

  if (!boxId) {
    return session?.organizationId || null
  }

  const box = await getBoxById(boxId)
  return box?.organizationId || session?.organizationId || null
}

async function logAuthRequestReceived(payload) {
  return writeLog({
    type: 'auth_request',
    level: 'info',
    source: 'mqtt',
    boxId: payload.boxId || null,
    uid: payload.uid || null,
    organizationId: await resolveOrganizationId(payload),
    message: 'Auth request received',
    payload,
  })
}

async function logAuthDenied(payload, reason) {
  return writeLog({
    type: 'auth_denied',
    level: 'info',
    source: 'mqtt',
    boxId: payload.boxId || null,
    uid: payload.uid || null,
    organizationId: await resolveOrganizationId(payload),
    reason: reason || null,
    message: 'Access denied',
    payload,
  })
}

async function logAuthGranted(session) {
  return writeLog({
    type: 'auth_granted',
    level: 'info',
    source: 'mqtt',
    boxId: session.boxId || null,
    uid: session.uid || null,
    userId: session.userId || null,
    sessionId: session.sessionId || null,
    deviceIds: session.deviceIds || [],
    organizationId: await resolveOrganizationId(session, session),
    message: 'Access granted and session created',
    payload: session,
  })
}

async function logSessionStarted(payload, session = null) {
  return writeLog({
    type: 'session_started',
    level: 'info',
    source: 'mqtt',
    boxId: payload.boxId || session?.boxId || null,
    sessionId: payload.sessionId || session?.sessionId || null,
    organizationId: await resolveOrganizationId(payload, session),
    message: 'Session started event received',
    payload,
  })
}

async function logSessionEnded(payload, session) {
  return writeLog({
    type: 'session_ended',
    level: session ? 'info' : 'warning',
    source: 'mqtt',
    boxId: payload.boxId || (session ? session.boxId : null),
    uid: payload.uid || (session ? session.uid : null),
    sessionId: payload.sessionId || null,
    deviceIds: session ? session.deviceIds || [] : [],
    organizationId: await resolveOrganizationId(payload, session),
    message: session
      ? 'Session ended and was closed in store'
      : 'Session ended event received but session was not found in store',
    payload: {
      event: payload,
      session: session || null,
    },
  })
}

async function logMqttHandlerError(topic, messageBuffer, err) {
  return writeLog({
    type: 'mqtt_handler_error',
    level: 'error',
    source: 'mqtt',
    topic,
    message: 'MQTT handler failed',
    organizationId: null,
    payload: {
      rawMessage: messageBuffer ? messageBuffer.toString() : null,
      error: serializeError(err),
    },
  })
}

module.exports = {
  logAuthRequestReceived,
  logAuthDenied,
  logAuthGranted,
  logSessionStarted,
  logSessionEnded,
  logMqttHandlerError,
}

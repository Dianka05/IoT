const { writeLog } = require('./logs.store.firestore')
const {
  getBoxById,
  updateBoxById,
} = require('../boxes/main-box/boxes.store.firestore')

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
  const boxId = payload.boxId || null

  if (boxId) {
    await updateBoxById(boxId, {
      securityState: {
        lastDeniedAt: new Date(),
        lastDeniedUid: payload.uid || null,
        lastDeniedReason: reason || null,
        presenceStartedAt: null,
      },
    })
  }

  const normalizedReason = String(reason || '').trim().toLowerCase()
  const isBlockedCard = normalizedReason === 'blocked_card'
  const type = isBlockedCard ? 'blocked_card_attempt' : 'auth_denied'
  const message = isBlockedCard
    ? 'Blocked RFID card was used'
    : normalizedReason === 'card_status_lost'
      ? 'Lost RFID card was used'
      : normalizedReason === 'user_inactive'
        ? 'Access denied because user is inactive'
        : 'Access denied'

  return writeLog({
    type,
    level: isBlockedCard ? 'warning' : 'info',
    source: 'mqtt',
    boxId: payload.boxId || null,
    uid: payload.uid || null,
    userId: payload.userId || null,
    userName: payload.userName || null,
    organizationId: await resolveOrganizationId(payload),
    reason: reason || null,
    message,
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
    userName: session.userName || null,
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
  const eventReason =
    payload.reason ||
    session?.endReason ||
    session?.terminationRequest?.reason ||
    'automatic'
  const endedByName =
    session?.endedByName ||
    session?.terminationRequest?.requestedByName ||
    null
  const endedByRole =
    session?.endedByRole ||
    session?.terminationRequest?.requestedByRole ||
    null
  const forced =
    session?.forced === true ||
    session?.terminationRequest?.forced === true
  const type = forced
    ? 'session_force_ended'
    : eventReason === 'manual'
      ? 'session_ended_manual'
      : 'session_ended_auto'
  const message = session
    ? forced
      ? `Session forcibly ended by ${endedByName || 'operations'}${endedByRole ? ` (${endedByRole})` : ''}`
      : eventReason === 'manual'
        ? `Session ended manually${endedByName ? ` by ${endedByName}` : ''}`
        : `Session ended automatically${eventReason ? ` (${eventReason})` : ''}`
    : 'Session ended event received but session was not found in store'

  return writeLog({
    type,
    level: session ? 'info' : 'warning',
    source: 'mqtt',
    boxId: payload.boxId || (session ? session.boxId : null),
    uid: payload.uid || (session ? session.uid : null),
    sessionId: payload.sessionId || session?.sessionId || null,
    deviceIds: session ? session.deviceIds || [] : [],
    organizationId: await resolveOrganizationId(payload, session),
    userId: session?.userId || null,
    userName: session?.userName || null,
    reason: eventReason,
    message,
    payload: {
      event: payload,
      session: session || null,
      endReason: eventReason,
      forced,
      endedBy: endedByName
        ? {
            name: endedByName,
            role: endedByRole || null,
            userId:
              session?.endedByUserId ||
              session?.terminationRequest?.requestedByUserId ||
              null,
          }
        : null,
    },
  })
}

async function logSuspiciousPresence({
  organizationId,
  boxId,
  durationSec,
  distanceCm,
  motion,
  lastDeniedUid,
  lastDeniedReason,
  payload,
}) {
  const afterDenied = Boolean(lastDeniedUid || lastDeniedReason)

  return writeLog({
    type: afterDenied
      ? 'suspicious_presence_after_denied'
      : 'suspicious_presence',
    level: 'warning',
    source: 'rules',
    boxId: boxId || null,
    uid: lastDeniedUid || null,
    organizationId: organizationId || null,
    message: afterDenied
      ? `Suspicious presence detected after denied access near box ${boxId}`
      : `Suspicious presence detected near box ${boxId}`,
    payload: {
      boxId,
      durationSec,
      distanceCm,
      motion,
      lastDeniedUid: lastDeniedUid || null,
      lastDeniedReason: lastDeniedReason || null,
      statusPayload: payload || null,
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
  logSuspiciousPresence,
  logMqttHandlerError,
}

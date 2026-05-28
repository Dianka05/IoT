const { writeLog } = require('./logs.store.firestore')
const {
  getBoxById,
  updateBoxById,
} = require('../boxes/main-box/boxes.store.firestore')
const {
  getPresenceDetectionConfigForBox,
} = require('../configuration/configuration.service')

function toMillis(value) {
  if (!value) return null
  if (typeof value?.toMillis === 'function') {
    return value.toMillis()
  }
  if (value instanceof Date) {
    return value.getTime()
  }
  if (typeof value?._seconds === 'number') {
    return value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1000000)
  }
  if (typeof value === 'number') {
    return value
  }
  return null
}

function serializeError(err) {
  return {
    name: err && err.name ? err.name : 'Error',
    message: err && err.message ? err.message : String(err),
    stack: err && err.stack ? err.stack : null,
  }
}

async function resolveOrganizationId(payload = {}, session = null) {
  if (payload.organizationId) {
    return payload.organizationId
  }

  if (session?.organizationId) {
    return session.organizationId
  }

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

function describeDeniedAttempt(reason, repeatedAttempt = false) {
  const normalizedReason = String(reason || '').trim().toLowerCase()

  switch (normalizedReason) {
    case 'uid_not_recognized':
      return {
        type: repeatedAttempt
          ? 'repeated_unknown_card_denied'
          : 'unknown_card_denied',
        level: repeatedAttempt ? 'warning' : 'info',
        message: repeatedAttempt
          ? 'Repeated access attempts from an unknown RFID card'
          : 'Unknown RFID card attempted access',
        knownCard: false,
      }
    case 'blocked_card':
      return {
        type: repeatedAttempt
          ? 'repeated_blocked_card_attempt'
          : 'blocked_card_attempt',
        level: 'warning',
        message: repeatedAttempt
          ? 'Repeated access attempts from a blocked RFID card'
          : 'Blocked RFID card was used',
        knownCard: true,
      }
    case 'card_status_lost':
      return {
        type: repeatedAttempt
          ? 'repeated_lost_card_attempt'
          : 'lost_card_attempt',
        level: 'warning',
        message: repeatedAttempt
          ? 'Repeated access attempts from a lost RFID card'
          : 'Lost RFID card was used',
        knownCard: true,
      }
    case 'user_inactive':
      return {
        type: repeatedAttempt
          ? 'repeated_inactive_user_denied'
          : 'inactive_user_denied',
        level: repeatedAttempt ? 'warning' : 'info',
        message: repeatedAttempt
          ? 'Repeated access attempts from an inactive user card'
          : 'Access denied because the user is inactive',
        knownCard: true,
      }
    case 'no_pending_session':
      return {
        type: repeatedAttempt
          ? 'repeated_known_card_denied'
          : 'known_card_denied',
        level: repeatedAttempt ? 'warning' : 'info',
        message: repeatedAttempt
          ? 'Repeated denied access from a recognized RFID card without a valid reservation'
          : 'Recognized RFID card was denied because no valid reservation was found',
        knownCard: true,
      }
    default:
      return {
        type: repeatedAttempt
          ? 'repeated_auth_denied'
          : 'auth_denied',
        level: repeatedAttempt ? 'warning' : 'info',
        message: repeatedAttempt
          ? 'Repeated access attempts were denied'
          : 'Access denied',
        knownCard: null,
      }
  }
}

async function logAuthDenied(payload, reason) {
  const boxId = payload.boxId || null
  const normalizedUid = String(payload.uid || '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toUpperCase()
  const attemptKey = normalizedUid || '__unknown__'
  const now = new Date()
  let attemptCount = 1
  let repeatedAttempt = false
  let organizationId = null

  if (boxId) {
    const box = await getBoxById(boxId)
    const securityState = box?.securityState || {}
    organizationId = box?.organizationId || null
    const config = organizationId
      ? await getPresenceDetectionConfigForBox(organizationId, boxId)
      : null
    const lookbackMs = Number(config?.deniedAccessLookbackSec || 120) * 1000
    const nowMs = Date.now()
    const previousAttempts =
      securityState.deniedAttempts && typeof securityState.deniedAttempts === 'object'
        ? securityState.deniedAttempts
        : {}
    const nextAttempts = {}

    Object.entries(previousAttempts).forEach(([key, value]) => {
      const lastDeniedAtMs = toMillis(value?.lastDeniedAt)
      if (lastDeniedAtMs !== null && nowMs - lastDeniedAtMs <= lookbackMs) {
        nextAttempts[key] = value
      }
    })

    const currentAttempt = nextAttempts[attemptKey]
    const currentAttemptLastDeniedAtMs = toMillis(currentAttempt?.lastDeniedAt)
    const withinWindow =
      currentAttemptLastDeniedAtMs !== null &&
      nowMs - currentAttemptLastDeniedAtMs <= lookbackMs

    attemptCount = withinWindow ? Number(currentAttempt?.count || 0) + 1 : 1
    repeatedAttempt = attemptCount >= 2
    const attemptDescriptor = describeDeniedAttempt(reason, repeatedAttempt)

    nextAttempts[attemptKey] = {
      count: attemptCount,
      lastDeniedAt: now,
      lastDeniedReason: reason || null,
      knownCard:
        payload.knownCard !== undefined
          ? payload.knownCard === true
          : attemptDescriptor.knownCard,
      uid: normalizedUid || null,
      userId: payload.userId || null,
      userName: payload.userName || null,
    }

    await updateBoxById(boxId, {
      securityState: {
        ...securityState,
        lastDeniedAt: now,
        lastDeniedUid: payload.uid || null,
        lastDeniedReason: reason || null,
        presenceStartedAt: null,
        deniedAttempts: nextAttempts,
      },
    })
  }

  const descriptor = describeDeniedAttempt(reason, repeatedAttempt)

  return writeLog({
    type: descriptor.type,
    level: descriptor.level,
    source: 'mqtt',
    boxId: payload.boxId || null,
    uid: payload.uid || null,
    userId: payload.userId || null,
    userName: payload.userName || null,
    organizationId: organizationId || await resolveOrganizationId(payload),
    reason: reason || null,
    message: descriptor.message,
    payload,
    metadata: {
      knownCard:
        payload.knownCard !== undefined
          ? payload.knownCard === true
          : descriptor.knownCard,
      repeatedAttempt,
      attemptCount,
      denyScope: descriptor.knownCard === false ? 'unknown_card' : 'known_card',
    },
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

const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

const OCCUPANCY_SESSION_STATUSES = ['ready_for_auth', 'missed', 'active']

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  }
}

async function createSession(session) {
  const sessionId = session.sessionId
  const docRef = db.collection('sessions').doc(sessionId)
  const now = new Date()

  await docRef.set(
    {
      ...session,
      status: session.status || 'scheduled',
      startedAt: session.startedAt || null,
      endedAt: session.endedAt || null,
      scheduledStartAt: session.scheduledStartAt || null,
      scheduledEndAt: session.scheduledEndAt || null,
      authWindowEndsAt: session.authWindowEndsAt || null,
      expiredAt: session.expiredAt || null,
      expiredReason: session.expiredReason || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    id: sessionId,
    ...session,
    createdAt: now,
    updatedAt: now,
  }
}

async function getSession(sessionId) {
  const doc = await db.collection('sessions').doc(sessionId).get()
  if (!doc.exists) return null

  return mapDoc(doc)
}

async function listSessions(limit = 50, status = null) {
  let query = db.collection('sessions')

  if (status) {
    query = query.where('status', '==', status)
  }

  const snapshot = await query
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map(mapDoc)
}

async function listSessionsByOrganization(organizationId, limit = 50, status = null) {
  let query = db.collection('sessions').where('organizationId', '==', organizationId)

  if (status) {
    query = query.where('status', '==', status)
  }

  const snapshot = await query
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map(mapDoc)
}

async function markSessionStarted(sessionId, patch = {}) {
  const current = await getSession(sessionId)
  if (!current) return null

  const startedAt = patch.startedAt || current.startedAt || new Date()

  await db.collection('sessions').doc(sessionId).set(
    {
      ...patch,
      status: 'active',
      startedAt,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    ...current,
    ...patch,
    status: 'active',
    startedAt,
    updatedAt: new Date(),
  }
}

async function updateSession(sessionId, patch = {}) {
  const current = await getSession(sessionId)
  if (!current) return null

  await db.collection('sessions').doc(sessionId).set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    ...current,
    ...patch,
    updatedAt: new Date(),
  }
}

async function findPendingSessionForAuth(uid, boxId) {
  const snapshot = await db
    .collection('sessions')
    .where('uid', '==', uid)
    .where('boxId', '==', boxId)
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()

  if (snapshot.empty) return null

  const match = snapshot.docs
    .map(mapDoc)
    .find((session) => ['ready_for_auth', 'missed', 'pending'].includes(String(session.status || '').toLowerCase()))

  return match || null
}

async function endSession(sessionId, patch = {}) {
  const current = await getSession(sessionId)
  if (!current) return null

  const endedAt = new Date()

  await db.collection('sessions').doc(sessionId).set(
    {
      ...patch,
      status: 'ended',
      endedAt,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    ...current,
    ...patch,
    status: 'ended',
    endedAt,
    updatedAt: new Date(),
  }
}

async function isDeviceBusy(deviceId, organizationId = null) {
  let query = db
    .collection('sessions')
    .where('deviceIds', 'array-contains', deviceId)
    .limit(20)

  if (organizationId) {
    query = query.where('organizationId', '==', organizationId)
  }

  const snapshot = await query.get()

  return snapshot.docs.some((doc) => {
    const data = doc.data()
    return OCCUPANCY_SESSION_STATUSES.includes(data.status)
  })
}

async function findActiveSessionByDeviceId(deviceId, organizationId = null) {
  let query = db
    .collection('sessions')
    .where('deviceIds', 'array-contains', deviceId)
    .limit(20)

  if (organizationId) {
    query = query.where('organizationId', '==', organizationId)
  }

  const snapshot = await query.get()

  const match = snapshot.docs.find((doc) => {
    const data = doc.data()
    return OCCUPANCY_SESSION_STATUSES.includes(data.status)
  })

  if (!match) return null

  return mapDoc(match)
}

module.exports = {
  createSession,
  getSession,
  listSessions,
  listSessionsByOrganization,
  markSessionStarted,
  updateSession,
  endSession,
  isDeviceBusy,
  findPendingSessionForAuth,
  findActiveSessionByDeviceId,
}

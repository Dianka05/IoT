const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

const ACTIVE_SESSION_STATUSES = ['pending', 'active']

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  }
}

async function createSession(session) {
  const sessionId = session.sessionId
  const docRef = db.collection('sessions').doc(sessionId)

  await docRef.set(
    {
      ...session,
      status: session.status || 'pending',
      startedAt: session.startedAt || null,
      endedAt: session.endedAt || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return getSession(sessionId)
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

async function markSessionStarted(sessionId) {
  const current = await getSession(sessionId)
  if (!current) return null

  await db.collection('sessions').doc(sessionId).set(
    {
      status: 'active',
      startedAt: current.startedAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return getSession(sessionId)
}

async function endSession(sessionId) {
  const current = await getSession(sessionId)
  if (!current) return null

  await db.collection('sessions').doc(sessionId).set(
    {
      status: 'ended',
      endedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return getSession(sessionId)
}

async function isDeviceBusy(deviceId) {
  const snapshot = await db
    .collection('sessions')
    .where('deviceIds', 'array-contains', deviceId)
    .limit(20)
    .get()

  return snapshot.docs.some((doc) => {
    const data = doc.data()
    return ACTIVE_SESSION_STATUSES.includes(data.status)
  })
}

module.exports = {
  createSession,
  getSession,
  listSessions,
  markSessionStarted,
  endSession,
  isDeviceBusy,
}
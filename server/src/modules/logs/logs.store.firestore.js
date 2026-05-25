const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

async function writeLog(entry) {
  const docRef = await db.collection('logs').add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  })

  return {
    id: docRef.id,
  }
}

async function getRecentLogs(limit = 20) {
  const snapshot = await db
    .collection('logs')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

async function getRecentLogsByOrganization(organizationId, limit = 20) {
  const snapshot = await db
    .collection('logs')
    .where('organizationId', '==', organizationId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

module.exports = {
  writeLog,
  getRecentLogs,
  getRecentLogsByOrganization,
}

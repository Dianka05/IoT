const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  }
}

function normalizeUid(uid) {
  return String(uid || '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toUpperCase()
}

async function upsertUser(user) {
  const userId = user.userId
  const docRef = db.collection('users').doc(userId)
  const existing = await docRef.get()

  await docRef.set(
    {
      ...user,
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    id: userId,
  }
}

async function getUserByActiveCardUid(uid) {
  const normalizedUid = normalizeUid(uid)
  const snapshot = await db.collection('users').limit(100).get()

  const item = snapshot.docs
    .map(mapDoc)
    .find((user) =>
      Array.isArray(user.cards) &&
      user.cards.some((card) => normalizeUid(card.uid) === normalizedUid && card.status === 'active')
    )

  return item || null
}

async function getUserByCardUid(uid) {
  const normalizedUid = normalizeUid(uid)
  const snapshot = await db.collection('users').limit(200).get()

  const item = snapshot.docs
    .map(mapDoc)
    .find((user) =>
      Array.isArray(user.cards) &&
      user.cards.some((card) => normalizeUid(card.uid) === normalizedUid)
    )

  return item || null
}

async function getUserByAuthUid(authUid) {
  const snapshot = await db
    .collection('users')
    .where('authUid', '==', authUid)
    .limit(1)
    .get()

  if (snapshot.empty) return null

  return mapDoc(snapshot.docs[0])
}

async function listUsers(limit = 50) {
  const snapshot = await db.collection('users').limit(limit).get()
  return snapshot.docs.map(mapDoc)
}

async function listUsersByOrganization(organizationId, limit = 50) {
  const snapshot = await db
    .collection('users')
    .where('organizationIds', 'array-contains', organizationId)
    .limit(limit)
    .get()

  return snapshot.docs.map(mapDoc)
}

async function getUserById(userId) {
  const doc = await db.collection('users').doc(userId).get()

  if (!doc.exists) return null

  return mapDoc(doc)
}

async function updateUserById(userId, patch) {
  const docRef = db.collection('users').doc(userId)
  const existing = await docRef.get()

  if (!existing.exists) return null

  await docRef.set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  const updated = await docRef.get()
  return mapDoc(updated)
}

async function deleteUserById(userId) {
  const docRef = db.collection('users').doc(userId)
  const existing = await docRef.get()

  if (!existing.exists) return false

  await docRef.delete()
  return true
}

module.exports = {
  upsertUser,
  listUsers,
  listUsersByOrganization,
  getUserByCardUid,
  getUserByActiveCardUid,
  getUserByAuthUid,
  getUserById,
  updateUserById,
  deleteUserById,
}

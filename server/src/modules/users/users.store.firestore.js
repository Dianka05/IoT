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

function deriveCardUids(cards = []) {
  if (!Array.isArray(cards)) {
    return []
  }

  return [...new Set(cards.map((card) => normalizeUid(card?.uid)).filter(Boolean))]
}

async function upsertUser(user) {
  const userId = user.userId
  const docRef = db.collection('users').doc(userId)
  const existing = await docRef.get()
  const nextCardUids = user.cards !== undefined ? deriveCardUids(user.cards) : undefined

  await docRef.set(
    {
      ...user,
      ...(nextCardUids !== undefined ? { cardUids: nextCardUids } : {}),
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
  const indexedSnapshot = await db
    .collection('users')
    .where('cardUids', 'array-contains', normalizedUid)
    .limit(20)
    .get()

  const indexedItem = indexedSnapshot.docs
    .map(mapDoc)
    .find((user) =>
      Array.isArray(user.cards) &&
      user.cards.some((card) => normalizeUid(card.uid) === normalizedUid && card.status === 'active')
    )

  if (indexedItem) {
    return indexedItem
  }

  const fallbackSnapshot = await db.collection('users').limit(100).get()

  const fallbackItem = fallbackSnapshot.docs
    .map(mapDoc)
    .find((user) =>
      Array.isArray(user.cards) &&
      user.cards.some((card) => normalizeUid(card.uid) === normalizedUid && card.status === 'active')
    )

  if (fallbackItem && !Array.isArray(fallbackItem.cardUids)) {
    await db.collection('users').doc(fallbackItem.userId || fallbackItem.id).set(
      {
        cardUids: deriveCardUids(fallbackItem.cards),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  }

  return fallbackItem || null
}

async function getUserByCardUid(uid) {
  const normalizedUid = normalizeUid(uid)
  const indexedSnapshot = await db
    .collection('users')
    .where('cardUids', 'array-contains', normalizedUid)
    .limit(20)
    .get()

  const indexedItem = indexedSnapshot.docs
    .map(mapDoc)
    .find((user) =>
      Array.isArray(user.cards) &&
      user.cards.some((card) => normalizeUid(card.uid) === normalizedUid)
    )

  if (indexedItem) {
    return indexedItem
  }

  const fallbackSnapshot = await db.collection('users').limit(200).get()

  const fallbackItem = fallbackSnapshot.docs
    .map(mapDoc)
    .find((user) =>
      Array.isArray(user.cards) &&
      user.cards.some((card) => normalizeUid(card.uid) === normalizedUid)
    )

  if (fallbackItem && !Array.isArray(fallbackItem.cardUids)) {
    await db.collection('users').doc(fallbackItem.userId || fallbackItem.id).set(
      {
        cardUids: deriveCardUids(fallbackItem.cards),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  }

  return fallbackItem || null
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

  const current = mapDoc(existing)
  const nextCardUids = patch.cards !== undefined ? deriveCardUids(patch.cards) : undefined

  await docRef.set(
    {
      ...patch,
      ...(nextCardUids !== undefined ? { cardUids: nextCardUids } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    ...current,
    ...patch,
    ...(nextCardUids !== undefined ? { cardUids: nextCardUids } : {}),
    updatedAt: new Date(),
  }
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

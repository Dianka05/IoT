const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

const COLLECTION_NAME = 'customerIdentifierNumbers'

function normalizeIdentifierNumber(identifierNumber) {
  return String(identifierNumber || '').trim().toUpperCase()
}

function isValidIdentifierNumber(identifierNumber) {
  return /^ID-\d{12}$/.test(normalizeIdentifierNumber(identifierNumber))
}

async function getCustomerIdentifierNumber(identifierNumber) {
  const normalized = normalizeIdentifierNumber(identifierNumber)

  if (!isValidIdentifierNumber(normalized)) {
    return null
  }

  const doc = await db.collection(COLLECTION_NAME).doc(normalized).get()

  if (!doc.exists) return null

  return {
    id: doc.id,
    ...doc.data(),
  }
}

async function isCustomerIdentifierNumberAvailable(identifierNumber) {
  const item = await getCustomerIdentifierNumber(identifierNumber)

  if (!item) return false

  return item.used !== true
}

async function claimCustomerIdentifierNumber(identifierNumber, authUid) {
  const normalized = normalizeIdentifierNumber(identifierNumber)

  if (!isValidIdentifierNumber(normalized)) {
    throw new Error('INVALID_IDENTIFIER_NUMBER_FORMAT')
  }

  const docRef = db.collection(COLLECTION_NAME).doc(normalized)

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef)

    if (!doc.exists) {
      throw new Error('IDENTIFIER_NUMBER_NOT_FOUND')
    }

    const data = doc.data()

    if (data.used === true) {
      throw new Error('IDENTIFIER_NUMBER_ALREADY_USED')
    }

    transaction.set(
      docRef,
      {
        identifierNumber: normalized,
        used: true,
        usedByAuthUid: authUid,
        usedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    )
  })

  return getCustomerIdentifierNumber(normalized)
}

module.exports = {
  normalizeIdentifierNumber,
  isValidIdentifierNumber,
  getCustomerIdentifierNumber,
  isCustomerIdentifierNumberAvailable,
  claimCustomerIdentifierNumber,
}
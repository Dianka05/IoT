const {
  normalizeIdentifierNumber,
  isValidIdentifierNumber,
  getCustomerIdentifierNumber,
  isCustomerIdentifierNumberAvailable,
  claimCustomerIdentifierNumber,
} = require('./customerIdentifierNumbers.store.firestore')

async function checkIdentifierNumber(identifierNumber) {
  const normalized = normalizeIdentifierNumber(identifierNumber)

  if (!isValidIdentifierNumber(normalized)) {
    return {
      identifierNumber: normalized,
      exists: false,
      available: false,
      reason: 'INVALID_FORMAT',
    }
  }

  const item = await getCustomerIdentifierNumber(normalized)

  if (!item) {
    return {
      identifierNumber: normalized,
      exists: false,
      available: false,
      reason: 'NOT_FOUND',
    }
  }

  if (item.used === true) {
    return {
      identifierNumber: normalized,
      exists: true,
      available: false,
      reason: 'ALREADY_USED',
    }
  }

  return {
    identifierNumber: normalized,
    exists: true,
    available: true,
    reason: null,
  }
}

async function claimIdentifierNumber(identifierNumber, authUid) {
  return claimCustomerIdentifierNumber(identifierNumber, authUid)
}

module.exports = {
  checkIdentifierNumber,
  claimIdentifierNumber,
}
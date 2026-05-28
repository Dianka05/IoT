const { auth } = require('../../integrations/firebase/firebase.client')
const { claimIdentifierNumber } = require('../customerIdentifierNumbers/customerIdentifierNumbers.service')
const {
  signUpWithEmailPassword,
  signInWithEmailPassword,
} = require('./auth.firebase.rest')
const {
  ensureAuthUserProfile,
  clearMustChangePassword,
  findUserByAuthUid,
} = require('../users/users.service')

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'session'
const COOKIE_MAX_AGE_MS = Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 432000000)

async function registerUser({ email, password, name, customerIdentifierNumber }) {
  let createdAuthUid = null

  try {
    const result = await signUpWithEmailPassword(email, password)
    const decoded = await auth.verifyIdToken(result.idToken)

    createdAuthUid = decoded.uid

    await claimIdentifierNumber(customerIdentifierNumber, decoded.uid)

    const profile = await ensureAuthUserProfile({
      authUid: decoded.uid,
      email: decoded.email || email,
      name,
      customerIdentifierNumber,
    })

    return {
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      profile,
    }
  } catch (err) {
    if (createdAuthUid) {
      try {
        await auth.deleteUser(createdAuthUid)
      } catch (deleteErr) {
        console.error('Failed to rollback Firebase Auth user:', deleteErr)
      }
    }

    throw err
  }
}

async function loginUser({ email, password }) {
  const result = await signInWithEmailPassword(email, password)
  const decoded = await auth.verifyIdToken(result.idToken)

  const profile = await ensureAuthUserProfile({
    authUid: decoded.uid,
    email: decoded.email || email,
    name: null,
  })

  return {
    idToken: result.idToken,
    refreshToken: result.refreshToken,
    expiresIn: result.expiresIn,
    profile,
  }
}

async function createSessionCookie(idToken) {
  return auth.createSessionCookie(idToken, {
    expiresIn: COOKIE_MAX_AGE_MS,
  })
}

async function getMeFromAuthUid(authUid) {
  return findUserByAuthUid(authUid)
}

async function changePasswordForAuthUser(authUid, password) {
  await auth.updateUser(authUid, {
    password,
  })

  return clearMustChangePassword(authUid)
}

module.exports = {
  COOKIE_NAME,
  COOKIE_MAX_AGE_MS,
  registerUser,
  loginUser,
  createSessionCookie,
  getMeFromAuthUid,
  changePasswordForAuthUser,
}

const path = require('path')
const { initializeApp, applicationDefault, cert, getApps } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')

function normalizeGoogleCredentialsPath() {
  const currentValue = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (!currentValue) {
    return null
  }

  if (currentValue.trim().startsWith('{')) {
    return null
  }

  if (!path.isAbsolute(currentValue)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
      __dirname,
      '../../../',
      currentValue,
    )
  }

  return process.env.GOOGLE_APPLICATION_CREDENTIALS
}

function parseInlineServiceAccount() {
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    ''

  if (!raw || !String(raw).trim().startsWith('{')) {
    return null
  }

  const parsed = JSON.parse(raw)
  if (parsed.private_key) {
    parsed.private_key = String(parsed.private_key).replace(/\\n/g, '\n')
  }

  return parsed
}

function createFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const inlineServiceAccount = parseInlineServiceAccount()
  if (inlineServiceAccount) {
    return initializeApp({
      credential: cert(inlineServiceAccount),
    })
  }

  normalizeGoogleCredentialsPath()

  return initializeApp({
    credential: applicationDefault(),
  })
}

const firebaseApp = createFirebaseApp()
const db = getFirestore(firebaseApp)
const auth = getAuth(firebaseApp)

module.exports = {
  firebaseApp,
  db,
  auth,
  FieldValue,
}

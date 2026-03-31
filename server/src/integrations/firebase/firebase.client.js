const path = require('path')
const { initializeApp, applicationDefault, getApps } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

function normalizeGoogleCredentialsPath() {
  const currentValue = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (!currentValue) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS is not set in environment variables'
    )
  }

  if (!path.isAbsolute(currentValue)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
      __dirname,
      '../../../',
      currentValue,
    )
  }
}

function createFirebaseApp() {
  normalizeGoogleCredentialsPath()

  if (getApps().length > 0) {
    return getApps()[0]
  }

  return initializeApp({
    credential: applicationDefault(),
  })
}

const firebaseApp = createFirebaseApp()
const db = getFirestore(firebaseApp)

module.exports = {
  firebaseApp,
  db,
  FieldValue,
}
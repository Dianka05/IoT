const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  }
}

async function getConfigurationByOrganizationId(organizationId) {
  const doc = await db.collection('configurations').doc(organizationId).get()
  if (!doc.exists) return null

  return mapDoc(doc)
}

async function upsertConfigurationByOrganizationId(organizationId, patch = {}) {
  const docRef = db.collection('configurations').doc(organizationId)
  const existing = await docRef.get()

  await docRef.set(
    {
      organizationId,
      ...patch,
      ...(existing.exists
        ? {}
        : {
            createdAt: FieldValue.serverTimestamp(),
          }),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return getConfigurationByOrganizationId(organizationId)
}

module.exports = {
  getConfigurationByOrganizationId,
  upsertConfigurationByOrganizationId,
}

const { db, FieldValue } = require('../../integrations/firebase/firebase.client')

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  }
}

async function createOrganization(organization) {
  const organizationId = organization.organizationId
  const docRef = db.collection('organizations').doc(organizationId)
  const existing = await docRef.get()

  if (existing.exists) {
    throw new Error('ORGANIZATION_ALREADY_EXISTS')
  }

  await docRef.set({
    ...organization,
    active: organization.active ?? true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return getOrganizationById(organizationId)
}

async function getOrganizationById(organizationId) {
  const doc = await db.collection('organizations').doc(organizationId).get()
  if (!doc.exists) return null

  return mapDoc(doc)
}

async function listOrganizations(limit = 50) {
  const snapshot = await db.collection('organizations').limit(limit).get()
  return snapshot.docs.map(mapDoc)
}

async function listOrganizationsByIds(organizationIds = []) {
  const ids = [...new Set(organizationIds.filter(Boolean))]
  const items = await Promise.all(
    ids.map((organizationId) => getOrganizationById(organizationId))
  )

  return items.filter(Boolean)
}

module.exports = {
  createOrganization,
  getOrganizationById,
  listOrganizations,
  listOrganizationsByIds,
}

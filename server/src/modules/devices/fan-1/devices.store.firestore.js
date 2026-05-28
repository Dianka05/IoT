const { db, FieldValue } = require("../../../integrations/firebase/firebase.client")

function mapDoc(doc) {
  return {
    id: doc.id,
    ...doc.data(),
  }
}

async function createDevice(device) {
  const deviceId = device.deviceId
  const docRef = db.collection('devices').doc(deviceId)
  const existing = await docRef.get()

  if (existing.exists) {
    throw new Error('DEVICE_ALREADY_EXISTS')
  }

  await docRef.set({
    ...device,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return {
    id: deviceId,
    ...device,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

async function getDeviceById(deviceId) {
  const doc = await db.collection('devices').doc(deviceId).get()
  if (!doc.exists) return null

  return mapDoc(doc)
}

async function getDevicesByIds(deviceIds = []) {
  const normalizedIds = [...new Set(deviceIds.filter(Boolean))]
  if (normalizedIds.length === 0) {
    return []
  }

  const refs = normalizedIds.map((deviceId) => db.collection('devices').doc(deviceId))
  const docs = await db.getAll(...refs)

  return docs.filter((doc) => doc.exists).map(mapDoc)
}

async function listDevices(limit = 50) {
  const snapshot = await db.collection('devices').limit(limit).get()
  return snapshot.docs.map(mapDoc)
}

async function listDevicesByOrganization(organizationId, limit = 50) {
  const snapshot = await db
    .collection('devices')
    .where('organizationId', '==', organizationId)
    .limit(limit)
    .get()

  return snapshot.docs.map(mapDoc)
}

async function updateDeviceById(deviceId, patch) {
  const docRef = db.collection('devices').doc(deviceId)
  const existing = await docRef.get()

  if (!existing.exists) return null

  const current = mapDoc(existing)

  await docRef.set(
    {
      ...patch,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  return {
    ...current,
    ...patch,
    updatedAt: new Date(),
  }
}

async function deleteDeviceById(deviceId) {
  const docRef = db.collection('devices').doc(deviceId)
  const existing = await docRef.get()

  if (!existing.exists) return false

  await docRef.delete()
  return true
}

module.exports = {
  createDevice,
  getDeviceById,
  getDevicesByIds,
  listDevices,
  listDevicesByOrganization,
  updateDeviceById,
  deleteDeviceById,
}

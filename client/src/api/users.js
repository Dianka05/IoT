import { request, unwrapData } from './request'

export async function getUsers(limit = 100) {
  const payload = await request(`/users?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function getDevices(limit = 100) {
  const payload = await request(`/devices?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function deleteUser(uid) {
  return request(`/users/${uid}`, {
    method: 'DELETE',
  })
}

export async function createUser(body) {
  const payload = await request('/users', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = unwrapData(payload)

  return data?.item || payload?.item || null
}

export async function updateUser(uid, body) {
  const payload = await request(`/users/${uid}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  const data = unwrapData(payload)

  return data?.item || payload?.item || null
}

export async function updateUserAllowedDeviceIds(uid, allowedDeviceIds) {
  const payload = await request(`/users/${uid}/allowedDeviceIds`, {
    method: 'PATCH',
    body: JSON.stringify({ allowedDeviceIds }),
  })
  const data = unwrapData(payload)

  return data?.item || payload?.item || null
}

export async function updateUserCards(uid, cards) {
  const payload = await request(`/users/${uid}/cards`, {
    method: 'PATCH',
    body: JSON.stringify({ cards }),
  })
  const data = unwrapData(payload)

  return data?.item || payload?.item || null
}

export async function getRfidCards(limit = 300) {
  const payload = await request(`/rfid-cards?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function updateRfidCardStatus(cardUid, userId, status) {
  const payload = await request(`/rfid-cards/${cardUid}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ userId, status }),
  })
  const data = unwrapData(payload)

  return data?.item || payload?.item || null
}

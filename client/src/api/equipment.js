import { request, unwrapData } from './request'

export async function getCurrentUser() {
  const payload = await request('/auth/me')
  const data = unwrapData(payload)

  return data?.item || null
}

export async function getDevices(limit = 100) {
  const payload = await request(`/devices?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function createDevice(body) {
  const payload = await request('/devices', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = unwrapData(payload)

  return data?.item || data || null
}

export async function updateDevice(deviceId, body) {
  const payload = await request(`/devices/${deviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  const data = unwrapData(payload)

  return data?.item || data || null
}

export async function deleteDevice(deviceId) {
  const payload = await request(`/devices/${deviceId}`, {
    method: 'DELETE',
  })
  const data = unwrapData(payload)

  return data?.item || data || null
}

export async function getBoxes(limit = 100) {
  const payload = await request(`/boxes?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function createBox(body) {
  const payload = await request('/boxes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const data = unwrapData(payload)

  return data?.item || data || null
}

export async function updateBox(boxId, body) {
  const payload = await request(`/boxes/${boxId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
  const data = unwrapData(payload)

  return data?.item || data || null
}

export async function deleteBox(boxId) {
  const payload = await request(`/boxes/${boxId}`, {
    method: 'DELETE',
  })
  const data = unwrapData(payload)

  return data?.item || data || null
}

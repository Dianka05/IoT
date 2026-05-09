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

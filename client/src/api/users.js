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

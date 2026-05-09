import { request, unwrapData } from './request'
import { getUsers } from './users'
import { getDevices } from './equipment'

export async function getSessions(limit = 100, status) {
  const query = new URLSearchParams()
  query.set('limit', String(limit))

  if (status) {
    query.set('status', status)
  }

  const payload = await request(`/sessions?${query.toString()}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function endSession(sessionId, reason = 'manual') {
  const payload = await request(`/sessions/${sessionId}/end`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })

  const data = unwrapData(payload)
  return data?.item || data || null
}

export async function getLogs(limit = 20) {
  const payload = await request(`/logs?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function getBoxes(limit = 100) {
  const payload = await request(`/boxes?limit=${limit}`)
  const data = unwrapData(payload)

  return data?.items || []
}

export async function getAdminOverview() {
  const [users, devices, sessions, logs, boxes] = await Promise.all([
    getUsers(200),
    getDevices(200),
    getSessions(200),
    getLogs(20),
    getBoxes(200),
  ])

  return {
    users,
    devices,
    sessions,
    logs,
    boxes,
  }
}

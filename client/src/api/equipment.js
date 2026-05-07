const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return payload
}

function unwrapData(payload) {
  return payload?.data ?? payload
}

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
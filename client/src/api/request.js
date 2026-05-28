const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
export const API_URL = String(RAW_API_URL).replace(/\/+$/, '')

export async function request(path, options = {}) {
  const normalizedPath = String(path || '').startsWith('/')
    ? String(path)
    : `/${String(path || '')}`

  const response = await fetch(`${API_URL}${normalizedPath}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (response.status === 204) {
    return { success: true, data: null }
  }

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed with status ${response.status}`

    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export function unwrapData(payload) {
  return payload?.data ?? payload
}

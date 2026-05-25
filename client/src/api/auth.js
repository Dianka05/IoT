import { API_URL, request, unwrapData } from './request'

export const register = async (email, password, name = '') => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
    credentials: 'include',
  });
  const payload = await response.json().catch(() => ({
    success: false,
    error: { message: `Request failed with status ${response.status}` },
  }))

  if (response.ok) {
    return payload
  }

  return {
    success: false,
    ...payload,
    error: {
      ...(payload?.error || {}),
      message: payload?.error?.message || `Request failed with status ${response.status}`,
    },
  }
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const payload = await response.json().catch(() => ({
    success: false,
    error: { message: `Request failed with status ${response.status}` },
  }))

  if (response.ok) {
    return payload
  }

  return {
    success: false,
    ...payload,
    error: {
      ...(payload?.error || {}),
      message: payload?.error?.message || `Request failed with status ${response.status}`,
    },
  }
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  const payload = await response.json().catch(() => ({
    success: false,
    error: { message: `Request failed with status ${response.status}` },
  }))

  if (response.ok) {
    return payload
  }

  return {
    success: false,
    ...payload,
    error: {
      ...(payload?.error || {}),
      message: payload?.error?.message || `Request failed with status ${response.status}`,
    },
  }
};

export const changePassword = async (password) => {
  const payload = await request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  const data = unwrapData(payload)

  return data?.item || null
}

export const getMe = async () => {
  return request('/auth/me')
}

export const getCurrentUser = async () => {
  const payload = await request('/auth/me')
  const data = unwrapData(payload)

  return data?.item || null
}

export const getCurrentProfile = async () => {
  const current = await getCurrentUser()
  return current?.profile || null
}

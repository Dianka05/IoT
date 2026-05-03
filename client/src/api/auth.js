const API_URL = import.meta.env.VITE_API_URL || '';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson
    ? await response.json()
    : {
        success: false,
        error: {
          message: `Request failed with status ${response.status}`,
        },
      };

  if (response.ok) {
    return payload;
  }

  return {
    success: false,
    ...payload,
    error: {
      ...(payload?.error || {}),
      message: payload?.error?.message || `Request failed with status ${response.status}`,
    },
  };
};

export const register = async (email, password, name = '') => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
    credentials: 'include',
  });
  return parseResponse(response);
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
  return parseResponse(response);
};

export const logout = async () => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return parseResponse(response);
};

export const getMe = async () => {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  return parseResponse(response);
};

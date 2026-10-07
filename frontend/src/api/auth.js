const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function authRequest(path, options = {}) {
  const requestUrl = new URL(`${API_BASE_URL}/api/auth/${path}`, window.location.origin);
  const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(requestUrl.hostname);

  if (import.meta.env.PROD && (!window.isSecureContext || (requestUrl.protocol !== 'https:' && !isLocalDevelopment))) {
    throw new Error('Authentication requires HTTPS outside local development.');
  }

  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    const error = new Error(result?.message || 'The authentication request failed.');
    error.status = response.status;
    throw error;
  }

  return result?.data;
}

export function login(username, password) {
  return authRequest('login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function logout(accessToken) {
  return authRequest('logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
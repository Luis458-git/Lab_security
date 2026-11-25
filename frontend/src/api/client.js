/**
 * SecureVault — Cliente HTTP Seguro
 * Wrapper sobre Fetch API con inclusión forzada de credentials: 'include' (cookies HttpOnly)
 * y propagación granular de códigos de estado HTTP (401, 403, 429).
 */

const BASE_URL = '/api/v1';

async function request(endpoint, options = {}) {
  // Manejo de endpoints relativos al root como /health o a la API /api/v1/*
  const url = endpoint.startsWith('/health') ? endpoint : `${BASE_URL}${endpoint}`;

  const headers = {
    'Accept': 'application/json',
    ...options.headers
  };

  // Solo añadir Content-Type si hay body y no es FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    credentials: 'include', // Mandatorio para transportar cookie HttpOnly 'sv_session'
    headers
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error('No se pudo establecer conexión segura con el servidor. Verifica tu conexión de red.');
    error.status = 0;
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `Error del servidor (HTTP ${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.code = data?.code || (response.status === 429 ? 'TOO_MANY_REQUESTS' : response.status === 403 ? 'FORBIDDEN' : 'API_ERROR');
    error.issues = data?.issues || [];
    error.data = data;
    throw error;
  }

  return data;
}

export const client = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options })
};

export default client;

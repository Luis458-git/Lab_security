/**
 * Cliente HTTP para SecureVault
 * Implementa fetch con credentials: 'include' para transporte automático de cookies HttpOnly.
 */
const BASE_URL = '/api/v1';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/health') ? endpoint : `${BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Accept': 'application/json'
  };

  if (options.body && !(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    credentials: 'include', // Imprescindible para el envío de cookies HttpOnly seguras
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error('No se pudo conectar con el servidor seguro. Verifique su conexión de red.');
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
    const errorMessage = data?.error || data?.message || `Error en la solicitud (HTTP ${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.code = data?.code || 'API_ERROR';
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

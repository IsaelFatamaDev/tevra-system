const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const DEFAULT_TENANT = import.meta.env.VITE_DEFAULT_TENANT_ID || '';

function getTenantId() {
  try {
    const stored = sessionStorage.getItem('tevra_user');
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.tenantId) return user.tenantId;
    }
  } catch { /* ignore */ }
  return DEFAULT_TENANT;
}

async function request(endpoint, options = {}) {
  const token = sessionStorage.getItem('tevra_token');
  const tenantId = getTenantId();

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(tenantId && { 'x-tenant-id': tenantId }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.message || `Error ${res.status}`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  const body = await res.json();
  return body.data !== undefined ? body.data : body;
}

export const api = {
  get: (url) => request(url),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (url, data) => request(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  upload: (url, formData) => request(url, { method: 'POST', body: formData }),
};

export default api;

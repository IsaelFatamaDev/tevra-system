import api from '../../../core/services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
const DEFAULT_TENANT = import.meta.env.VITE_DEFAULT_TENANT_ID || '';

async function publicGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(DEFAULT_TENANT && { 'x-tenant-id': DEFAULT_TENANT }),
    },
  });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data !== undefined ? body.data : body;
}

const buildQs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

const reviewsService = {
  /** List reviews — admin passes status='all', public defaults to 'approved' */
  findAll: (params = {}) => api.get(`/reviews${buildQs(params)}`),

  findPublic: async (params = {}) => {
    const data = await publicGet(`/reviews${buildQs({ ...params, status: 'approved' })}`)
    return data?.items || data?.reviews || (Array.isArray(data) ? data : [])
  },

    findByProduct: async (productId) => {
    const data = await publicGet(`/reviews/product/${productId}`)
    return data?.reviews || data?.items || (Array.isArray(data) ? data : [])
  },

    findByAgent: async (agentId) => {
    const data = await publicGet(`/reviews/agent/${agentId}`)
    return data?.reviews || data?.items || (Array.isArray(data) ? data : [])
  },

    create: (data) => {
    const payload = {
      rating: data.rating,
      title: data.title || undefined,
      body: data.comment || data.body || undefined,
      productId: data.productId || undefined,
      agentId: data.agentId || undefined,
      orderId: data.orderId || undefined,
      type: data.type || undefined,
    };
    return api.post('/reviews', payload);
  },

    markHelpful: (id) => api.patch(`/reviews/${id}/helpful`),

    moderate: (id, action) => api.patch(`/reviews/${id}/moderate`, { action }),

    remove: (id) => api.delete(`/reviews/${id}`),
};

export default reviewsService;

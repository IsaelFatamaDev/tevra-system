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

  /** Public: get approved reviews for a product — normalizes to array */
  findByProduct: async (productId) => {
    const data = await publicGet(`/reviews/product/${productId}`)
    return data?.reviews || data?.items || (Array.isArray(data) ? data : [])
  },

  /** Public: get approved reviews for an agent — normalizes to array */
  findByAgent: async (agentId) => {
    const data = await publicGet(`/reviews/agent/${agentId}`)
    return data?.reviews || data?.items || (Array.isArray(data) ? data : [])
  },

  /**
   * Submit a review.
   * Maps `comment` → `body` so the backend entity field is satisfied.
   */
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

  /** Mark review as helpful (public action) */
  markHelpful: (id) => api.patch(`/reviews/${id}/helpful`),

  /** Approve or reject a review (admin only) */
  moderate: (id, action) => api.patch(`/reviews/${id}/moderate`, { action }),

  /** Delete a review (admin only) */
  remove: (id) => api.delete(`/reviews/${id}`),
};

export default reviewsService;

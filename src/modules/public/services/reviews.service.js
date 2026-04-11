import api from '../../../core/services/api';

const buildQs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const reviewsService = {
  findAll: (params = {}) => api.get(`/reviews${buildQs(params)}`),
  findOne: (id) => api.get(`/reviews/${id}`),
  remove: (id) => api.delete(`/reviews/${id}`),
  moderate: (id, action) => api.patch(`/reviews/${id}/moderate`, { action }),
};

export default reviewsService;

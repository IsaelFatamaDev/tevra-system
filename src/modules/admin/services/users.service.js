import api from '../../../core/services/api';

const buildQs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const usersService = {
  findAll: (params = {}) => api.get(`/users${buildQs(params)}`),
  findOne: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export default usersService;

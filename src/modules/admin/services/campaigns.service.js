import api from '../../../core/services/api';

export const campaignsService = {
  findAll: () => api.get('/campaigns'),
  getStats: () => api.get('/campaigns/stats'),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  estimate: (type, audienceType) => api.get('/campaigns/estimate', { params: { type, audienceType } }),
};

export default campaignsService;

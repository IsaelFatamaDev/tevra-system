import api from '../../../core/services/api';

const buildQs = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.set(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
};

export const agentsService = {
  findAll: (params = {}) => api.get(`/agents${buildQs(params)}`),
  getCities: () => api.get('/agents/cities'),
  findOne: (id) => api.get(`/agents/${id}`),
  findByCode: (code) => api.get(`/agents/profile/${code}`),
  update: (id, data) => api.put(`/agents/${id}`, data),
  updateStatus: (id, status) => api.patch(`/agents/${id}/status`, { status }),
  submitApplication: (data) => api.post('/agents/applications', data),
  findAllApplications: (status) => api.get('/agents/applications/all' + (status ? `?status=${status}` : '')),
  reviewApplication: (id, decision, notes) => api.patch(`/agents/applications/${id}/review`, { decision, notes }),
};

export default agentsService;

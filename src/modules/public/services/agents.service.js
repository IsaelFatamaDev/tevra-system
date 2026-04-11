import api from '../../../core/services/api';

export const agentsService = {
  findAll: () => api.get('/agents'),
  findOne: (id) => api.get(`/agents/${id}`),
  findByCode: (code) => api.get(`/agents/profile/${code}`),
  update: (id, data) => api.put(`/agents/${id}`, data),
  updateStatus: (id, status) => api.patch(`/agents/${id}/status`, { status }),
  submitApplication: (data) => api.post('/agents/applications', data),
  reviewApplication: (id, decision, notes) => api.patch(`/agents/applications/${id}/review`, { decision, notes }),
};

export default agentsService;

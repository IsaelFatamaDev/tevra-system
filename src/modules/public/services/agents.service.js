import api from '../../../core/services/api';

export const agentsService = {
  findAll: () => api.get('/agents'),
  findOne: (id) => api.get(`/agents/${id}`),
  update: (id, data) => api.put(`/agents/${id}`, data),
  updateStatus: (id, status) => api.patch(`/agents/${id}/status`, { status }),
  reviewApplication: (id, decision, notes) => api.patch(`/agents/applications/${id}/review`, { decision, notes }),
};

export default agentsService;

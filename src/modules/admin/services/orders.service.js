import api from '../../../core/services/api';

export const ordersService = {
  findAll: () => api.get('/orders'),
  findOne: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export default ordersService;

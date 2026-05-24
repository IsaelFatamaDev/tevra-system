import api from '../../../core/services/api';

export const invoicesService = {
  create: (data) => api.post('/invoices', data),
  findAll: () => api.get('/invoices'),
  findOne: (id) => api.get(`/invoices/${id}`),
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  delete: (id) => api.delete(`/invoices/${id}`),
};

export default invoicesService;

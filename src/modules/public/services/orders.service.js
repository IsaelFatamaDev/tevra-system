import api from '../../../core/services/api';

export const ordersService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  trackOrder: (orderNumber) => api.get(`/orders/track/${orderNumber}`),
};

export default ordersService;

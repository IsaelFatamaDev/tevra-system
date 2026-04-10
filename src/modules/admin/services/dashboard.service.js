import api from '../../../core/services/api';

export const dashboardService = {
  // --- Admin ---
  getAdminStats: () => api.get('/analytics/dashboard'),
  getTopAgents: (limit = 5) => api.get(`/analytics/top-agents?limit=${limit}`),
  getRevenueByMonth: () => api.get('/analytics/revenue-by-month'),
  getTopProducts: (limit = 5) => api.get(`/analytics/top-products?limit=${limit}`),
  getRecentOrders: (limit = 5) => api.get(`/orders?limit=${limit}`),
  getPendingAgents: () => api.get('/agents?status=pending'),
  getAllUsers: (role) => {
    const url = role ? `/users?role=${role}` : '/users';
    return api.get(url);
  },
  getAgentStats: () => api.get('/agents/stats'),
  getOrderStats: () => api.get('/orders/stats'),

  // --- Client ---
  getMyOrders: () => api.get('/orders/my'),
  getMyProfile: () => api.get('/users/me'),
  getMyAddresses: () => api.get('/users/me/addresses'),

  // --- Agent ---
  getAgentProfile: () => api.get('/agents/me'),
  getAgentOrders: () => api.get('/orders/agent'),
  getMyCommissions: () => api.get('/commissions/my'),
};

export default dashboardService;

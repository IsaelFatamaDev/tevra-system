import api from '../../../core/services/api';

export const dashboardService = {
  
  getAdminStats: () => api.get('/analytics/dashboard'),
  getTopAgents: (limit = 5) => api.get(`/analytics/top-agents?limit=${limit}`),
  getRevenueByMonth: (period) => api.get(`/analytics/revenue-by-month${period ? `?period=${period}` : ''}`),
  getTopProducts: (limit = 5) => api.get(`/analytics/top-products?limit=${limit}`),
  getRecentOrders: (limit = 5) => api.get(`/orders?limit=${limit}`),
  getPendingAgents: () => api.get('/agents?status=pending'),
  getAllUsers: (role) => {
    const url = role ? `/users?role=${role}` : '/users';
    return api.get(url);
  },
  getAgentStats: () => api.get('/agents/stats'),
  getOrderStats: () => api.get('/orders/stats'),
  
  getAllCommissions: (params = {}) => {
    const q = new URLSearchParams();
    if (params.agentId) q.set('agentId', params.agentId);
    if (params.status) q.set('status', params.status);
    return api.get(`/commissions${q.toString() ? `?${q}` : ''}`);
  },
  
  approveCommission: (id) => api.patch(`/commissions/${id}/approve`),
  markCommissionPaid: (id) => api.patch(`/commissions/${id}/paid`),

  
  getMyOrders: () => api.get('/orders/my'),
  getMyProfile: () => api.get('/users/me'),
  getMyAddresses: () => api.get('/users/me/addresses'),

  
  getAgentProfile: () => api.get('/agents/me'),
  getAgentOrders: () => api.get('/orders/agent'),
  getMyCommissions: () => api.get('/commissions/my'),
};

export default dashboardService;

import api from '../../../core/services/api';

export const inboxService = {
  getConversations: () => api.get('/whatsapp/conversations'),
  getMessages: (phone) => api.get(`/whatsapp/messages/${phone}`),
  sendMessage: (phone, text) => api.post('/whatsapp/messages/send', { phone, text }),
  markAsRead: (phone) => api.post(`/whatsapp/messages/${phone}/read`),
};

export default inboxService;

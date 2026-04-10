import api from '../../../core/services/api';

export const usersService = {
  // Get all users, optionally filtered by role
  findAll: (role) => {
    const url = role ? `/users?role=${role}` : '/users';
    return api.get(url);
  },

  // Get user profile by id
  findOne: (id) => {
    return api.get(`/users/${id}`);
  },

  // Approve or update an agent/user
  update: (id, data) => {
    return api.put(`/users/${id}`, data);
  }
};

export default usersService;

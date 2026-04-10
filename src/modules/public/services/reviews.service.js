import api from '../../../core/services/api';

export const reviewsService = {
  findAll: () => {
    return api.get(`/reviews`);
  },
  findOne: (id) => {
    return api.get(`/reviews/${id}`);
  }
};

export default reviewsService;

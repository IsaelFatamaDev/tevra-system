import api from '../../../core/services/api';

export const productsService = {
  findAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.brand) query.set('brand', params.brand);
    if (params.search) query.set('search', params.search);
    if (params.featured !== undefined) query.set('featured', String(params.featured));
    if (params.minPrice) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.includeInactive) query.set('includeInactive', 'true');
    const qs = query.toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`);
  },
  findOne: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  getBrands: () => api.get('/brands'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  toggleActive: (id) => api.patch(`/products/${id}/toggle-active`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  createBrand: (data) => api.post('/brands', data),
  updateBrand: (id, data) => api.put(`/brands/${id}`, data),
  deleteBrand: (id) => api.delete(`/brands/${id}`),
  uploadImage: (productId, base64Image) => api.post(`/products/${productId}/image`, { image: base64Image }),
  removeImage: (productId, index) => api.post(`/products/${productId}/image/remove`, { index }),
};

export default productsService;

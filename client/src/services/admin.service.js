import { api } from '../api/client';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (page = 1, limit = 15, search = '') => {
    const response = await api.get('/admin/users', {
      params: { page, limit, search }
    });
    return response.data;
  }
};

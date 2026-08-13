import { api } from '../api/client';

export const profileService = {
  updateProfile: async ({ ageGroup, theme, streakType }, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put('/profile', { ageGroup, theme, streakType }, { headers });
    return response.data;
  },

  updateAccount: async ({ name, email, picture }, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put('/profile/account', { name, email, picture }, { headers });
    return response.data;
  },

  exportData: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/profile/export', { headers });
    return response.data;
  },

  deleteAccount: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.delete('/profile', { headers });
    return response.data;
  }
};

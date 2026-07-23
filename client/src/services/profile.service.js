import { api } from '../api/client';

export const profileService = {
  updateProfile: async ({ ageGroup, theme }, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.put('/profile', { ageGroup, theme }, { headers });
    return response.data;
  }
};

import { api } from '../api/client';

export const authService = {
  loginWithGoogle: async ({ credential, isMock, email, name, picture }) => {
    const response = await api.post('/auth/google', {
      credential,
      isMock,
      email,
      name,
      picture
    });
    return response.data;
  },

  getCurrentUser: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.get('/auth/me', { headers });
    return response.data;
  },

  logout: async (refreshToken) => {
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }
};

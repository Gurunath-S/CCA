import { api } from '../api/client';

export const characterService = {
  getAll: async () => {
    const response = await api.get('/characters');
    return response.data;
  },

  createCustom: async ({ name, description, category }) => {
    const response = await api.post('/characters/custom', {
      name,
      description,
      category
    });
    return response.data;
  }
};

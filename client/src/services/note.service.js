import { api } from '../api/client';

export const noteService = {
  getByCharacter: async (characterId) => {
    const response = await api.get(`/notes/${characterId}`);
    return response.data;
  },

  upsert: async ({ noteId, characterId, content }) => {
    const response = await api.put('/notes', { noteId, characterId, content });
    return response.data;
  },

  delete: async (noteId) => {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  }
};

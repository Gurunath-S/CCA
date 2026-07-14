import { create } from 'zustand';
import { api } from './useAuthStore';

export const useCharacterStore = create((set, get) => ({
  characters: [],
  history: [],
  notes: [],
  selectedCharacterStats: null,
  isLoading: false,
  error: null,

  // Fetch all characters (predefined & custom, sorted by backend: submissions desc, name asc)
  fetchCharacters: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/characters');
      set({ characters: response.data.characters, isLoading: false });
    } catch (err) {
      console.error('fetchCharacters error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch characters', isLoading: false });
    }
  },

  // Create a new custom character attribute
  createCustomCharacter: async ({ name, description, category }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/characters/custom', {
        name,
        description,
        category
      });
      
      const newChar = response.data.character;
      
      // Update characters locally and re-sort
      const updatedChars = [...get().characters, newChar].sort((a, b) => {
        if (b.submissionCount !== a.submissionCount) {
          return b.submissionCount - a.submissionCount;
        }
        return a.name.localeCompare(b.name);
      });

      set({ characters: updatedChars, isLoading: false });
      return newChar;
    } catch (err) {
      console.error('createCustomCharacter error:', err);
      const errMsg = err.response?.data?.message || 'Failed to create custom character';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  // Submit assessment form
  submitAssessment: async (assessmentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/assessments', assessmentData);
      
      // Refresh characters to update submission counts and re-sort
      await get().fetchCharacters();
      
      set({ isLoading: false });
      return response.data.assessment;
    } catch (err) {
      console.error('submitAssessment error:', err);
      const errMsg = err.response?.data?.message || 'Failed to save assessment';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  // Fetch all assessment submissions (history)
  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/assessments/history');
      set({ history: response.data.history, isLoading: false });
    } catch (err) {
      console.error('fetchHistory error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch history', isLoading: false });
    }
  },

  // Fetch aggregate data for a character
  fetchAggregateStats: async (characterId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/assessments/aggregate/${characterId}`);
      set({ selectedCharacterStats: response.data, isLoading: false });
      return response.data;
    } catch (err) {
      console.error('fetchAggregateStats error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch aggregate stats', isLoading: false });
    }
  },

  // Fetch notes for a character
  fetchNotes: async (characterId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/notes/${characterId}`);
      set({ notes: response.data.notes, isLoading: false });
    } catch (err) {
      console.error('fetchNotes error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch notes', isLoading: false });
    }
  },

  // Upsert note (create or edit)
  upsertNote: async ({ noteId, characterId, content }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/notes', { noteId, characterId, content });
      
      // Refresh notes list for this character
      if (characterId) {
        await get().fetchNotes(characterId);
      }
      
      set({ isLoading: false });
      return response.data.note;
    } catch (err) {
      console.error('upsertNote error:', err);
      const errMsg = err.response?.data?.message || 'Failed to save note';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  // Delete note
  deleteNote: async (noteId, characterId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/notes/${noteId}`);
      
      // Refresh notes list for this character
      if (characterId) {
        await get().fetchNotes(characterId);
      }
      
      set({ isLoading: false });
    } catch (err) {
      console.error('deleteNote error:', err);
      const errMsg = err.response?.data?.message || 'Failed to delete note';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  }
}));

import { create } from 'zustand';
import { characterService } from '../services/character.service';
import { assessmentService } from '../services/assessment.service';
import { noteService } from '../services/note.service';

export const useCharacterStore = create((set, get) => ({
  characters: [],
  history: [],
  notes: [],
  selectedCharacterStats: null,
  
  // Granular loading states for fine-grained UI re-rendering performance
  isLoading: false,
  isCharactersLoading: false,
  isHistoryLoading: false,
  isNotesLoading: false,
  isStatsLoading: false,
  error: null,

  // Fetch all characters (predefined & custom, sorted by backend: submissions desc, name asc)
  fetchCharacters: async () => {
    set({ isCharactersLoading: true, isLoading: true, error: null });
    try {
      const data = await characterService.getAll();
      set({ characters: data.characters, isCharactersLoading: false, isLoading: false });
    } catch (err) {
      console.error('fetchCharacters error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch characters', isCharactersLoading: false, isLoading: false });
    }
  },

  // Create a new custom character attribute
  createCustomCharacter: async ({ name, description, category }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await characterService.createCustom({ name, description, category });
      const newChar = data.character;
      
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
      const data = await assessmentService.submit(assessmentData);
      await get().fetchCharacters();
      set({ isLoading: false });
      return data.assessment;
    } catch (err) {
      console.error('submitAssessment error:', err);
      const errMsg = err.response?.data?.message || 'Failed to save assessment';
      set({ error: errMsg, isLoading: false });
      throw new Error(errMsg);
    }
  },

  // Fetch all assessment submissions (history)
  fetchHistory: async () => {
    set({ isHistoryLoading: true, isLoading: true, error: null });
    try {
      const data = await assessmentService.getHistory();
      set({ history: data.history, isHistoryLoading: false, isLoading: false });
    } catch (err) {
      console.error('fetchHistory error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch history', isHistoryLoading: false, isLoading: false });
    }
  },

  // Fetch aggregate data for a character
  fetchAggregateStats: async (characterId) => {
    set({ isStatsLoading: true, error: null });
    try {
      const data = await assessmentService.getAggregateStats(characterId);
      set({ selectedCharacterStats: data, isStatsLoading: false });
      return data;
    } catch (err) {
      console.error('fetchAggregateStats error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch aggregate stats', isStatsLoading: false });
    }
  },

  // Fetch notes for a character
  fetchNotes: async (characterId) => {
    set({ isNotesLoading: true, error: null });
    try {
      const data = await noteService.getByCharacter(characterId);
      set({ notes: data.notes, isNotesLoading: false });
    } catch (err) {
      console.error('fetchNotes error:', err);
      set({ error: err.response?.data?.message || 'Failed to fetch notes', isNotesLoading: false });
    }
  },

  // Upsert note (create or edit)
  upsertNote: async ({ noteId, characterId, content }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await noteService.upsert({ noteId, characterId, content });
      
      if (characterId) {
        await get().fetchNotes(characterId);
      }
      
      set({ isLoading: false });
      return data.note;
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
      await noteService.delete(noteId);
      
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

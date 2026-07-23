import { api } from '../api/client';

export const assessmentService = {
  submit: async (assessmentData) => {
    const response = await api.post('/assessments', assessmentData);
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/assessments/history');
    return response.data;
  },

  getAggregateStats: async (characterId) => {
    const response = await api.get(`/assessments/aggregate/${characterId}`);
    return response.data;
  }
};

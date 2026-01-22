import { apiClient } from './apiClient';

export const questionsService = {
    getQuestions: async (params = {}) => {
        // params: { subjectId, year, page, limit }
        return apiClient.get('/questions', params);
    },

    getQuestionById: async (id) => {
        return apiClient.get(`/questions/${id}`);
    }
};

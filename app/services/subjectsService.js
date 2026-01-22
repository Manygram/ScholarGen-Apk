import { apiClient } from './apiClient';

export const subjectsService = {
    getSubjects: async () => {
        return apiClient.get('/subjects');
    }
};

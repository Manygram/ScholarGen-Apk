import { apiClient } from './apiClient';

export const quizService = {
    // Get past quizzes
    getQuizzes: async (params = {}) => {
        // params: { isCompleted, page, limit }
        return apiClient.get('/quiz', params);
    },

    // Start a new quiz
    startQuiz: async (subjects, mode, durationInMinutes, year = null) => {
        // subjects: array of { subjectId, year, numberOfQuestions }
        // mode: 'exam' | 'practice' | 'study'
        const payload = {
            subjects,
            mode,
            durationInMinutes
        };
        if (year) payload.year = year;

        return apiClient.post('/quiz/start', payload);
    },

    // Submit a quiz
    submitQuiz: async (quizId, answers, timeSpentPerSubject = {}) => {
        // answers: { questionId: selectedOption }
        return apiClient.post(`/quiz/${quizId}/submit`, { answers, timeSpentPerSubject });
    },

    // Answer single question (Study Mode)
    answerQuestion: async (quizId, questionId, selectedOption) => {
        return apiClient.post(`/quiz/${quizId}/answer`, { questionId, selectedOption });
    }
};

import { apiClient } from './apiClient';

export const partnersService = {
    requestDashboardAccess: async (email) => {
        return apiClient.post('/partners/request-access', { email });
    },

    verifyDashboardAccess: async (email, otp) => {
        return apiClient.post('/partners/dashboard', { email, otp });
    }
};

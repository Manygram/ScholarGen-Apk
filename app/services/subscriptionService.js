import { apiClient } from './apiClient';

export const subscriptionService = {
    // Get subscription price
    getSubscriptionPrice: async () => {
        return apiClient.get('/settings/subscription-price');
    },

    // Initialize Paystack transaction
    initializeTransaction: async (plan, deviceId, email) => {
        return apiClient.post('/subscriptions/initialize', { plan, deviceId });
    },

    // Verify Paystack transaction
    verifyTransaction: async (reference) => {
        return apiClient.get(`/subscriptions/verify/${reference}`);
    }
};

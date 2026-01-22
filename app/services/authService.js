import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./apiClient";

export const authService = {
  register: async (name, email, password, referralCode) => {
    return apiClient.post("/auth/register", { name, email, password, referralCode });
  },

  verify: async (email, otp) => {
    return apiClient.post("/auth/verify", { email, otp });
  },

  resendOTP: async (email) => {
    return apiClient.post("/auth/request-otp", { email, appType: "scholarx" });
  },

  login: async (email, password) => {
    return apiClient.post("/auth/login", { email, password });
  },

  refreshToken: async (refreshToken) => {
    return apiClient.post("/auth/refresh", { refreshToken });
  },

  forgotPassword: async (email) => {
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: async (email, otp, newPassword) => {
    return apiClient.post("/auth/reset-password", { email, otp, newPassword });
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiClient.post("/auth/change-password", { currentPassword, newPassword });
  },

  saveSession: async (userData) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      if (userData.token) {
        await AsyncStorage.setItem("userToken", userData.token);
      }
      if (userData.refreshToken) {
        await AsyncStorage.setItem("refreshToken", userData.refreshToken);
      }
      // Save email separately for auto-fill
      if (userData.email) {
        await AsyncStorage.setItem("savedEmail", userData.email);
      }
    } catch (e) {
      console.error("[authService] Error saving session:", e);
    }
  },

  getSession: async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  getSavedEmail: async () => {
    try {
      return await AsyncStorage.getItem("savedEmail");
    } catch (e) {
      return null;
    }
  },

  logout: async () => {
    try {
      // Keep savedEmail for next login, only remove session data
      await AsyncStorage.multiRemove(["user", "userToken", "refreshToken"]);
    } catch (e) {
      console.error("[authService] Error during logout:", e);
    }
  },
};

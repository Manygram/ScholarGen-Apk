import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../services/authService";
import { apiClient, setLogoutCallback } from "../services/apiClient";
import Constants from 'expo-constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deviceId, setDeviceId] = useState(null);

    useEffect(() => {
        // Register auto-logout
        setLogoutCallback(() => {
            console.log("[AuthContext] Auto-logout triggered");
            logout();
        });
        initAuth();
    }, []);

    const initAuth = async () => {
        try {
            // 1. Get or create Device ID
            let id = await AsyncStorage.getItem("device_id");
            if (!id) {
                id = generateDeviceId();
                await AsyncStorage.setItem("device_id", id);
            }
            setDeviceId(id);

            // 2. Load User Session
            const session = await authService.getSession();
            if (session && session.token) {
                // Set token for axios
                // (Assuming apiClient handles token injection via interceptors, but if not we might need to set it)
                // Check profile to get latest premium status
                await fetchProfile(id);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error("Auth init error:", e);
            setLoading(false);
        }
    };

    const generateDeviceId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const fetchProfile = async (currentDeviceId) => {
        try {
            // Pass device ID in header
            const response = await apiClient.get('/users/profile', {
                headers: { 'x-device-id': currentDeviceId }
            });

            const userData = response.data;
            setUser(userData);
            setIsPremium(userData.isPremium || false);
        } catch (error) {
            console.error("Fetch profile error:", error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await authService.login(email, password);
        const { data } = response;
        if (data) {
            const token = data.accessToken || data.token || data.user?.token;
            const sessionData = { ...(data.user || data), token, refreshToken: data.refreshToken };
            await authService.saveSession(sessionData);

            // Refresh profile to get premium status
            await fetchProfile(deviceId);
            return data;
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsPremium(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isPremium,
            loading,
            deviceId,
            login,
            logout,
            checkPremiumStatus: () => fetchProfile(deviceId)
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

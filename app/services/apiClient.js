import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.apiUrl || "https://api.scholargens.com/api";

/**
 * Common headers for all requests
 */
const getHeaders = async (isMultipart = false) => {
  const headers = {
    Accept: "application/json",
  };

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("[apiClient] No userToken found in storage");
    }
  } catch (error) {
    console.error("[apiClient] Error fetching token:", error);
  }

  return headers;
};

/**
 * Handle API responses globally
 */
let onLogout = null;

export const setLogoutCallback = (callback) => {
  onLogout = callback;
};

/**
 * Handle API responses globally
 */
const handleResponse = async (response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  console.log(`[apiClient] ${response.url} returned ${response.status}`);

  if (response.status === 401) {
    console.log("[apiClient] 401 Unauthorized - Triggering Logout");
    if (onLogout) onLogout();
    // We still reject to let the caller know it failed, but the app should redirect
    return Promise.reject({ status: 401, message: "Session expired", data });
  }

  if (!response.ok) {
    const error = data?.message || data?.error || data?.data?.message || response.statusText;
    console.log("[apiClient] Request failed:", { status: response.status, message: error });
    return Promise.reject({ status: response.status, message: error, data });
  }

  return { status: response.status, data };
};

export const apiClient = {
  get: async (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ""}`;
    const headers = await getHeaders();

    try {
      const response = await fetch(url, { method: "GET", headers });
      return handleResponse(response);
    } catch (error) {
      console.error(`[apiClient] GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint, body = {}) => {
    const headers = await getHeaders();

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`[apiClient] POST ${endpoint} failed:`, error);
      throw error;
    }
  },

  put: async (endpoint, body = {}) => {
    const headers = await getHeaders();

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`[apiClient] PUT ${endpoint} failed:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    const headers = await getHeaders();

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`[apiClient] DELETE ${endpoint} failed:`, error);
      throw error;
    }
  },

  upload: async (endpoint, formData) => {
    const headers = await getHeaders(true);

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`[apiClient] UPLOAD ${endpoint} failed:`, error);
      throw error;
    }
  },
};

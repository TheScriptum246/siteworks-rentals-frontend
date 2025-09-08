import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Token management
export const TOKEN_KEY = 'siteworks_token';
export const REFRESH_TOKEN_KEY = 'siteworks_refresh_token';

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token refresh and auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);
                if (refreshToken) {
                    const response = await refreshAuthToken(refreshToken);
                    const { token } = response.data;

                    // Update stored tokens
                    Cookies.set(TOKEN_KEY, token, { expires: 1 }); // 1 day

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                clearAuthTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

// Token utility functions
export const setAuthTokens = (token: string, refreshToken: string) => {
    Cookies.set(TOKEN_KEY, token, { expires: 1 }); // 1 day
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 }); // 7 days
};

export const getAuthToken = () => {
    return Cookies.get(TOKEN_KEY);
};

export const clearAuthTokens = () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
};

export const isTokenValid = (token: string): boolean => {
    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch {
        return false;
    }
};

// Auth API calls
export const refreshAuthToken = (refreshToken: string) => {
    return api.post('/auth/refreshtoken', {
        refreshToken: refreshToken
    });
};

export default api;
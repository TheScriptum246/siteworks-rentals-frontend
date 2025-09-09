import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Fix the API base URL to match backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Add timeout
});

// Token management functions
export const getAuthToken = (): string | null => {
    return Cookies.get('token') || null;
};

export const getRefreshToken = (): string | null => {
    return Cookies.get('refreshToken') || null;
};

export const setAuthTokens = (token: string, refreshToken: string): void => {
    const tokenExpiry = 1; // 1 day
    const refreshExpiry = 7; // 7 days

    Cookies.set('token', token, {
        expires: tokenExpiry,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    Cookies.set('refreshToken', refreshToken, {
        expires: refreshExpiry,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
};

export const clearAuthTokens = (): void => {
    Cookies.remove('token');
    Cookies.remove('refreshToken');
};

export const isTokenValid = (token: string): boolean => {
    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (error) {
        return false;
    }
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        console.log('🔐 Token in request:', token ? 'Present' : 'Not found');

        if (token && isTokenValid(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        console.error('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });

        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (refreshToken) {
                try {
                    console.log('🔄 Attempting to refresh token...');

                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        { refreshToken }
                    );

                    // Handle both token and accessToken response formats
                    const newToken = response.data.token || response.data.accessToken;
                    const newRefreshToken = response.data.refreshToken;

                    if (!newToken) {
                        throw new Error('No token in refresh response');
                    }

                    console.log('✅ Token refreshed successfully');

                    setAuthTokens(newToken, newRefreshToken);
                    processQueue(null, newToken);

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);

                } catch (refreshError) {
                    console.error('❌ Token refresh failed:', refreshError);
                    processQueue(refreshError, null);
                    clearAuthTokens();

                    // Redirect to login
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                console.log('❌ No refresh token found');
                clearAuthTokens();

                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
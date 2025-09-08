import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Create axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
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

    Cookies.set('token', token, { expires: tokenExpiry, secure: process.env.NODE_ENV === 'production' });
    Cookies.set('refreshToken', refreshToken, { expires: refreshExpiry, secure: process.env.NODE_ENV === 'production' });
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
        if (token && isTokenValid(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If we're already refreshing, queue this request
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
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
                        { refreshToken }
                    );

                    const { token: newToken, refreshToken: newRefreshToken } = response.data;

                    console.log('✅ Token refreshed successfully');

                    setAuthTokens(newToken, newRefreshToken);

                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    // Process the queued requests
                    processQueue(null, newToken);

                    return api(originalRequest);
                } catch (refreshError: any) {
                    console.log('❌ Token refresh failed:', refreshError.response?.data?.message || refreshError.message);

                    // Refresh failed, logout user
                    processQueue(refreshError, null);
                    clearAuthTokens();

                    // Redirect to login if not already there
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // No refresh token, logout
                console.log('❌ No refresh token available');
                processQueue(error, null);
                clearAuthTokens();
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
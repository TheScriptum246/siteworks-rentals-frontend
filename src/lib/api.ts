import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

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
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (refreshToken) {
                try {
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
                        { refreshToken }
                    );

                    const { token: newToken, refreshToken: newRefreshToken } = response.data;
                    setAuthTokens(newToken, newRefreshToken);

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    clearAuthTokens();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                clearAuthTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || 'An error occurred';

        // Don't show toast for auth-related requests or certain status codes
        const isAuthRequest = error.config?.url?.includes('/auth/');
        const is404 = error.response?.status === 404;

        if (!isAuthRequest && !is404) {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default api;
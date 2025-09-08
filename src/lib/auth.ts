import api, { setAuthTokens, clearAuthTokens } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, MessageResponse } from './types';

// Login function
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/signin', credentials);
        const { token, refreshToken } = response.data;

        // Store tokens in cookies
        setAuthTokens(token, refreshToken);

        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Login failed. Please try again.');
    }
};

// Register function
export const register = async (userData: RegisterRequest): Promise<MessageResponse> => {
    try {
        const response = await api.post<MessageResponse>('/auth/signup', userData);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Registration failed. Please try again.');
    }
};

// Logout function
export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/signout');
    } catch (error) {
        // Even if the API call fails, we should clear local tokens
        console.warn('Logout API call failed, but clearing local tokens');
    } finally {
        clearAuthTokens();
    }
};

// Get current user info from token
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/users/profile');
        return response.data;
    } catch (error) {
        throw new Error('Failed to fetch user information');
    }
};

// Helper function to check if user has specific role
export const hasRole = (roles: string[], requiredRole: string): boolean => {
    return roles.includes(requiredRole);
};

// Helper function to check if user is staff
export const isStaff = (roles: string[]): boolean => {
    return hasRole(roles, 'ROLE_STAFF');
};

// Helper function to check if user is client
export const isClient = (roles: string[]): boolean => {
    return hasRole(roles, 'ROLE_CLIENT');
};
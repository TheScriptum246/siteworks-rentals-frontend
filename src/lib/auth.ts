import api, { setAuthTokens, clearAuthTokens } from './api';
import { LoginRequest, RegisterRequest, MessageResponse } from './types';

// Define the actual response type from backend (uses accessToken, not token)
interface AuthResponse {
    accessToken: string;  // Backend sends accessToken, not token
    refreshToken: string;
    tokenType: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}

// Login function
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        console.log('Login attempt with:', credentials.username);
        const response = await api.post('/auth/signin', credentials);

        console.log('Login successful:', response.data);
        const responseData = response.data;

        if (!responseData.accessToken) {
            console.error('No accessToken in response:', responseData);
            throw new Error('No token received from server');
        }

        // Store tokens in cookies (use accessToken as the main token)
        setAuthTokens(responseData.accessToken, responseData.refreshToken);

        return responseData;
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
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
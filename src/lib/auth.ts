import api, { setAuthTokens, clearAuthTokens } from './api';
import { LoginRequest, RegisterRequest, MessageResponse } from './types';

interface AuthResponse {
    token?: string;
    accessToken?: string;
    refreshToken: string;
    type?: string;
    tokenType?: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}

// Login function
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        console.log('🔐 Login attempt with:', credentials.username);
        const response = await api.post('/auth/signin', credentials);

        console.log('✅ Login successful:', response.data);
        const responseData = response.data;

        const authToken = responseData.token || responseData.accessToken;

        if (!authToken) {
            console.error('❌ No token in response:', responseData);
            throw new Error('No token received from server');
        }

        console.log('✅ Token found:', authToken ? 'Present' : 'Missing');

        // Store tokens in cookies
        setAuthTokens(authToken, responseData.refreshToken);

        return responseData;
    } catch (error: any) {
        console.error('❌ Login error:', error.response?.data || error.message);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Login failed. Please try again.');
    }
};

// Register function
export const register = async (userData: RegisterRequest): Promise<MessageResponse> => {
    try {
        console.log('📝 Registration attempt for:', userData.username);
        const response = await api.post<MessageResponse>('/auth/signup', userData);
        console.log('✅ Registration successful');
        return response.data;
    } catch (error: any) {
        console.error('❌ Registration error:', error.response?.data || error.message);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Registration failed. Please try again.');
    }
};

// Logout function
export const logout = async (): Promise<void> => {
    try {
        console.log('👋 Logging out...');
        await api.post('/auth/signout');
    } catch (error) {
        console.warn('⚠️ Logout API call failed, but clearing local tokens');
    } finally {
        clearAuthTokens();
        console.log('✅ Tokens cleared');
    }
};

// Get current user info from API
export const getCurrentUser = async () => {
    try {
        console.log('👤 Fetching current user profile...');
        const response = await api.get('/users/profile');
        console.log('✅ Profile fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to fetch user profile:', error);
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
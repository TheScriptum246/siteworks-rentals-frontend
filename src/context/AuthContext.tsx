'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth';
import { getAuthToken, clearAuthTokens } from '@/lib/api';
import api from '@/lib/api';
import { User, LoginRequest, RegisterRequest } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isClient: boolean;
    isStaff: boolean;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    // Function to refresh user data from API or token
    const refreshUserData = async () => {
        const savedToken = getAuthToken();

        if (savedToken && typeof savedToken === 'string' && savedToken.trim()) {
            try {
                // Check if token is expired first
                const decoded: any = jwtDecode(savedToken);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    console.log('Token expired, clearing auth');
                    clearAuthTokens();
                    setUser(null);
                    setToken(null);
                    return;
                }

                // Try to get user data from API first
                try {
                    console.log('Fetching user profile from API...');
                    const response = await api.get('/users/profile');
                    const userData: User = response.data;

                    // Add roles from token for compatibility
                    userData.role = decoded.roles?.includes('ROLE_STAFF') ? 'STAFF' : 'CLIENT';

                    setUser(userData);
                    setToken(savedToken);
                    console.log('✅ User data refreshed from API:', userData);

                } catch (apiError) {
                    console.warn('API call failed, using token data as fallback:', apiError);

                    // Fallback to token data if API fails
                    const userData: User = {
                        id: decoded.id || 0,
                        username: decoded.sub || '',
                        email: decoded.email || '',
                        firstName: decoded.firstName || '',
                        lastName: decoded.lastName || '',
                        phone: decoded.phone || '',
                        role: decoded.roles?.includes('ROLE_STAFF') ? 'STAFF' : 'CLIENT',
                        createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
                    };

                    setUser(userData);
                    setToken(savedToken);
                    console.log('✅ User data from token fallback:', userData);
                }

            } catch (decodeError) {
                console.error('Error decoding token:', decodeError);
                clearAuthTokens();
                setUser(null);
                setToken(null);
            }
        } else {
            console.log('No token found, clearing auth state');
            setUser(null);
            setToken(null);
        }
    };

    // Initialize auth state ONCE on mount
    useEffect(() => {
        const initializeAuth = async () => {
            if (isInitialized) return; // Prevent multiple initializations

            try {
                console.log('Initializing auth...');
                await refreshUserData();
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
                setIsInitialized(true);
                console.log('Auth initialization complete');
            }
        };

        // Add a small delay to avoid race conditions
        const timer = setTimeout(initializeAuth, 100);

        return () => clearTimeout(timer);
    }, []); // Empty dependency array - run only once

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setLoading(true);
            console.log('Attempting login...');

            const response = await authLogin(credentials);

            // Refresh user data after successful login
            await refreshUserData();

            // Redirect based on user role
            const savedToken = getAuthToken();
            if (savedToken) {
                const decoded: any = jwtDecode(savedToken);
                if (decoded.roles?.includes('ROLE_STAFF')) {
                    router.push('/dashboard');
                } else {
                    router.push('/equipment');
                }
            }

            toast.success('Signed in successfully!');

        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterRequest): Promise<void> => {
        try {
            setLoading(true);
            await authRegister(userData);
            toast.success('Registration successful! Please sign in.');
            router.push('/login');
        } catch (error: any) {
            console.error('Registration error:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('Logging out...');
        authLogout();
        setUser(null);
        setToken(null);
        toast.success('Logged out successfully');
        router.push('/');
    };

    // Helper computed properties
    const isAuthenticated = !!user && !!token;
    const isClient = user?.role === 'CLIENT' || false;
    const isStaff = user?.role === 'STAFF' || false;

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isClient,
        isStaff,
        refreshUserData,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
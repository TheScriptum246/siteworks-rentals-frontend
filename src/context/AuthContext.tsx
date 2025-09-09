'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth';
import { getAuthToken, clearAuthTokens } from '@/lib/api';
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
    refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Function to refresh user data from token
    const refreshUserData = () => {
        const savedToken = getAuthToken();

        if (savedToken && typeof savedToken === 'string' && savedToken.trim()) {
            try {
                const decoded: any = jwtDecode(savedToken);

                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    console.log('Token expired, clearing auth');
                    clearAuthTokens();
                    setUser(null);
                    setToken(null);
                    return;
                }

                // Build user data from decoded token
                const userData: User = {
                    id: decoded.id || 0,
                    username: decoded.sub || '',
                    email: decoded.email || '',
                    firstName: decoded.firstName || '',
                    lastName: decoded.lastName || '',
                    phone: decoded.phone || '',
                    roles: decoded.roles || [],
                    createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
                };

                setUser(userData);
                setToken(savedToken);

                console.log('✅ User data refreshed:', userData);
            } catch (decodeError) {
                console.error('Error decoding token:', decodeError);
                clearAuthTokens();
                setUser(null);
                setToken(null);
                toast.error('Invalid session. Please sign in again.');
            }
        } else {
            setUser(null);
            setToken(null);
        }
    };

    // Initialize auth state from stored token
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                refreshUserData();
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Listen to storage changes (for multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'token' || e.key === 'refreshToken') {
                refreshUserData();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Listen to focus events to refresh user data when tab becomes active
    useEffect(() => {
        const handleFocus = () => {
            const savedToken = getAuthToken();
            if (savedToken && !user) {
                refreshUserData();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user]);

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setLoading(true);
            const response = await authLogin(credentials);

            // The authLogin should have already set the cookies
            // Now refresh the user data from the stored token
            refreshUserData();

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
        authLogout();
        setUser(null);
        setToken(null);
        toast.success('Logged out successfully');
        router.push('/login');
    };

    // Helper computed properties
    const isAuthenticated = !!user && !!token;
    const isClient = user?.roles?.includes('ROLE_CLIENT') || false;
    const isStaff = user?.roles?.includes('ROLE_STAFF') || false;

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
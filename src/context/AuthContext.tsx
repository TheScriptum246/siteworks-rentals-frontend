'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth';
import { clearAuthTokens, getAuthToken } from '@/lib/api';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state from stored token
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const savedToken = getAuthToken();

                if (savedToken && typeof savedToken === 'string' && savedToken.trim()) {
                    try {
                        const decoded: any = jwtDecode(savedToken);

                        // Check if token is expired
                        const currentTime = Date.now() / 1000;
                        if (decoded.exp && decoded.exp < currentTime) {
                            console.log('Token expired, clearing auth');
                            clearAuthTokens();
                            setLoading(false);
                            return;
                        }

                        // Build user data from decoded token and auth response
                        const userData: User = {
                            id: decoded.id || 0,
                            username: decoded.sub || '',
                            email: decoded.email || '',
                            firstName: decoded.firstName || '',
                            lastName: decoded.lastName || '',
                            phone: decoded.phone || '',
                            roles: decoded.roles || [], // Simple string array
                            createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
                        };

                        setUser(userData);
                        setToken(savedToken);
                    } catch (decodeError) {
                        console.error('Error decoding token:', decodeError);
                        clearAuthTokens();
                        toast.error('Invalid session. Please sign in again.');
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                clearAuthTokens();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setLoading(true);
            const response = await authLogin(credentials);

            // Validate that we received a proper token
            if (!response.token || typeof response.token !== 'string') {
                throw new Error('Invalid token received from server');
            }

            // Build user data from auth response
            const userData: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                firstName: '', // Will be populated from backend if needed
                lastName: '',
                phone: '',
                roles: response.roles, // Simple string array
                createdAt: new Date().toISOString()
            };

            setUser(userData);
            setToken(response.token);

            toast.success(`Welcome back, ${userData.username}!`);

            // Redirect to dashboard
            router.push('/dashboard');
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
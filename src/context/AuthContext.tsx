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

                        // Build user data from decoded token
                        const userData: User = {
                            id: decoded.id || 0,
                            username: decoded.sub || '',
                            email: decoded.email || '',
                            firstName: decoded.firstName || '',
                            lastName: decoded.lastName || '',
                            phone: decoded.phone || '',
                            roles: decoded.roles ? decoded.roles.map((role: string) => ({
                                id: 0,
                                name: role as 'ROLE_CLIENT' | 'ROLE_STAFF' | 'ROLE_ADMIN'
                            })) : [],
                            createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : '',
                            updatedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
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

            // Decode the token to get user info
            const decoded: any = jwtDecode(response.token);

            const userData: User = {
                id: decoded.id || response.id || 0,
                username: decoded.sub || response.username || '',
                email: decoded.email || response.email || '',
                firstName: decoded.firstName || '',
                lastName: decoded.lastName || '',
                phone: decoded.phone || '',
                roles: response.roles ? response.roles.map((role: string) => ({
                    id: 0,
                    name: role as 'ROLE_CLIENT' | 'ROLE_STAFF' | 'ROLE_ADMIN'
                })) : [],
                createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : '',
                updatedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
            };

            setUser(userData);
            setToken(response.token);

            toast.success(`Welcome back, ${userData.firstName || userData.username}!`);

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

            toast.success('Account created successfully! Please sign in.');
        } catch (error: any) {
            console.error('Register error:', error);
            const errorMessage = error.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = (): void => {
        authLogout();
        setUser(null);
        setToken(null);
        toast.success('Signed out successfully');
        router.push('/');
    };

    // Computed values
    const isAuthenticated = !!user && !!token;

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
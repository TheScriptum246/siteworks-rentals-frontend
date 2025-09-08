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
            console.log('AuthContext: Starting login process');

            const response = await authLogin(credentials);
            console.log('AuthContext: Login response received', response);

            // The response has accessToken, not token
            if (!response.accessToken || typeof response.accessToken !== 'string') {
                console.error('AuthContext: Invalid accessToken in response', response);
                throw new Error('Invalid token received from server');
            }

            // Try to decode the token to make sure it's valid
            let decodedToken;
            try {
                decodedToken = jwtDecode(response.accessToken);
                console.log('AuthContext: Token decoded successfully', decodedToken);
            } catch (decodeError) {
                console.error('AuthContext: Failed to decode token', decodeError);
                throw new Error('Invalid token format received from server');
            }

            // Build user data from auth response (use response data primarily)
            const userData: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                firstName: '', // Backend doesn't include in JWT response, could fetch separately
                lastName: '',
                phone: '',
                roles: response.roles, // Backend sends this in response
                createdAt: new Date().toISOString()
            };

            console.log('AuthContext: Setting user data', userData);
            setUser(userData);
            setToken(response.accessToken); // Use accessToken here

            toast.success(`Welcome back, ${userData.username}!`);

            if (userData.roles?.includes('ROLE_STAFF')) {
                router.push('/dashboard');
            } else {
                router.push('/equipment'); // Clients go to equipment page
            }
        } catch (error: any) {
            console.error('AuthContext: Login error', error);
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
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '@/lib/types';
import { login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth';
import { getAuthToken, clearAuthTokens, isTokenValid } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = () => {
            const savedToken = getAuthToken();

            if (savedToken && isTokenValid(savedToken)) {
                try {
                    const decoded: any = jwtDecode(savedToken);

                    // Create user object from JWT payload
                    const userData: User = {
                        id: decoded.id,
                        username: decoded.sub, // JWT subject is usually username
                        email: decoded.email || '',
                        firstName: decoded.firstName || '',
                        lastName: decoded.lastName || '',
                        phone: decoded.phone || '',
                        roles: decoded.roles ? decoded.roles.map((role: string) => ({
                            id: 0, // We don't have role ID in JWT
                            name: role as 'ROLE_CLIENT' | 'ROLE_STAFF' | 'ROLE_ADMIN'
                        })) : [],
                        createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : '',
                        updatedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
                    };

                    setUser(userData);
                    setToken(savedToken);
                } catch (error) {
                    console.error('Error decoding token:', error);
                    clearAuthTokens();
                }
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (credentials: LoginRequest): Promise<void> => {
        try {
            setLoading(true);
            const response = await authLogin(credentials);

            // Decode the token to get user info
            const decoded: any = jwtDecode(response.token);

            const userData: User = {
                id: decoded.id,
                username: decoded.sub,
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
            setToken(response.token);

            toast.success(`Welcome back, ${userData.firstName || userData.username}!`);

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error: any) {
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
    const isClient = user?.roles.some(role => role.name === 'ROLE_CLIENT') || false;
    const isStaff = user?.roles.some(role => role.name === 'ROLE_STAFF') || false;

    const value: AuthContextType = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        isClient,
        isStaff,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
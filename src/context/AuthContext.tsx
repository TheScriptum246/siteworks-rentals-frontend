'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, AuthContextType, LoginRequest, RegisterRequest } from '@/lib/types';
import { login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth';
import { getAuthToken, clearAuthTokens, isTokenValid } from '@/lib/api';
import toast from 'react-hot-toast';

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
                            id: 0, // Will be populated properly when we fetch full user data
                            name: role as 'ROLE_CLIENT' | 'ROLE_STAFF'
                        })) : [],
                        createdAt: ''
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

    const login = async (credentials: LoginRequest) => {
        try {
            setLoading(true);
            const response = await authLogin(credentials);

            // Decode token to get user info
            const decoded: any = jwtDecode(response.token);

            const userData: User = {
                id: response.id,
                username: response.username,
                email: response.email,
                firstName: decoded.firstName || '',
                lastName: decoded.lastName || '',
                phone: decoded.phone || '',
                roles: response.roles.map((role: string) => ({
                    id: 0,
                    name: role as 'ROLE_CLIENT' | 'ROLE_STAFF'
                })),
                createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
            };

            setUser(userData);
            setToken(response.token);

            toast.success('Welcome back!');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: RegisterRequest) => {
        try {
            setLoading(true);
            await authRegister(userData);
            toast.success('Registration successful! Please login.');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authLogout();
            setUser(null);
            setToken(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            setUser(null);
            setToken(null);
        }
    };

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
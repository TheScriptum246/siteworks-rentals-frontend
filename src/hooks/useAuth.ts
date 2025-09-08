'use client';

import { useState, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '@/lib/types';
import { login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth';
import { getAuthToken, isTokenValid } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        setLoading(true);

        try {
            const token = getAuthToken();

            if (token && isTokenValid(token)) {
                // Decode JWT to get user info
                const decoded: any = jwtDecode(token);

                const userData: User = {
                    id: decoded.id || decoded.sub,
                    username: decoded.sub || decoded.username,
                    email: decoded.email || '',
                    firstName: decoded.firstName || '',
                    lastName: decoded.lastName || '',
                    phone: decoded.phone || '',
                    roles: decoded.roles ? decoded.roles.map((role: string) => ({
                        id: 0,
                        name: role as 'ROLE_CLIENT' | 'ROLE_STAFF'
                    })) : [],
                    createdAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : ''
                };

                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            // Only clear tokens if it's an auth error (401/403), not a network error
            if (error.response?.status === 401 || error.response?.status === 403) {
                Cookies.remove('siteworks_token');
                Cookies.remove('siteworks_refresh_token');
            }

            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await authLogin(credentials);

            // Small delay to ensure tokens are set
            setTimeout(async () => {
                await checkAuth();
            }, 100);

            toast.success('Login successful!');
        } catch (error: any) {
            const errorMessage = error.message || 'Login failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            await authRegister(data);
            toast.success('Registration successful! Please login.');
        } catch (error: any) {
            const errorMessage = error.message || 'Registration failed';
            toast.error(errorMessage);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authLogout();
            setUser(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API call fails
            setUser(null);
        }
    };

    const isAuthenticated = !!user;
    const isClient = user?.roles.some(role => role.name === 'ROLE_CLIENT') || false;
    const isStaff = user?.roles.some(role => role.name === 'ROLE_STAFF') || false;

    return {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isClient,
        isStaff,
    };
};
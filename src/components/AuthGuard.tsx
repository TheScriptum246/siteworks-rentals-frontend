// src/components/AuthGuard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/lib/api';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireStaff?: boolean;
}

export default function AuthGuard({
                                      children,
                                      requireAuth = false,
                                      requireStaff = false
                                  }: AuthGuardProps) {
    const { user, loading, isAuthenticated, isStaff, refreshUserData } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            // Skip auth check for public pages
            const publicPaths = ['/login', '/register', '/'];
            if (publicPaths.includes(pathname)) {
                setIsInitialized(true);
                return;
            }

            // Check if we have a token but no user (happens on refresh)
            const token = getAuthToken();
            if (token && !user && !loading) {
                console.log('Token found but no user, refreshing auth data...');
                refreshUserData();
                return;
            }

            // If we need auth but don't have it
            if (requireAuth && !loading && !isAuthenticated) {
                console.log('Auth required but not authenticated, redirecting to login...');
                router.push('/login');
                return;
            }

            // If we need staff role but don't have it
            if (requireStaff && !loading && (!isAuthenticated || !isStaff)) {
                console.log('Staff access required but not authorized, redirecting...');
                router.push('/equipment');
                return;
            }

            setIsInitialized(true);
        };

        initializeAuth();
    }, [user, loading, isAuthenticated, isStaff, pathname, requireAuth, requireStaff, router, refreshUserData]);

    // Show loading spinner while initializing
    if (loading || !isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-construction-orange/30 border-t-construction-orange rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show content if all conditions are met
    return <>{children}</>;
}
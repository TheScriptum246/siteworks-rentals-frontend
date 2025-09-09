'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import {
    HardHat,
    Menu,
    X,
    User,
    LogOut,
    Home,
    Calendar,
    Settings,
    Truck,
    Users,
    BarChart3
} from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAuthenticated, refreshUserData } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Refresh auth data when component mounts or pathname changes
    useEffect(() => {
        if (!user && !pathname.includes('/login') && !pathname.includes('/register')) {
            refreshUserData();
        }
    }, [pathname, user, refreshUserData]);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Navigation items based on user role
    const getNavigationItems = () => {
        if (!isAuthenticated || !user) return [];

        if (user.roles?.includes('ROLE_STAFF')) {
            // Staff navigation
            return [
                { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
                { name: 'Manage Rentals', href: '/manage-rentals', icon: Calendar },
                { name: 'Equipment', href: '/equipment', icon: HardHat },
                { name: 'Clients', href: '/clients', icon: Users },
            ];
        } else {
            // Client navigation
            return [
                { name: 'Browse Equipment', href: '/equipment', icon: HardHat },
                { name: 'My Rentals', href: '/my-rentals', icon: Truck },
            ];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <nav className="bg-white shadow-md border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-construction-orange p-2 rounded-lg">
                            <HardHat className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">SiteWorks</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Navigation Links */}
                                {navigationItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                                                isActive
                                                    ? 'text-construction-orange bg-orange-50'
                                                    : 'text-gray-700 hover:text-construction-orange hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}

                                {/* User Dropdown */}
                                <div className="relative">
                                    <div className="flex items-center space-x-3 px-3 py-2">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user?.firstName || user?.username}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user?.roles?.includes('ROLE_STAFF') ? 'Staff Member' : 'Client'}
                                            </div>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Profile"
                                        >
                                            <User className="w-5 h-5 text-gray-600" />
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                            title="Sign Out"
                                        >
                                            <LogOut className="w-5 h-5 text-gray-600 hover:text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-construction-orange transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 bg-construction-orange text-white rounded-md hover:bg-orange-600 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {isAuthenticated ? (
                                <>
                                    <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">
                                        Welcome, {user?.firstName || user?.username}
                                        <br />
                                        <span className="text-xs">
                                            {user?.roles?.includes('ROLE_STAFF') ? 'Staff Member' : 'Client'}
                                        </span>
                                    </div>

                                    {navigationItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                                                    isActive
                                                        ? 'text-construction-orange bg-orange-50'
                                                        : 'text-gray-700 hover:text-construction-orange hover:bg-gray-50'
                                                }`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}

                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profile</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block px-3 py-2 rounded-md bg-construction-orange text-white hover:bg-orange-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
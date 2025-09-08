'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { HardHat, Menu, X, User, LogOut, Home, Calendar, Settings } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

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
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50 transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    href="/equipment"
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50 transition-colors"
                                >
                                    <HardHat className="w-4 h-4" />
                                    <span>Equipment</span>
                                </Link>

                                <Link
                                    href="/booking"
                                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Book Rental</span>
                                </Link>

                                {/* User Menu */}
                                <div className="relative group">
                                    <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50 transition-colors">
                                        <User className="w-4 h-4" />
                                        <span>{user?.firstName || user?.username}</span>
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="py-1">
                                            <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                                {user?.email}
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            >
                                                <Settings className="w-4 h-4" />
                                                <span>Profile Settings</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
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
                                    </div>

                                    <Link
                                        href="/dashboard"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Home className="w-4 h-4" />
                                        <span>Dashboard</span>
                                    </Link>

                                    <Link
                                        href="/equipment"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <HardHat className="w-4 h-4" />
                                        <span>Equipment</span>
                                    </Link>

                                    <Link
                                        href="/booking"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        <span>Book Rental</span>
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 hover:text-construction-orange hover:bg-gray-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Profile Settings</span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
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
                                        className="block px-3 py-2 bg-construction-orange text-white rounded-md hover:bg-orange-600"
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
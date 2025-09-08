'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HardHat, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, isAuthenticated, isStaff } = useAuth();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and brand */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <HardHat className="h-8 w-8 text-construction-orange" />
                            <span className="text-xl font-bold text-gray-900">
                SiteWorks Rentals
              </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    href="/"
                                    className="text-gray-700 hover:text-construction-orange transition-colors"
                                >
                                    Equipment
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-700 hover:text-construction-orange transition-colors"
                                >
                                    Dashboard
                                </Link>

                                {/* User dropdown */}
                                <div className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-gray-600" />
                                    <span className="text-gray-700">{user?.firstName || user?.username}</span>
                                    {isStaff && (
                                        <span className="bg-construction-orange text-white text-xs px-2 py-1 rounded">
                      STAFF
                    </span>
                                    )}
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-700 hover:text-construction-orange transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-construction-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-construction-orange"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/"
                                        className="block px-3 py-2 text-gray-700 hover:text-construction-orange"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Equipment
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="block px-3 py-2 text-gray-700 hover:text-construction-orange"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>

                                    <div className="px-3 py-2 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <User className="h-5 w-5 text-gray-600" />
                                            <span className="text-gray-700">{user?.firstName || user?.username}</span>
                                            {isStaff && (
                                                <span className="bg-construction-orange text-white text-xs px-2 py-1 rounded">
                          STAFF
                        </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block px-3 py-2 text-gray-700 hover:text-construction-orange"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="block px-3 py-2 bg-construction-orange text-white rounded-lg mx-3"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
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
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    HardHat,
    Phone,
    Mail,
    MapPin,
    Clock,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    Shield,
    FileText,
    Users,
    Truck
} from 'lucide-react';

export default function Footer() {
    const { user, isAuthenticated } = useAuth();

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="bg-construction-orange p-2 rounded-lg">
                                <HardHat className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">SiteWorks</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Professional construction equipment rental made simple.
                            Get the tools you need, when you need them, with reliable service and competitive rates.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                               className="text-gray-400 hover:text-construction-orange transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                               className="text-gray-400 hover:text-construction-orange transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                               className="text-gray-400 hover:text-construction-orange transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                               className="text-gray-400 hover:text-construction-orange transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <div className="space-y-2">
                            <Link href="/equipment" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                Browse Equipment
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link href="/my-rentals" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                        My Rentals
                                    </Link>
                                    <Link href="/profile" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                        My Profile
                                    </Link>
                                    {user?.roles?.includes('ROLE_STAFF') && (
                                        <Link href="/dashboard" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                            Staff Dashboard
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                        Sign In
                                    </Link>
                                    <Link href="/register" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                        Get Started
                                    </Link>
                                </>
                            )}
                            <Link href="/about" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                About Us
                            </Link>
                        </div>
                    </div>

                    {/* Equipment Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Equipment Categories</h3>
                        <div className="space-y-2">
                            <Link href="/equipment?category=EXCAVATORS" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                Excavators
                            </Link>
                            <Link href="/equipment?category=BULLDOZERS" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                Bulldozers
                            </Link>
                            <Link href="/equipment?category=CRANES" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                Cranes
                            </Link>
                            <Link href="/equipment?category=GENERATORS" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                Generators
                            </Link>
                            <Link href="/equipment?category=TOOLS" className="block text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                Tools
                            </Link>
                            <Link href="/equipment" className="block text-construction-orange hover:text-orange-400 transition-colors text-sm font-medium">
                                View All Equipment →
                            </Link>
                        </div>
                    </div>

                    {/* Contact & Support */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact & Support</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Phone className="w-4 h-4 text-construction-orange" />
                                <div>
                                    <p className="text-sm font-medium">Call Us</p>
                                    <a href="tel:+1-555-0123" className="text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                        +381 65 111-111
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-construction-orange" />
                                <div>
                                    <p className="text-sm font-medium">Email Us</p>
                                    <a href="mailto:support@siteworks.com" className="text-gray-300 hover:text-construction-orange transition-colors text-sm">
                                        support@siteworks.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-construction-orange" />
                                <div>
                                    <p className="text-sm font-medium">Visit Us</p>
                                    <p className="text-gray-300 text-sm">
                                        123 Industrial Blvd<br />
                                        Construction City, CC 12345
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Clock className="w-4 h-4 text-construction-orange" />
                                <div>
                                    <p className="text-sm font-medium">Business Hours</p>
                                    <p className="text-gray-300 text-sm">
                                        Mon-Fri: 7:00 AM - 6:00 PM<br />
                                        Sat: 8:00 AM - 4:00 PM<br />
                                        Sun: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
                            <p>&copy; {currentYear} SiteWorks Rentals. All rights reserved.</p>
                            <div className="flex items-center space-x-4">
                                <Link href="/privacy" className="hover:text-construction-orange transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="hover:text-construction-orange transition-colors">
                                    Terms of Service
                                </Link>
                                <Link href="/contact" className="hover:text-construction-orange transition-colors">
                                    Contact
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-construction-orange" />
                                <span>Secure & Insured</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Truck className="w-4 h-4 text-construction-orange" />
                                <span>Free Delivery Available</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
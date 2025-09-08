'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HardHat, Wrench, Clock, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (user) {
        return null; // Will redirect to dashboard
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-construction-orange p-4 rounded-full">
                            <HardHat className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        SiteWorks Rentals
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Professional construction equipment rental made simple.
                        Get the tools you need, when you need them.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            href="/login"
                            className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-3"
                        >
                            <span>Get Started</span>
                        </Link>
                        <Link
                            href="/register"
                            className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-3"
                        >
                            <span>Create Account</span>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    <div className="text-center">
                        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Wrench className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Quality Equipment</h3>
                        <p className="text-gray-600">
                            Professional-grade construction tools and equipment from trusted brands.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Flexible Rental</h3>
                        <p className="text-gray-600">
                            Daily, weekly, or monthly rentals to fit your project timeline and budget.
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Reliable Service</h3>
                        <p className="text-gray-600">
                            Maintained equipment with support to keep your projects on track.
                        </p>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-white rounded-lg shadow-md p-8 mt-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to start your next project?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Browse our equipment catalog and book your rentals online.
                    </p>
                    <Link
                        href="/register"
                        className="btn-primary inline-flex items-center space-x-2"
                    >
                        <HardHat className="w-4 h-4" />
                        <span>Join SiteWorks Today</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
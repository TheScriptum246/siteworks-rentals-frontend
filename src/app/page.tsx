'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HardHat, Wrench, Clock, Shield, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            // Redirect based on user role
            if (user.role?.includes('ROLE_STAFF')) {
                router.push('/dashboard');
            } else {
                router.push('/equipment');
            }
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
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
            <div className="max-w-7xl mx-auto container-padding pt-20 pb-16">
                <div className="text-center fade-in">
                    <div className="flex justify-center mb-6">
                        <div className="bg-construction-orange p-4 rounded-full shadow-lg">
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
                            href="/register"
                            className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-3"
                        >
                            <HardHat className="w-5 h-5" />
                            <span>Get Started</span>
                        </Link>
                        <Link
                            href="/login"
                            className="btn-secondary flex items-center justify-center space-x-2 text-lg px-8 py-3"
                        >
                            <span>Sign In</span>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    <div className="text-center slide-up">
                        <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Wrench className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Quality Equipment</h3>
                        <p className="text-gray-600">
                            Professional-grade construction tools and equipment from trusted brands.
                        </p>
                    </div>

                    <div className="text-center slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Flexible Rental</h3>
                        <p className="text-gray-600">
                            Daily, weekly, or monthly rentals to fit your project timeline and budget.
                        </p>
                    </div>

                    <div className="text-center slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Reliable Service</h3>
                        <p className="text-gray-600">
                            Maintained equipment with support to keep your projects on track.
                        </p>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mt-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Why Choose SiteWorks?
                        </h2>
                        <p className="text-lg text-gray-600">
                            We make equipment rental simple, reliable, and cost-effective
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Easy Online Booking</h4>
                                <p className="text-gray-600">Book equipment online 24/7 with instant confirmation</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Competitive Pricing</h4>
                                <p className="text-gray-600">Transparent pricing with no hidden fees</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Regular Maintenance</h4>
                                <p className="text-gray-600">All equipment is regularly serviced and safety-checked</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-1">Expert Support</h4>
                                <p className="text-gray-600">Get help from our knowledgeable team when you need it</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-construction-orange rounded-2xl shadow-xl p-8 mt-16 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to start your next project?
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                        Browse our equipment catalog and book your rentals online today.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center space-x-2 bg-white text-construction-orange px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <HardHat className="w-5 h-5" />
                        <span>Join SiteWorks Today</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
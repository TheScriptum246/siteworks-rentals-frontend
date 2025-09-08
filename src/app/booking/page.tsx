'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookingForm from '@/components/BookingForm';
import { Calendar, HardHat } from 'lucide-react';

function BookingContent() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedEquipmentId = searchParams.get('equipment');

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

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

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <p className="text-gray-600">Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-padding pt-20 pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-construction-orange p-3 rounded-full">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Book Equipment Rental
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Select your equipment and rental dates. We'll review your request and send you a confirmation with pickup details.
                        </p>
                    </div>

                    {/* Booking Form */}
                    <BookingForm
                        preSelectedEquipmentId={preSelectedEquipmentId ? parseInt(preSelectedEquipmentId) : undefined}
                    />

                    {/* Help Section */}
                    <div className="card mt-8 bg-blue-50 border border-blue-200">
                        <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <HardHat className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                                <div className="text-sm text-blue-800 space-y-2">
                                    <p>• All equipment is professionally maintained and safety-checked</p>
                                    <p>• Delivery and pickup can be arranged for an additional fee</p>
                                    <p>• Insurance coverage is included with all rentals</p>
                                    <p>• Our team will contact you within 2 hours to confirm availability</p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        Questions? Call us at <span className="font-semibold">(555) 123-4567</span> or email{' '}
                                        <span className="font-semibold">support@siteworksrentals.com</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading booking page...</p>
                    </div>
                </div>
            </div>
        }>
            <BookingContent />
        </Suspense>
    );
}
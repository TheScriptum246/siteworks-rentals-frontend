'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Equipment } from '@/lib/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    HardHat,
    CheckCircle,
    XCircle,
    DollarSign,
    Info,
    Star,
    Clock,
    Shield
} from 'lucide-react';

export default function EquipmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchEquipment(params.id as string);
        }
    }, [params.id]);

    const fetchEquipment = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get<Equipment>(`/equipment/${id}`);
            setEquipment(response.data);
        } catch (error: any) {
            console.error('Error fetching equipment:', error);
            setError('Equipment not found or error loading details');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading equipment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !equipment) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container-padding pt-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-red-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Equipment Not Found</h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => router.back()}
                                className="btn-secondary flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Go Back</span>
                            </button>
                            <Link href="/equipment" className="btn-primary">
                                Browse Equipment
                            </Link>
                        </div>
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
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link href="/equipment" className="hover:text-construction-orange">
                                Equipment
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900">{equipment.name}</span>
                        </nav>
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="btn-secondary flex items-center space-x-2 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Equipment</span>
                    </button>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
                                {equipment.imageUrl ? (
                                    <Image
                                        src={equipment.imageUrl}
                                        alt={equipment.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <HardHat className="w-24 h-24 text-gray-400" />
                                    </div>
                                )}

                                {/* Availability Badge */}
                                <div className="absolute top-4 right-4">
                                    {equipment.available ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Available
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Unavailable
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Additional Equipment Info */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white rounded-lg border">
                                    <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Insured</p>
                                    <p className="text-xs text-gray-600">Fully covered</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg border">
                                    <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Quality</p>
                                    <p className="text-xs text-gray-600">Professional grade</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg border">
                                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-gray-900">Support</p>
                                    <p className="text-xs text-gray-600">24/7 assistance</p>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            {/* Header */}
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                        {equipment.category}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                    {equipment.name}
                                </h1>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {equipment.description}
                                </p>
                            </div>

                            {/* Pricing */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Rental Rates
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <span className="text-gray-600">Daily Rate:</span>
                                        <span className="text-xl font-bold text-construction-orange">
                                            {formatPrice(equipment.dailyRate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                        <span className="text-gray-600">Weekly Rate:</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {formatPrice(equipment.weeklyRate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Monthly Rate:</span>
                                        <span className="text-lg font-semibold text-gray-900">
                                            {formatPrice(equipment.monthlyRate)}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <Info className="w-4 h-4 inline mr-1" />
                                        Weekly and monthly rates offer significant savings
                                    </p>
                                </div>
                            </div>

                            {/* Specifications */}
                            {equipment.specifications && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Specifications
                                    </h3>
                                    <div className="text-gray-700 whitespace-pre-line">
                                        {equipment.specifications}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {user && equipment.available ? (
                                    <Link
                                        href={`/booking?equipment=${equipment.id}`}
                                        className="w-full btn-primary flex items-center justify-center space-x-2 py-3 text-lg"
                                    >
                                        <Calendar className="w-5 h-5" />
                                        <span>Book This Equipment</span>
                                    </Link>
                                ) : !user ? (
                                    <div className="space-y-3">
                                        <Link
                                            href="/register"
                                            className="w-full btn-primary flex items-center justify-center space-x-2 py-3 text-lg"
                                        >
                                            <span>Sign Up to Book</span>
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="w-full btn-secondary flex items-center justify-center space-x-2 py-3"
                                        >
                                            <span>Already have an account? Sign In</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-gray-300 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
                                    >
                                        Currently Unavailable
                                    </button>
                                )}

                                <button
                                    onClick={() => window.history.back()}
                                    className="w-full btn-secondary flex items-center justify-center space-x-2 py-3"
                                >
                                    <span>Continue Browsing</span>
                                </button>
                            </div>

                            {/* Additional Info */}
                            <div className="card bg-gray-50">
                                <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Have questions about this equipment or need assistance with your rental?
                                </p>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-600">
                                        📞 Call us: <span className="font-medium">+381 65 111 1111</span>
                                    </p>
                                    <p className="text-gray-600">
                                        📧 Email: <span className="font-medium">support@siteworksrentals.com</span>
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
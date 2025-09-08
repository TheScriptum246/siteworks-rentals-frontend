'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Rental } from '@/lib/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import {
    Calendar,
    Truck,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Plus,
    MapPin,
    Eye,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRentalsPage() {
    const { user, loading: authLoading } = useAuth();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');

    useEffect(() => {
        if (user) {
            fetchRentals();
        }
    }, [user]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const response = await api.get<Rental[]>('/rentals/my');
            setRentals(response.data);
        } catch (error) {
            console.error('Error fetching rentals:', error);
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESERVED': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
            case 'ACTIVE': return 'bg-green-100 text-green-800';
            case 'COMPLETED': return 'bg-gray-100 text-gray-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESERVED': return <Clock className="w-4 h-4" />;
            case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
            case 'ACTIVE': return <Truck className="w-4 h-4" />;
            case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
            case 'CANCELLED': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
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

    const cancelRental = async (rentalId: number) => {
        try {
            // Show loading toast
            const loadingToast = toast.loading('Cancelling rental...');

            await api.put(`/rentals/${rentalId}/cancel`);

            // Dismiss loading toast and show success
            toast.dismiss(loadingToast);
            toast.success('Rental cancelled successfully!');

            // Refresh the rentals list
            fetchRentals();

        } catch (error: any) {
            console.error('Error cancelling rental:', error);

            // Show error toast with specific message
            const errorMessage = error.response?.data?.message || 'Failed to cancel rental';
            toast.error(errorMessage);
        }
    };

    // Filter rentals
    const filteredRentals = rentals.filter(rental => {
        const now = new Date();
        const startDate = new Date(rental.startDate);
        const endDate = new Date(rental.endDate);

        switch (filter) {
            case 'active':
                return rental.status === 'ACTIVE' || rental.status === 'CONFIRMED';
            case 'upcoming':
                return startDate > now && (rental.status === 'RESERVED' || rental.status === 'CONFIRMED');
            case 'completed':
                return rental.status === 'COMPLETED' || rental.status === 'CANCELLED';
            case 'all':
            default:
                return true;
        }
    });

    // Get counts for stats
    const activeCount = rentals.filter(r => r.status === 'ACTIVE' || r.status === 'CONFIRMED').length;
    const upcomingCount = rentals.filter(r => {
        const startDate = new Date(r.startDate);
        return startDate > new Date() && (r.status === 'RESERVED' || r.status === 'CONFIRMED');
    }).length;
    const completedCount = rentals.filter(r => r.status === 'COMPLETED').length;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your rentals...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect staff to dashboard
    if (user?.roles?.includes('ROLE_STAFF')) {
        window.location.href = '/dashboard';
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-padding pt-20 pb-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                My Equipment Rentals
                            </h1>
                            <p className="text-gray-600">
                                Manage your current and past equipment rentals
                            </p>
                        </div>
                        <a
                            href="/equipment"
                            className="btn-primary flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Rental</span>
                        </a>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card text-center">
                            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Active Rentals
                            </h3>
                            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
                        </div>

                        <div className="card text-center">
                            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                                <Calendar className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Upcoming
                            </h3>
                            <p className="text-2xl font-bold text-green-600">{upcomingCount}</p>
                        </div>

                        <div className="card text-center">
                            <div className="bg-gray-100 p-3 rounded-full w-fit mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Completed
                            </h3>
                            <p className="text-2xl font-bold text-gray-600">{completedCount}</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="card mb-8">
                        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg mb-6">
                            {[
                                { key: 'all', label: 'All Rentals' },
                                { key: 'active', label: 'Active' },
                                { key: 'upcoming', label: 'Upcoming' },
                                { key: 'completed', label: 'Completed' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key as any)}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                                        filter === key
                                            ? 'bg-white text-construction-orange shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Rentals List */}
                        {filteredRentals.length > 0 ? (
                            <div className="space-y-4">
                                {filteredRentals.map((rental) => (
                                    <div key={rental.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                                                        {getStatusIcon(rental.status)}
                                                        <span className="ml-1">{rental.status}</span>
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Rental #{rental.id}
                                                    </span>
                                                </div>
                                                <p className="font-medium text-gray-900">
                                                    {rental.rentalEquipment?.map(item => item.equipment.name).join(', ') || 'Equipment not available'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-lg text-construction-orange">
                                                    {formatPrice(rental.totalAmount || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                            <div>
                                                <span className="font-medium">Start:</span> {new Date(rental.startDate).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-medium">End:</span> {new Date(rental.endDate).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {rental.notes && (
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Notes:</span> {rental.notes}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center">
                                            <div className="flex space-x-3">
                                                <button className="text-construction-orange hover:text-orange-600 text-sm font-medium flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>View Details</span>
                                                </button>
                                                {rental.status === 'COMPLETED' && (
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                                                        <Download className="w-4 h-4" />
                                                        <span>Download Receipt</span>
                                                    </button>
                                                )}
                                            </div>
                                            {rental.status === 'RESERVED' && (
                                                <button
                                                    onClick={() => {
                                                        toast((t) => (
                                                            <div className="flex items-center space-x-3">
                                                                <span>Cancel this rental?</span>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                                        onClick={() => {
                                                                            toast.dismiss(t.id);
                                                                            cancelRental(rental.id);
                                                                        }}
                                                                    >
                                                                        Yes
                                                                    </button>
                                                                    <button
                                                                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                                        onClick={() => toast.dismiss(t.id)}
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ), {
                                                            duration: 10000, // 10 seconds to decide
                                                            position: 'top-center',
                                                        });
                                                    }}
                                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Cancel Rental
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {filter === 'all' ? 'No rentals yet' : `No ${filter} rentals`}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {filter === 'all'
                                        ? 'Start browsing our equipment to make your first rental'
                                        : `You don't have any ${filter} rentals at the moment`
                                    }
                                </p>
                                <a
                                    href="/equipment"
                                    className="btn-primary inline-flex items-center space-x-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Browse Equipment</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Rental, Equipment } from '@/lib/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
    Calendar,
    HardHat,
    Users,
    Clock,
    TrendingUp,
    Star,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Plus
} from 'lucide-react';

interface DashboardStats {
    totalRentals: number;
    activeRentals: number;
    upcomingRentals: number;
    totalRevenue?: number;
    todayRentals?: number;
    totalClients?: number;
    availableEquipment?: number;
}

export default function DashboardPage() {
    const { user, loading: authLoading, isAuthenticated, isClient, isStaff } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalRentals: 0,
        activeRentals: 0,
        upcomingRentals: 0,
        totalRevenue: 0,
        todayRentals: 0,
        totalClients: 0,
        availableEquipment: 0
    });
    const [recentRentals, setRecentRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && isAuthenticated) {
            fetchDashboardData();
        }
    }, [user, isAuthenticated]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            if (isClient) {
                // Client dashboard data
                const rentalsRes = await api.get<Rental[]>('/rentals/my');
                const rentals = rentalsRes.data;

                const now = new Date();
                const active = rentals.filter(rental =>
                    rental.status === 'ACTIVE' || rental.status === 'CONFIRMED'
                );
                const upcoming = rentals.filter(rental =>
                    new Date(rental.startDate) > now &&
                    (rental.status === 'RESERVED' || rental.status === 'CONFIRMED')
                );

                setStats({
                    totalRentals: rentals.length,
                    activeRentals: active.length,
                    upcomingRentals: upcoming.length
                });

                // Get 5 most recent rentals
                setRecentRentals(rentals.slice(0, 5));

            } else if (isStaff) {
                // Staff dashboard data
                const [rentalsRes, equipmentRes] = await Promise.all([
                    api.get<Rental[]>('/rentals'),
                    api.get<Equipment[]>('/equipment')
                ]);

                const rentals = rentalsRes.data;
                const equipment = equipmentRes.data;

                const now = new Date();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                const todayRentals = rentals.filter(rental => {
                    const startDate = new Date(rental.startDate);
                    const endDate = new Date(rental.endDate);
                    return startDate <= tomorrow && endDate >= today;
                });

                const activeRentals = rentals.filter(rental =>
                    rental.status === 'ACTIVE' || rental.status === 'CONFIRMED'
                );

                const totalRevenue = rentals
                    .filter(rental => rental.status === 'COMPLETED')
                    .reduce((sum, rental) => sum + rental.totalAmount, 0);

                const availableEquipment = equipment.filter(eq => eq.available).length;

                setStats({
                    totalRentals: rentals.length,
                    activeRentals: activeRentals.length,
                    upcomingRentals: activeRentals.length,
                    totalRevenue,
                    todayRentals: todayRentals.length,
                    availableEquipment
                });

                // Get recent rentals for staff view
                setRecentRentals(rentals.slice(0, 5));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            RESERVED: 'status-badge status-reserved',
            CONFIRMED: 'status-badge status-confirmed',
            ACTIVE: 'status-badge status-active',
            COMPLETED: 'status-badge status-completed',
            CANCELLED: 'status-badge status-cancelled'
        };

        return statusClasses[status as keyof typeof statusClasses] || 'status-badge';
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <p className="text-gray-600">Not authenticated. Redirecting...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-padding pt-20 pb-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Welcome Section */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back, {user.firstName || user.username}! 👋
                        </h1>
                        <p className="text-gray-600">
                            {isClient ? 'Manage your equipment rentals' : 'Manage your rental business'}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {isClient ? (
                            <>
                                <div className="card text-center">
                                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Total Rentals
                                    </h3>
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalRentals}</p>
                                    <p className="text-sm text-gray-600 mt-1">All time</p>
                                </div>

                                <div className="card text-center">
                                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Active Rentals
                                    </h3>
                                    <p className="text-2xl font-bold text-green-600">{stats.activeRentals}</p>
                                    <p className="text-sm text-gray-600 mt-1">Currently active</p>
                                </div>

                                <div className="card text-center">
                                    <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <Clock className="w-6 h-6 text-construction-orange" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Upcoming
                                    </h3>
                                    <p className="text-2xl font-bold text-construction-orange">{stats.upcomingRentals}</p>
                                    <p className="text-sm text-gray-600 mt-1">Future rentals</p>
                                </div>

                                <div className="card text-center">
                                    <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <HardHat className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Equipment
                                    </h3>
                                    <p className="text-2xl font-bold text-purple-600">Browse</p>
                                    <p className="text-sm text-gray-600 mt-1">Available</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="card text-center">
                                    <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Today's Rentals
                                    </h3>
                                    <p className="text-2xl font-bold text-blue-600">{stats.todayRentals}</p>
                                    <p className="text-sm text-gray-600 mt-1">Active today</p>
                                </div>

                                <div className="card text-center">
                                    <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Total Revenue
                                    </h3>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatPrice(stats.totalRevenue || 0)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">Completed rentals</p>
                                </div>

                                <div className="card text-center">
                                    <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <TrendingUp className="w-6 h-6 text-construction-orange" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Active Rentals
                                    </h3>
                                    <p className="text-2xl font-bold text-construction-orange">{stats.activeRentals}</p>
                                    <p className="text-sm text-gray-600 mt-1">In progress</p>
                                </div>

                                <div className="card text-center">
                                    <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                                        <HardHat className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Available Equipment
                                    </h3>
                                    <p className="text-2xl font-bold text-purple-600">{stats.availableEquipment}</p>
                                    <p className="text-sm text-gray-600 mt-1">Ready to rent</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Recent Rentals */}
                    {recentRentals.length > 0 && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Recent Rentals
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {recentRentals.map((rental) => (
                                    <div key={rental.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-construction-orange p-2 rounded-lg">
                                                <HardHat className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    Rental #{rental.id}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                                </p>
                                                {!isClient && (
                                                    <p className="text-sm text-gray-600">
                                                        Client: {rental.client.firstName} {rental.client.lastName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={getStatusBadge(rental.status)}>
                                                {rental.status}
                                            </span>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                {formatPrice(rental.totalAmount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/equipment"
                                className="btn-primary text-center flex items-center justify-center space-x-2 py-3"
                            >
                                <HardHat className="w-5 h-5" />
                                <span>Browse Equipment</span>
                            </Link>

                            {isClient && (
                                <Link
                                    href="/booking"
                                    className="btn-secondary text-center flex items-center justify-center space-x-2 py-3"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>New Rental</span>
                                </Link>
                            )}

                            <Link
                                href={isClient ? "/rentals" : "/rentals/manage"}
                                className="btn-secondary text-center flex items-center justify-center space-x-2 py-3"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>{isClient ? "My Rentals" : "Manage Rentals"}</span>
                            </Link>

                            {isStaff && (
                                <Link
                                    href="/clients"
                                    className="btn-secondary text-center flex items-center justify-center space-x-2 py-3"
                                >
                                    <Users className="w-5 h-5" />
                                    <span>Manage Clients</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
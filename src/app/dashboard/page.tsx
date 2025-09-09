'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Calendar,
    DollarSign,
    TrendingUp,
    Package,
    Users,
    HardHat
} from 'lucide-react';

// Dashboard data type
interface DashboardStats {
    todayRentals: number;
    totalRevenue: number;
    activeRentals: number;
    availableEquipment: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        todayRentals: 0,
        totalRevenue: 0,
        activeRentals: 0,
        availableEquipment: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch rentals and equipment data in parallel
            const [rentalsResponse, equipmentResponse] = await Promise.all([
                api.get('/rentals'),
                api.get('/equipment/all')
            ]);

            const rentals = rentalsResponse.data || [];
            const equipment = equipmentResponse.data || [];

            // Calculate today's rentals
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(todayStart);
            todayEnd.setDate(todayEnd.getDate() + 1);

            const todayRentals = rentals.filter((rental: any) => {
                const rentalDate = new Date(rental.createdAt);
                return rentalDate >= todayStart && rentalDate < todayEnd;
            }).length;

            // Calculate total revenue
            const totalRevenue = rentals.reduce((sum: number, rental: any) => {
                return sum + (rental.totalCost || 0);
            }, 0);

            // Calculate active rentals (RESERVED, CONFIRMED, ACTIVE statuses)
            const activeRentals = rentals.filter((rental: any) =>
                ['RESERVED', 'CONFIRMED', 'ACTIVE'].includes(rental.status)
            ).length;

            // Calculate available equipment
            const availableEquipment = equipment.filter((item: any) => item.available === true).length;

            setStats({
                todayRentals,
                totalRevenue,
                activeRentals,
                availableEquipment
            });

        } catch (error: any) {
            console.error('Error loading dashboard data:', error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({
                          title,
                          value,
                          subtitle,
                          icon: Icon,
                          bgColor = "bg-white",
                          iconColor = "text-construction-orange"
                      }: {
        title: string;
        value: string | number;
        subtitle: string;
        icon: any;
        bgColor?: string;
        iconColor?: string;
    }) => (
        <div className={`${bgColor} rounded-lg shadow border border-gray-200 p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {loading ? (
                            <div className="loading-spinner w-6 h-6"></div>
                        ) : (
                            typeof value === 'number' && title === 'Total Revenue' ?
                                `$${value.toLocaleString()}` :
                                value.toLocaleString()
                        )}
                    </p>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <div className="container-padding pt-20 pb-8">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center mb-4">
                                <div className="bg-construction-orange p-2 rounded-lg mr-3">
                                    <HardHat className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Welcome back, {user?.firstName}! 👋
                                    </h1>
                                    <p className="text-gray-600">Manage your rental business</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Today's Rentals"
                                value={stats.todayRentals}
                                subtitle="Active today"
                                icon={Calendar}
                                iconColor="text-blue-600"
                            />
                            <StatCard
                                title="Total Revenue"
                                value={stats.totalRevenue}
                                subtitle="From completed rentals"
                                icon={DollarSign}
                                iconColor="text-green-600"
                            />
                            <StatCard
                                title="Active Rentals"
                                value={stats.activeRentals}
                                subtitle="Currently in progress"
                                icon={TrendingUp}
                                iconColor="text-orange-600"
                            />
                            <StatCard
                                title="Available Equipment"
                                value={stats.availableEquipment}
                                subtitle="Ready to rent"
                                icon={Package}
                                iconColor="text-purple-600"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a
                                    href="/equipment"
                                    className="flex items-center p-4 bg-construction-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    <HardHat className="w-5 h-5 mr-3" />
                                    Browse Equipment
                                </a>
                                <a
                                    href="/manage-rentals"
                                    className="flex items-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                                >
                                    <Calendar className="w-5 h-5 mr-3" />
                                    Manage Rentals
                                </a>
                                <a
                                    href="/clients"
                                    className="flex items-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                                >
                                    <Users className="w-5 h-5 mr-3" />
                                    Manage Clients
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
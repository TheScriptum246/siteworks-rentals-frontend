'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
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
        // Simulate loading dashboard stats
        const loadDashboardData = async () => {
            try {
                // In a real app, you'd fetch this from your API
                setTimeout(() => {
                    setStats({
                        todayRentals: 0,
                        totalRevenue: 0,
                        activeRentals: 0,
                        availableEquipment: 0
                    });
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

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
        <div className={`${bgColor} rounded-lg shadow p-6 border border-gray-200`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );

    return (
        <AuthGuard requireAuth={true} requireStaff={true}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <main className="pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <HardHat className="w-8 h-8 text-construction-orange mr-3" />
                                Welcome back, {user?.firstName}! 👋
                            </h1>
                            <p className="text-gray-600 mt-2">Manage your rental business</p>
                        </div>

                        {/* Stats Grid */}
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
                                value={`$${stats.totalRevenue}`}
                                subtitle="Completed rentals"
                                icon={DollarSign}
                                iconColor="text-green-600"
                            />
                            <StatCard
                                title="Active Rentals"
                                value={stats.activeRentals}
                                subtitle="In progress"
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

                        {/* Debug Info (remove in production) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
                                <pre className="text-xs text-yellow-700">
                                    {JSON.stringify({
                                        user: user ? {
                                            id: user.id,
                                            username: user.username,
                                            roles: user.roles
                                        } : null,
                                        timestamp: new Date().toISOString()
                                    }, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
// src/app/clients/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Users,
    Search,
    Mail,
    Phone,
    Calendar,
    DollarSign,
    Eye,
    UserCheck,
    UserX,
    Shield,
    HardHat
} from 'lucide-react';

interface Client {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'CLIENT' | 'STAFF';
    createdAt: string;
    updatedAt: string;
}

interface ClientStats {
    totalRentals: number;
    totalSpent: number;
    activeRentals: number;
    lastRentalDate?: string;
}

export default function ClientsPage() {
    const { user } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientStats, setClientStats] = useState<{ [key: number]: ClientStats }>({});
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENT' | 'STAFF'>('ALL');

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        filterClients();
    }, [clients, searchTerm, roleFilter]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get<Client[]>('/users');
            setClients(response.data);

            // Fetch stats for each client
            const statsPromises = response.data.map(async (client) => {
                try {
                    const rentalsResponse = await api.get(`/rentals/client/${client.id}`);
                    const rentals = rentalsResponse.data;

                    const totalSpent = rentals.reduce((sum: number, rental: any) => sum + rental.totalCost, 0);
                    const activeRentals = rentals.filter((rental: any) =>
                        ['RESERVED', 'CONFIRMED', 'ACTIVE'].includes(rental.status)
                    ).length;

                    const sortedRentals = rentals.sort((a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );

                    return {
                        clientId: client.id,
                        stats: {
                            totalRentals: rentals.length,
                            totalSpent,
                            activeRentals,
                            lastRentalDate: sortedRentals.length > 0 ? sortedRentals[0].createdAt : undefined
                        }
                    };
                } catch (error) {
                    return {
                        clientId: client.id,
                        stats: {
                            totalRentals: 0,
                            totalSpent: 0,
                            activeRentals: 0
                        }
                    };
                }
            });

            const statsResults = await Promise.all(statsPromises);
            const statsMap = statsResults.reduce((acc, { clientId, stats }) => {
                acc[clientId] = stats;
                return acc;
            }, {} as { [key: number]: ClientStats });

            setClientStats(statsMap);
        } catch (error: any) {
            console.error('Error fetching clients:', error);
            toast.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const filterClients = () => {
        let filtered = clients;

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(client => client.role === roleFilter);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(client =>
                client.firstName.toLowerCase().includes(term) ||
                client.lastName.toLowerCase().includes(term) ||
                client.username.toLowerCase().includes(term) ||
                client.email.toLowerCase().includes(term) ||
                (client.phone && client.phone.toLowerCase().includes(term))
            );
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredClients(filtered);
    };

    const updateUserRole = async (clientId: number, newRole: 'CLIENT' | 'STAFF') => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            await api.put(`/users/${clientId}/role`, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            fetchClients();
        } catch (error: any) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const ClientDetailsModal = ({ client, onClose }: { client: Client; onClose: () => void }) => {
        const stats = clientStats[client.id] || { totalRentals: 0, totalSpent: 0, activeRentals: 0 };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Client Details
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Eye className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p className="text-sm text-gray-900">
                                    {client.firstName} {client.lastName}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <p className="text-sm text-gray-900">{client.username}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-sm text-gray-900">{client.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-sm text-gray-900">{client.phone || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    client.role === 'STAFF'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {client.role === 'STAFF' ? <Shield className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                                    {client.role}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                                <p className="text-sm text-gray-900">{formatDate(client.createdAt)}</p>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Rental Statistics</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-blue-600">{stats.totalRentals}</p>
                                    <p className="text-xs text-blue-600">Total Rentals</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-green-600">${stats.totalSpent.toFixed(2)}</p>
                                    <p className="text-xs text-green-600">Total Spent</p>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{stats.activeRentals}</p>
                                    <p className="text-xs text-yellow-600">Active Rentals</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <p className="text-sm font-bold text-gray-600">
                                        {stats.lastRentalDate ? formatDate(stats.lastRentalDate) : 'Never'}
                                    </p>
                                    <p className="text-xs text-gray-600">Last Rental</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                            {client.role === 'CLIENT' ? (
                                <button
                                    onClick={() => {
                                        updateUserRole(client.id, 'STAFF');
                                        onClose();
                                    }}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center justify-center"
                                >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Promote to Staff
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        updateUserRole(client.id, 'CLIENT');
                                        onClose();
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center justify-center"
                                >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Demote to Client
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <AuthGuard requireAuth={true} requireStaff={true}>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="flex items-center justify-center pt-20">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-construction-orange/30 border-t-construction-orange rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading clients...</p>
                        </div>
                    </div>
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard requireAuth={true} requireStaff={true}>
            <div className="min-h-screen bg-gray-50">
                <Navbar />

                <main className="pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <Users className="w-8 h-8 text-construction-orange mr-3" />
                                    Manage Clients
                                </h1>
                                <p className="text-gray-600 mt-2">View and manage all users</p>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, username, or phone..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-orange focus:border-transparent"
                                    />
                                </div>

                                {/* Role Filter */}
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'CLIENT' | 'STAFF')}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-orange focus:border-transparent"
                                    >
                                        <option value="ALL">All Users</option>
                                        <option value="CLIENT">Clients Only</option>
                                        <option value="STAFF">Staff Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100">
                                        <UserCheck className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Clients</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {clients.filter(c => c.role === 'CLIENT').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-purple-100">
                                        <Shield className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Staff Members</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {clients.filter(c => c.role === 'STAFF').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100">
                                        <Calendar className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Active Rentals</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {Object.values(clientStats).reduce((sum, stats) => sum + stats.activeRentals, 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clients Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Users ({filteredClients.length})
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rentals
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Spent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Member Since
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClients.map((client) => {
                                        const stats = clientStats[client.id] || { totalRentals: 0, totalSpent: 0, activeRentals: 0 };
                                        return (
                                            <tr key={client.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-construction-orange flex items-center justify-center">
                                                                    <span className="text-sm font-medium text-white">
                                                                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                                                                    </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {client.firstName} {client.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                @{client.username}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center">
                                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                        {client.email}
                                                    </div>
                                                    {client.phone && (
                                                        <div className="text-sm text-gray-500 flex items-center mt-1">
                                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                            {client.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        client.role === 'STAFF'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {client.role === 'STAFF' ? <Shield className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                                                        {client.role}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{stats.totalRentals}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {stats.activeRentals} active
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${stats.totalSpent.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(client.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClient(client);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="text-construction-orange hover:text-orange-600 mr-3"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>

                                {filteredClients.length === 0 && (
                                    <div className="text-center py-12">
                                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No clients found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Details Modal */}
                {showDetailsModal && selectedClient && (
                    <ClientDetailsModal
                        client={selectedClient}
                        onClose={() => {
                            setShowDetailsModal(false);
                            setSelectedClient(null);
                        }}
                    />
                )}
            </div>
        </AuthGuard>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    Calendar,
    Clock,
    DollarSign,
    User,
    Package,
    Filter,
    Search,
    Eye,
    Edit,
    CheckCircle,
    XCircle,
    AlertCircle,
    HardHat
} from 'lucide-react';

interface RentalEquipment {
    id: number;
    equipment: {
        id: number;
        name: string;
        category: string;
        dailyRate: number;
    };
    dailyRateAtBooking: number;
    daysRented: number;
}

interface Rental {
    id: number;
    startDate: string;
    endDate: string;
    status: 'RESERVED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    totalCost: number;
    notes?: string;
    client: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
    staffMember?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
    rentalEquipment: RentalEquipment[];
    createdAt: string;
}

type StatusFilter = 'ALL' | 'RESERVED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

const statusColors = {
    RESERVED: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800'
};

const statusIcons = {
    RESERVED: Clock,
    CONFIRMED: CheckCircle,
    ACTIVE: AlertCircle,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle
};

export default function ManageRentalsPage() {
    const { user } = useAuth();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchRentals();
    }, []);

    useEffect(() => {
        filterRentals();
    }, [rentals, statusFilter, searchTerm]);

    const fetchRentals = async () => {
        try {
            setLoading(true);
            const response = await api.get<Rental[]>('/rentals');
            setRentals(response.data);
        } catch (error: any) {
            console.error('Error fetching rentals:', error);
            toast.error('Failed to load rentals');
        } finally {
            setLoading(false);
        }
    };

    const filterRentals = () => {
        let filtered = rentals;

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(rental => rental.status === statusFilter);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(rental =>
                rental.client.firstName.toLowerCase().includes(term) ||
                rental.client.lastName.toLowerCase().includes(term) ||
                rental.client.username.toLowerCase().includes(term) ||
                rental.client.email.toLowerCase().includes(term) ||
                rental.rentalEquipment.some(re =>
                    re.equipment.name.toLowerCase().includes(term)
                )
            );
        }

        // Sort by created date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFilteredRentals(filtered);
    };

    const updateRentalStatus = async (rentalId: number, newStatus: string) => {
        try {
            await api.put(`/rentals/${rentalId}/status`, { status: newStatus });
            toast.success(`Rental status updated to ${newStatus}`);
            fetchRentals();
        } catch (error: any) {
            console.error('Error updating rental status:', error);
            toast.error('Failed to update rental status');
        }
    };

    const cancelRental = async (rentalId: number) => {
        if (!confirm('Are you sure you want to cancel this rental?')) return;

        try {
            await api.put(`/rentals/${rentalId}/cancel`);
            toast.success('Rental cancelled successfully');
            fetchRentals();
        } catch (error: any) {
            console.error('Error cancelling rental:', error);
            toast.error('Failed to cancel rental');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDurationInDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getStatusOptions = (currentStatus: string) => {
        const allStatuses = ['RESERVED', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
        return allStatuses.filter(status => status !== currentStatus);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const Icon = statusIcons[status as keyof typeof statusIcons];
        return (
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[status as keyof typeof statusColors]
            }`}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </div>
        );
    };

    const RentalDetailsModal = ({ rental, onClose }: { rental: Rental; onClose: () => void }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Rental Details #{rental.id}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status and Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <StatusBadge status={rental.status} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                            <p className="text-sm text-gray-900">
                                {getDurationInDays(rental.startDate, rental.endDate)} days
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <p className="text-sm text-gray-900">{formatDate(rental.startDate)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <p className="text-sm text-gray-900">{formatDate(rental.endDate)}</p>
                        </div>
                    </div>

                    {/* Client Information */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-medium text-gray-900">
                                {rental.client.firstName} {rental.client.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{rental.client.email}</p>
                            {rental.client.phone && (
                                <p className="text-sm text-gray-600">{rental.client.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Equipment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                        <div className="space-y-2">
                            {rental.rentalEquipment.map((re, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{re.equipment.name}</p>
                                            <p className="text-sm text-gray-600">{re.equipment.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                ${re.dailyRateAtBooking}/day
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {re.daysRented} days
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Cost */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">Total Cost:</span>
                            <span className="text-xl font-bold text-blue-600">
                                ${rental.totalCost.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Notes */}
                    {rental.notes && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                {rental.notes}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    updateRentalStatus(rental.id, e.target.value);
                                    onClose();
                                }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            defaultValue=""
                        >
                            <option value="">Update Status</option>
                            {getStatusOptions(rental.status).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>

                        {rental.status !== 'CANCELLED' && rental.status !== 'COMPLETED' && (
                            <button
                                onClick={() => {
                                    cancelRental(rental.id);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                            >
                                Cancel Rental
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <AuthGuard requireAuth={true} requireStaff={true}>
                <div className="min-h-screen bg-gray-50">
                    <Navbar />
                    <div className="flex items-center justify-center pt-20">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-construction-orange/30 border-t-construction-orange rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading rentals...</p>
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
                                    <Calendar className="w-8 h-8 text-construction-orange mr-3" />
                                    Manage Rentals
                                </h1>
                                <p className="text-gray-600 mt-2">Oversee all equipment rentals</p>
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
                                        placeholder="Search by client name, email, or equipment..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-orange focus:border-transparent"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-orange focus:border-transparent"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="RESERVED">Reserved</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Reserved</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {rentals.filter(r => r.status === 'RESERVED').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Active</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {rentals.filter(r => ['CONFIRMED', 'ACTIVE'].includes(r.status)).length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-gray-100">
                                        <CheckCircle className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Completed</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {rentals.filter(r => r.status === 'COMPLETED').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ${rentals.reduce((sum, r) => sum + r.totalCost, 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rentals Table */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Rentals ({filteredRentals.length})
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rental ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Equipment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Cost
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{rental.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {rental.client.firstName} {rental.client.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{rental.client.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {rental.rentalEquipment.length} item{rental.rentalEquipment.length > 1 ? 's' : ''}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {rental.rentalEquipment[0]?.equipment.name}
                                                    {rental.rentalEquipment.length > 1 && ` +${rental.rentalEquipment.length - 1} more`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {getDurationInDays(rental.startDate, rental.endDate)} days
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(rental.startDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={rental.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${rental.totalCost.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRental(rental);
                                                        setShowDetailsModal(true);
                                                    }}
                                                    className="text-construction-orange hover:text-orange-600"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>

                                {filteredRentals.length === 0 && (
                                    <div className="text-center py-12">
                                        <HardHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No rentals found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Details Modal */}
                {showDetailsModal && selectedRental && (
                    <RentalDetailsModal
                        rental={selectedRental}
                        onClose={() => {
                            setShowDetailsModal(false);
                            setSelectedRental(null);
                        }}
                    />
                )}
            </div>
        </AuthGuard>
    );
}
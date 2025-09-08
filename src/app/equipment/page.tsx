'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Equipment, EquipmentCategory } from '@/lib/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import EquipmentCard from '@/components/EquipmentCard';
import { Search, Filter, HardHat, X } from 'lucide-react';

export default function EquipmentPage() {
    const { user, loading: authLoading } = useAuth();
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [categories, setCategories] = useState<EquipmentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [availableOnly, setAvailableOnly] = useState(true);

    useEffect(() => {
        fetchEquipment();
        fetchCategories();
    }, []);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await api.get<Equipment[]>('/equipment');
            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get<EquipmentCategory[]>('/equipment/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Filter equipment based on search and filters
    const filteredEquipment = equipment.filter((item) => {
        // Search filter
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchesCategory = !selectedCategory || item.category.id.toString() === selectedCategory;

        // Price filter
        const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
        const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        const matchesPrice = item.dailyRate >= minPrice && item.dailyRate <= maxPrice;

        // Availability filter
        const matchesAvailability = !availableOnly || item.available;

        return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
        setAvailableOnly(true);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading equipment...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-padding pt-20 pb-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Equipment Catalog
                        </h1>
                        <p className="text-gray-600">
                            Browse our collection of professional construction equipment
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="card mb-8">
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search equipment..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input-field pl-10"
                                />
                            </div>

                            {/* Filter Toggle */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <Filter className="w-4 h-4" />
                                    <span>Filters</span>
                                </button>

                                {(selectedCategory || priceRange.min || priceRange.max || !availableOnly) && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-construction-orange hover:text-orange-600 flex items-center space-x-1"
                                    >
                                        <X className="w-4 h-4" />
                                        <span>Clear Filters</span>
                                    </button>
                                )}
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <div className="border-t pt-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Category Filter */}
                                        <div>
                                            <label className="label">Category</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="input-field"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Price Range */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="label">Min Price ($/day)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={priceRange.min}
                                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Max Price ($/day)</label>
                                                <input
                                                    type="number"
                                                    placeholder="1000"
                                                    value={priceRange.max}
                                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                                    className="input-field"
                                                />
                                            </div>
                                        </div>

                                        {/* Availability Filter */}
                                        <div>
                                            <label className="label">Availability</label>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <input
                                                    type="checkbox"
                                                    id="availableOnly"
                                                    checked={availableOnly}
                                                    onChange={(e) => setAvailableOnly(e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor="availableOnly" className="text-sm text-gray-700">
                                                    Show available only
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-gray-600">
                            Found {filteredEquipment.length} equipment item{filteredEquipment.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Equipment Grid */}
                    {filteredEquipment.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredEquipment.map((item) => (
                                <EquipmentCard
                                    key={item.id}
                                    equipment={item}
                                    showBookButton={user ? true : false}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                                <HardHat className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No equipment found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your filters or search terms
                            </p>
                            <button
                                onClick={clearFilters}
                                className="btn-primary"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Call to Action for Non-authenticated Users */}
                    {!user && (
                        <div className="card mt-12 text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Ready to rent equipment?
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Create an account to start booking professional construction equipment
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <a href="/register" className="btn-primary">
                                    Get Started
                                </a>
                                <a href="/login" className="btn-secondary">
                                    Sign In
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
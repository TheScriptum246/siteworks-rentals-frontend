'use client';

import { Equipment, EquipmentCardProps } from '@/lib/types';
import { HardHat, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function EquipmentCard({
                                          equipment,
                                          onSelect,
                                          selected = false,
                                          showBookButton = true
                                      }: EquipmentCardProps) {

    const handleCardClick = () => {
        if (onSelect) {
            onSelect(equipment);
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

    return (
        <div
            className={`equipment-card ${selected ? 'selected' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
            onClick={handleCardClick}
        >
            {/* Equipment Image */}
            <div className="relative h-48 bg-gray-100">
                {equipment.imageUrl ? (
                    <Image
                        src={equipment.imageUrl}
                        alt={equipment.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <HardHat className="w-16 h-16 text-gray-400" />
                    </div>
                )}

                {/* Availability Badge */}
                <div className="absolute top-2 right-2">
                    {equipment.available ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unavailable
                        </span>
                    )}
                </div>

                {/* Selection Indicator */}
                {selected && (
                    <div className="absolute top-2 left-2">
                        <div className="bg-construction-orange text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Equipment Details */}
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {equipment.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {equipment.category.name}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {equipment.description}
                </p>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Daily Rate:</span>
                        <span className="font-semibold text-construction-orange">
                            {formatPrice(equipment.dailyRate)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Weekly Rate:</span>
                        <span className="font-semibold text-gray-900">
                            {formatPrice(equipment.weeklyRate)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monthly Rate:</span>
                        <span className="font-semibold text-gray-900">
                            {formatPrice(equipment.monthlyRate)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link
                        href={`/equipment/${equipment.id}`}
                        className="flex-1 btn-secondary text-center text-sm py-2"
                    >
                        View Details
                    </Link>

                    {showBookButton && equipment.available && (
                        <Link
                            href={`/booking?equipment=${equipment.id}`}
                            className="flex-1 btn-primary text-center text-sm py-2"
                        >
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Book Now
                        </Link>
                    )}
                </div>

                {/* Additional Info */}
                {equipment.specifications && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <details className="text-sm">
                            <summary className="text-gray-600 cursor-pointer hover:text-gray-900">
                                Specifications
                            </summary>
                            <div className="mt-2 text-gray-700">
                                {equipment.specifications}
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
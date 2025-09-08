'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/context/AuthContext';
import { BookingFormData, Equipment } from '@/lib/types';
import { bookingSchema } from '@/lib/schemas';
import api from '@/lib/api';
import { Calendar, Plus, Minus, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface BookingFormProps {
    preSelectedEquipmentId?: number;
}

interface EquipmentSelection {
    equipment: Equipment;
    quantity: number;
}

export default function BookingForm({ preSelectedEquipmentId }: BookingFormProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentSelection[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [calculatedTotal, setCalculatedTotal] = useState(0);
    const [rentalDays, setRentalDays] = useState(0);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        setValue,
    } = useForm<BookingFormData>({
        resolver: yupResolver(bookingSchema) as any,
    });

    const startDate = watch('startDate');
    const endDate = watch('endDate');

    useEffect(() => {
        fetchEquipment();
    }, []);

    useEffect(() => {
        if (preSelectedEquipmentId && equipment.length > 0) {
            const preSelected = equipment.find(eq => eq.id === preSelectedEquipmentId);
            if (preSelected && preSelected.available) {
                addEquipmentToSelection(preSelected);
            }
        }
    }, [preSelectedEquipmentId, equipment]);

    useEffect(() => {
        calculateTotal();
    }, [selectedEquipment, startDate, endDate]);

    const fetchEquipment = async () => {
        try {
            const response = await api.get<Equipment[]>('/equipment?available=true');
            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
            toast.error('Failed to load equipment');
        }
    };

    const calculateTotal = () => {
        if (!startDate || !endDate) {
            setCalculatedTotal(0);
            setRentalDays(0);
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        if (days <= 0) {
            setCalculatedTotal(0);
            setRentalDays(0);
            return;
        }

        setRentalDays(days);

        let total = 0;
        selectedEquipment.forEach(({ equipment, quantity }) => {
            let rate = equipment.dailyRate;

            // Apply discounts for longer rentals
            if (days >= 30) {
                rate = equipment.monthlyRate / 30; // Monthly rate per day
            } else if (days >= 7) {
                rate = equipment.weeklyRate / 7; // Weekly rate per day
            }

            total += rate * quantity * days;
        });

        setCalculatedTotal(total);
    };

    const addEquipmentToSelection = (equipment: Equipment) => {
        const existing = selectedEquipment.find(item => item.equipment.id === equipment.id);
        if (existing) {
            updateEquipmentQuantity(equipment.id, existing.quantity + 1);
        } else {
            setSelectedEquipment([...selectedEquipment, { equipment, quantity: 1 }]);
        }
    };

    const updateEquipmentQuantity = (equipmentId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeEquipmentFromSelection(equipmentId);
            return;
        }

        setSelectedEquipment(prev =>
            prev.map(item =>
                item.equipment.id === equipmentId
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    const removeEquipmentFromSelection = (equipmentId: number) => {
        setSelectedEquipment(prev =>
            prev.filter(item => item.equipment.id !== equipmentId)
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };


    const onSubmit = async (data: BookingFormData) => {
        if (selectedEquipment.length === 0) {
            toast.error('Please select at least one equipment item');
            return;
        }

        try {
            setIsLoading(true);

            // Convert dates to LocalDateTime format (no Z suffix for backend)
            const startDate = data.startDate + 'T00:00:00';
            const endDate = data.endDate + 'T23:59:59';

            // Create the request data matching the backend DTO
            const bookingData = {
                startDate: startDate,
                endDate: endDate,
                notes: data.notes || '',
                // Backend expects equipmentIds as List<Long>, not equipmentSelections
                equipmentIds: selectedEquipment.map(({ equipment }) => equipment.id)
            };

            console.log('📝 Sending booking data:', bookingData); // Debug log

            const response = await api.post('/rentals', bookingData);

            console.log('✅ Booking successful:', response.data); // Debug log

            toast.success('Rental booked successfully!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('❌ Booking error:', error);
            console.error('❌ Error response:', error.response?.data); // More detailed error log

            const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMinEndDate = () => {
        if (!startDate) return getTodayDate();
        const start = new Date(startDate);
        start.setDate(start.getDate() + 1);
        return start.toISOString().split('T')[0];
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Date Selection */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Rental Period</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startDate" className="label">
                                Start Date *
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                min={getTodayDate()}
                                {...register('startDate')}
                                className={`input-field ${errors.startDate ? 'input-error' : ''}`}
                                disabled={isLoading}
                            />
                            {errors.startDate && (
                                <p className="error-message">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="endDate" className="label">
                                End Date *
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                min={getMinEndDate()}
                                {...register('endDate')}
                                className={`input-field ${errors.endDate ? 'input-error' : ''}`}
                                disabled={isLoading}
                            />
                            {errors.endDate && (
                                <p className="error-message">{errors.endDate.message}</p>
                            )}
                        </div>
                    </div>

                    {rentalDays > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-800 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Rental Duration: {rentalDays} day{rentalDays !== 1 ? 's' : ''}
                                {rentalDays >= 7 && (
                                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        Weekly discount applied
                                    </span>
                                )}
                                {rentalDays >= 30 && (
                                    <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        Monthly discount applied
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>

                {/* Equipment Selection */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Equipment</h2>

                    {/* Available Equipment */}
                    <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Equipment</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                            {equipment.map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:border-construction-orange cursor-pointer transition-colors"
                                    onClick={() => addEquipmentToSelection(item)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-600">{item.category.name}</p>
                                            <p className="text-sm font-semibold text-construction-orange">
                                                {formatPrice(item.dailyRate)}/day
                                            </p>
                                        </div>
                                        <Plus className="w-5 h-5 text-construction-orange" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Equipment */}
                    {selectedEquipment.length > 0 && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Equipment</h3>
                            <div className="space-y-3">
                                {selectedEquipment.map(({ equipment, quantity }) => (
                                    <div key={equipment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                                            <p className="text-sm text-gray-600">{equipment.category.name}</p>
                                            <p className="text-sm font-semibold text-construction-orange">
                                                {formatPrice(equipment.dailyRate)}/day each
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => updateEquipmentQuantity(equipment.id, quantity - 1)}
                                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                                                disabled={isLoading}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-semibold w-8 text-center">{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => updateEquipmentQuantity(equipment.id, quantity + 1)}
                                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                                                disabled={isLoading}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeEquipmentFromSelection(equipment.id)}
                                                className="text-red-600 hover:text-red-800 ml-2"
                                                disabled={isLoading}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Notes</h2>
                    <div>
                        <label htmlFor="notes" className="label">
                            Special Requirements or Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            rows={4}
                            {...register('notes')}
                            className={`input-field ${errors.notes ? 'input-error' : ''}`}
                            placeholder="Any special requirements, delivery instructions, or additional notes..."
                            disabled={isLoading}
                        />
                        {errors.notes && (
                            <p className="error-message">{errors.notes.message}</p>
                        )}
                    </div>
                </div>

                {/* Order Summary */}
                {selectedEquipment.length > 0 && startDate && endDate && (
                    <div className="card bg-gray-50 border-2 border-construction-orange">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Calculator className="w-5 h-5 mr-2" />
                            Order Summary
                        </h2>

                        <div className="space-y-3">
                            {selectedEquipment.map(({ equipment, quantity }) => {
                                let rate = equipment.dailyRate;
                                if (rentalDays >= 30) rate = equipment.monthlyRate / 30;
                                else if (rentalDays >= 7) rate = equipment.weeklyRate / 7;

                                const subtotal = rate * quantity * rentalDays;

                                return (
                                    <div key={equipment.id} className="flex justify-between">
                                        <span>{equipment.name} × {quantity} × {rentalDays} days</span>
                                        <span className="font-semibold">{formatPrice(subtotal)}</span>
                                    </div>
                                );
                            })}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-construction-orange">{formatPrice(calculatedTotal)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Final pricing will be confirmed upon approval. Additional fees may apply for delivery or special services.
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="card">
                    <button
                        type="submit"
                        disabled={isLoading || selectedEquipment.length === 0 || !startDate || !endDate}
                        className="w-full btn-primary flex items-center justify-center space-x-2 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="loading-spinner w-5 h-5" />
                        ) : (
                            <CheckCircle className="w-5 h-5" />
                        )}
                        <span>
                            {isLoading ? 'Creating Booking...' : 'Submit Rental Request'}
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
}
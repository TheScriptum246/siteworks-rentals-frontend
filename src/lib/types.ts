// User and Authentication Types
export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    roles: Role[];
    createdAt: string;
}

export interface Role {
    id: number;
    name: 'ROLE_CLIENT' | 'ROLE_STAFF';
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;  // Make this optional to match RegisterFormData
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
}

// Equipment Types
export interface Equipment {
    id: number;
    name: string;
    description: string;
    category: EquipmentCategory;
    dailyRate: number;
    status: EquipmentStatus;
    manufacturer: string;
    model: string;
    year: number;
    serialNumber: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EquipmentCategory {
    id: number;
    name: string;
    description: string;
}

export type EquipmentStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

// Rental Types
export interface Rental {
    id: number;
    client: User;
    startDate: string;
    endDate: string;
    totalAmount: number;
    status: RentalStatus;
    rentalEquipment: RentalEquipment[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RentalEquipment {
    id: number;
    equipment: Equipment;
    dailyRateAtBooking: number;
    daysRented: number;
}

export type RentalStatus = 'RESERVED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface CreateRentalRequest {
    equipmentIds: number[];
    startDate: string;
    endDate: string;
    notes?: string;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export interface MessageResponse {
    message: string;
}

// Form Types using Yup (instead of Zod to match makeup salon project)
export interface LoginFormData {
    username: string;
    password: string;
}

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
}

export interface BookingFormData {
    equipmentId: number;
    startDate: string;
    endDate: string;
    notes?: string;
}
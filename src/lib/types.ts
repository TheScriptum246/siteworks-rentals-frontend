// User types - simplified to match backend exactly
import {boolean} from "yup";

export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    roles: string[];
    createdAt: string;
}

// Equipment types
export type EquipmentCategory =
    | 'EXCAVATORS'
    | 'BULLDOZERS'
    | 'CRANES'
    | 'COMPACTORS'
    | 'GENERATORS'
    | 'SCAFFOLDING'
    | 'TOOLS';


export interface Equipment {
    monthlyRate: number;
    id: number;
    name: string;
    description: string;
    category: EquipmentCategory;
    dailyRate: number;
    weeklyRate: number;
    available: boolean;
    imageUrl?: string;
    specifications?: string;
    createdAt: string;
}

// Rental types
export interface RentalStatus {
    RESERVED: 'RESERVED';
    CONFIRMED: 'CONFIRMED';
    ACTIVE: 'ACTIVE';
    COMPLETED: 'COMPLETED';
    CANCELLED: 'CANCELLED';
}

export interface RentalEquipment {
    id: number;
    equipment: Equipment;
    quantity: number;
    dailyRate: number;
    totalDays: number;
    subtotal: number;
}

export interface Rental {
    id: number;
    client: User;
    staffMember?: User;
    startDate: string;
    endDate: string;
    status: keyof RentalStatus;
    totalAmount: number;
    notes?: string;
    rentalEquipment: RentalEquipment[];
    createdAt: string;
    updatedAt: string;
}

// Auth request/response types
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
    phone?: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[]; // Array of role strings like ["ROLE_CLIENT"]
}

// API response types
export interface MessageResponse {
    message: string;
}

export interface ApiError {
    message: string;
    details?: string[];
}

// Form types
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
    phone?: string;
}

export interface BookingFormData {
    startDate: string;
    endDate: string;
    equipmentSelections: {
        equipmentId: number;
        quantity: number;
    }[];
    notes?: string;
}

// Context types
export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
    isClient: boolean;
    isStaff: boolean;
}

// Component prop types
export interface EquipmentCardProps {
    equipment: Equipment,
    onSelect?: (equipment: Equipment) => void,
    selected?: boolean,
    showBookButton?: boolean
}
// User types - updated to match backend exactly
export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'CLIENT' | 'STAFF';
    createdAt: string;
    updatedAt?: string;
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
    id: number;
    name: string;
    description: string;
    category: EquipmentCategory;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    available: boolean;
    imageUrl?: string;
    specifications?: string;
    createdAt: string;
}

// Rental types
export type RentalStatus = 'RESERVED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

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
    status: RentalStatus;
    totalAmount: number;
    totalCost: number; // Backend uses totalCost
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

// Backend sends different response format
export interface AuthResponse {
    token?: string;        // Some responses use 'token'
    accessToken?: string;  // Some responses use 'accessToken'
    refreshToken: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[]; // Array of role strings like ["ROLE_CLIENT", "ROLE_STAFF"]
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
    refreshUserData: () => Promise<void>;
}

// Updated to match backend UserInfoResponse
export interface UserInfoResponse {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: 'CLIENT' | 'STAFF';
    roles: string[]; // Include roles array for compatibility
    createdAt: string;
}

// Component prop types
export interface EquipmentCardProps {
    equipment: Equipment;
    onSelect?: (equipment: Equipment, quantity: number) => void;
}

export interface RentalCardProps {
    rental: Rental;
    onStatusChange?: (rental: Rental, newStatus: RentalStatus) => void;
}

// Update profile request
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
}

// Change password request
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
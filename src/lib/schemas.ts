import * as yup from 'yup';

// Login form validation schema
export const loginSchema = yup.object({
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

// Register form validation schema
export const registerSchema = yup.object({
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: yup
        .string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .matches(/(?=.*\d)/, 'Password must contain at least one number'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Booking form validation schema (we'll use this later)
export const bookingSchema = yup.object({
    equipmentId: yup
        .number()
        .required('Please select equipment')
        .positive('Invalid equipment selection'),
    startDate: yup
        .string()
        .required('Start date is required'),
    endDate: yup
        .string()
        .required('End date is required'),
    notes: yup
        .string()
        .optional()
        .max(500, 'Notes must be less than 500 characters'),
});
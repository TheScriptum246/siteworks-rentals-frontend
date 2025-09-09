import * as yup from 'yup';

// Login schema
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

// Register schema
export const registerSchema = yup.object({
    username: yup
        .string()
        .required('Username is required')
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be less than 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match'),
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    phone: yup
        .string()
        .notRequired()
        .transform((value) => value === '' ? undefined : value)
        .test('phone-format', 'Please enter a valid phone number', function(value) {
            if (!value) return true;
            return /^[\+]?[1-9][\d]{0,15}$/.test(value);
        }),
});

// Booking schema
export const bookingSchema = yup.object({
    startDate: yup
        .string()
        .required('Start date is required')
        .test('future-date', 'Start date must be in the future', function(value) {
            if (!value) return false;
            const startDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return startDate >= today;
        }),
    endDate: yup
        .string()
        .required('End date is required')
        .test('after-start', 'End date must be after start date', function(value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return false;
            return new Date(value) > new Date(startDate);
        }),
    equipmentSelections: yup
        .array()
        .of(
            yup.object({
                equipmentId: yup.number().required(),
                quantity: yup.number().min(1, 'Quantity must be at least 1').required(),
            })
        )
        .min(1, 'Please select at least one equipment item'),
    notes: yup
        .string()
        .optional()
        .max(500, 'Notes must be less than 500 characters'),
});

// Equipment filter schema
export const equipmentFilterSchema = yup.object({
    search: yup.string().optional(),
    category: yup.string().optional(),
    minPrice: yup.number().min(0, 'Minimum price must be 0 or greater').optional(),
    maxPrice: yup.number().min(0, 'Maximum price must be 0 or greater').optional(),
    available: yup.boolean().optional(),
});

// Profile update schema
export const profileUpdateSchema = yup.object({
    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters'),
    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters'),
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    phone: yup
        .string()
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
});

// Password change schema
export const passwordChangeSchema = yup.object({
    currentPassword: yup
        .string()
        .required('Current password is required'),
    newPassword: yup
        .string()
        .required('New password is required')
        .min(6, 'Password must be at least 6 characters')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmNewPassword: yup
        .string()
        .required('Please confirm your new password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});
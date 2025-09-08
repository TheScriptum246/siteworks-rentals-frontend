'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/context/AuthContext';
import { RegisterFormData } from '@/lib/types';
import { registerSchema } from '@/lib/schemas';
import { Eye, EyeOff, UserPlus, Loader2, HardHat } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const { register: registerUser } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema) as any,
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setIsLoading(true);
            await registerUser({
                username: data.username,
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            });
            // Redirect to login page after successful registration
            router.push('/login');
        } catch (error) {
            // Error handling is done in auth context with toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="card fade-in">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-construction-orange p-3 rounded-full">
                            <HardHat className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join SiteWorks Rentals today</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="label">
                                First Name *
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                {...register('firstName')}
                                className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                                placeholder="John"
                                disabled={isLoading}
                            />
                            {errors.firstName && (
                                <p className="error-message">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="lastName" className="label">
                                Last Name *
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                {...register('lastName')}
                                className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                                placeholder="Doe"
                                disabled={isLoading}
                            />
                            {errors.lastName && (
                                <p className="error-message">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="label">
                            Username *
                        </label>
                        <input
                            id="username"
                            type="text"
                            {...register('username')}
                            className={`input-field ${errors.username ? 'input-error' : ''}`}
                            placeholder="johndoe"
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <p className="error-message">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="label">
                            Email Address *
                        </label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={`input-field ${errors.email ? 'input-error' : ''}`}
                            placeholder="john@example.com"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="error-message">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label htmlFor="phone" className="label">
                            Phone Number (Optional)
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            {...register('phone')}
                            className={`input-field ${errors.phone ? 'input-error' : ''}`}
                            placeholder="+1 (555) 123-4567"
                            disabled={isLoading}
                        />
                        {errors.phone && (
                            <p className="error-message">{errors.phone.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="label">
                            Password *
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                                placeholder="Create a strong password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="error-message">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="label">
                            Confirm Password *
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                className={`input-field pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                                placeholder="Confirm your password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="error-message">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="text-sm text-gray-600">
                        By creating an account, you agree to our{' '}
                        <Link href="/terms" className="text-construction-orange hover:text-orange-600">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-construction-orange hover:text-orange-600">
                            Privacy Policy
                        </Link>
                        .
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <UserPlus className="w-5 h-5" />
                        )}
                        <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-construction-orange hover:text-orange-600 font-medium transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
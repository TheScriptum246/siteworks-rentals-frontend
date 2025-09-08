'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/context/AuthContext';
import {LoginFormData, LoginRequest} from '@/lib/types';
import { loginSchema } from '@/lib/schemas';
import { Eye, EyeOff, LogIn, Loader2, HardHat } from 'lucide-react';
import Link from 'next/link';
import toast from "react-hot-toast";

export default function LoginForm() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    const onSubmit = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            await login(data);
            toast.success('Login successful!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your SiteWorks account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username Field */}
                    <div>
                        <label htmlFor="username" className="label">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            {...register('username')}
                            className={`input-field ${errors.username ? 'input-error' : ''}`}
                            placeholder="Enter your username"
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <p className="error-message">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className={`input-field pr-10 ${errors.password ? 'input-error' : ''}`}
                                placeholder="Enter your password"
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <LogIn className="w-5 h-5" />
                        )}
                        <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-construction-orange hover:text-orange-600 font-medium transition-colors"
                        >
                            Create one here
                        </Link>
                    </p>
                    <p className="mt-2">
                        <Link
                            href="/forgot-password"
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
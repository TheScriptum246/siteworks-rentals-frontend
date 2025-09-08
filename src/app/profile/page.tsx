'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';
import {
    User as UserIcon,
    Mail,
    Phone,
    Calendar,
    Edit3,
    Save,
    X,
    Shield,
    Key,
    MapPin,
    Building
} from 'lucide-react';

interface UpdateProfileRequest {
    firstName: string;
    lastName: string;
    phone?: string;
}

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [profileData, setProfileData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [editForm, setEditForm] = useState<UpdateProfileRequest>({
        firstName: '',
        lastName: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState<ChangePasswordRequest>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await api.get<User>('/users/profile');
            setProfileData(response.data);
            setEditForm({
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                phone: response.data.phone || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            const response = await api.put<User>('/users/profile', editForm);

            setProfileData(response.data);
            setEditing(false);
            toast.success('Profile updated successfully!');

        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        try {
            setSaving(true);

            await api.put('/users/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setChangingPassword(false);
            toast.success('Password changed successfully!');

        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditForm({
            firstName: profileData?.firstName || '',
            lastName: profileData?.lastName || '',
            phone: profileData?.phone || ''
        });
        setEditing(false);
    };

    const cancelPasswordChange = () => {
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setChangingPassword(false);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center pt-20">
                    <div className="text-center">
                        <div className="loading-spinner mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container-padding pt-20">
                    <div className="card text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
                        <p className="text-gray-600">Unable to load your profile information.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="container-padding pt-20 pb-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            My Profile
                        </h1>
                        <p className="text-gray-600">
                            Manage your account information and preferences
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Info Card */}
                        <div className="lg:col-span-2">
                            <div className="card">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Profile Information
                                    </h2>
                                    {!editing && (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="btn-secondary flex items-center space-x-2"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            <span>Edit</span>
                                        </button>
                                    )}
                                </div>

                                {editing ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">First Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.firstName}
                                                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                                    className="input-field"
                                                    placeholder="Enter your first name"
                                                />
                                            </div>
                                            <div>
                                                <label className="label">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.lastName}
                                                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                                    className="input-field"
                                                    placeholder="Enter your last name"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="input-field"
                                                placeholder="Enter your phone number"
                                            />
                                        </div>

                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="btn-primary flex items-center space-x-2"
                                            >
                                                {saving ? (
                                                    <div className="loading-spinner w-4 h-4" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                disabled={saving}
                                                className="btn-secondary flex items-center space-x-2"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-center space-x-3">
                                                <UserIcon className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Full Name</p>
                                                    <p className="font-medium text-gray-900">
                                                        {profileData.firstName} {profileData.lastName}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="font-medium text-gray-900">{profileData.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <p className="font-medium text-gray-900">
                                                        {profileData.phone || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Shield className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Account Type</p>
                                                    <p className="font-medium text-gray-900">
                                                        {user?.roles?.includes('ROLE_STAFF') ? 'Staff Member' : 'Client'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Member Since</p>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(profileData.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <Building className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Username</p>
                                                    <p className="font-medium text-gray-900">{profileData.username}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="space-y-6">
                            <div className="card">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Security
                                    </h2>
                                    {!changingPassword && (
                                        <button
                                            onClick={() => setChangingPassword(true)}
                                            className="btn-secondary flex items-center space-x-2 h-12"
                                        >
                                            <Key className="w-4 h-4" />
                                            <span>Change Password</span>
                                        </button>
                                    )}
                                </div>

                                {changingPassword ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({
                                                    ...passwordForm,
                                                    currentPassword: e.target.value
                                                })}
                                                className="input-field"
                                                placeholder="Enter current password"
                                            />
                                        </div>

                                        <div>
                                            <label className="label">New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({
                                                    ...passwordForm,
                                                    newPassword: e.target.value
                                                })}
                                                className="input-field"
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div>
                                            <label className="label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({
                                                    ...passwordForm,
                                                    confirmPassword: e.target.value
                                                })}
                                                className="input-field"
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <button
                                                onClick={handleChangePassword}
                                                disabled={saving}
                                                className="btn-primary flex items-center justify-center space-x-2"
                                            >
                                                {saving ? (
                                                    <div className="loading-spinner w-4 h-4" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                <span>{saving ? 'Changing...' : 'Change Password'}</span>
                                            </button>
                                            <button
                                                onClick={cancelPasswordChange}
                                                disabled={saving}
                                                className="btn-secondary flex items-center justify-center space-x-2"
                                            >
                                                <X className="w-4 h-4" />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <Key className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-sm text-gray-500">Password</p>
                                                <p className="font-medium text-gray-900">••••••••</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Keep your account secure by using a strong password and changing it regularly.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
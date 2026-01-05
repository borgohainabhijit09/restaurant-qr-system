'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User } from 'lucide-react';
import { authenticateStaff } from '@/app/actions/auth';
import { Role } from '@/lib/types';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const [staffId, setStaffId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await authenticateStaff(staffId, pin);

        if (result.success && result.staff) {
            if (result.staff.role !== Role.ADMIN) {
                setError('Access denied. Admin credentials required.');
                setLoading(false);
                return;
            }

            // Store in session storage
            sessionStorage.setItem('admin', JSON.stringify(result.staff));
            router.push('/admin/dashboard');
        } else {
            setError(result.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h1>
                    <p className="text-slate-600">Full system access</p>
                </div>

                {/* Login Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="staffId" className="label">
                                <User className="w-4 h-4 inline mr-2" />
                                Admin ID
                            </label>
                            <input
                                id="staffId"
                                type="text"
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                                placeholder="e.g., ADMIN001"
                                className="input"
                                required
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="pin" className="label">
                                <Lock className="w-4 h-4 inline mr-2" />
                                PIN
                            </label>
                            <input
                                id="pin"
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                placeholder="Enter your 4-digit PIN"
                                maxLength={4}
                                className="input"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Demo Credentials:</p>
                        <div className="text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-700 font-medium">Admin:</span>
                                <code className="bg-slate-100 px-2 py-1 rounded text-slate-900 font-mono">ADMIN001 / 1234</code>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

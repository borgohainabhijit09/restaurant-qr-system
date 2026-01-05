'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Lock, User } from 'lucide-react';
import { authenticateStaff } from '@/app/actions/auth';
import { Role } from '@/lib/types';
import Link from 'next/link';

export default function KitchenLoginPage() {
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
            // Allow Kitchen staff or Admin
            if (result.staff.role !== Role.KITCHEN && result.staff.role !== Role.ADMIN) {
                setError('Access denied. Kitchen credentials required.');
                setLoading(false);
                return;
            }

            // Store in session storage
            sessionStorage.setItem('kitchen', JSON.stringify(result.staff));
            router.push('/kitchen/dashboard');
        } else {
            setError(result.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <ChefHat className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Kitchen Login</h1>
                    <p className="text-slate-600">Enter your credentials to continue</p>
                </div>

                {/* Login Form */}
                <div className="card border-t-4 border-t-orange-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="staffId" className="label">
                                <User className="w-4 h-4 inline mr-2" />
                                Staff ID
                            </label>
                            <input
                                id="staffId"
                                type="text"
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                                placeholder="e.g., K001"
                                className="input focus:ring-orange-500"
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
                                className="input focus:ring-orange-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn bg-orange-600 hover:bg-orange-700 text-white border-transparent"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="text-center text-sm text-slate-500">
                            <p className="mb-2">Demo Credentials:</p>
                            <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">ID: K001 / PIN: 3333</code>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link href="/" className="text-slate-500 hover:text-orange-600 text-sm transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

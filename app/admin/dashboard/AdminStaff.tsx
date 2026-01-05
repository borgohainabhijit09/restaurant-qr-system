'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, User, Key } from 'lucide-react';
import { Role } from '@/lib/types';
import { getAllStaff, upsertStaff, deleteStaff } from '@/app/actions/admin-management';

export default function AdminStaff() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        staffId: '',
        name: '',
        pin: '',
        role: Role.WAITER
    });

    const loadData = async () => {
        setLoading(true);
        const data = await getAllStaff();
        setStaff(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = () => {
        setForm({ staffId: '', name: '', pin: '', role: Role.WAITER });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.staffId || !form.name || !form.pin) return;
        setLoading(true);

        const res = await upsertStaff({
            staffId: form.staffId,
            name: form.name,
            pin: form.pin,
            role: form.role
        });

        if (!res.success) alert(res.error);

        await loadData();
        setShowModal(false);
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Remove ${name}? They will no longer be able to log in.`)) return;
        setLoading(true);
        const res = await deleteStaff(id);
        if (!res.success) alert('Failed to delete staff');
        await loadData();
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Staff Management</h2>
                <button onClick={handleAdd} className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Staff
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                        <tr>
                            <th className="p-4">Staff ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {staff.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono font-medium text-slate-900">{s.staffId}</td>
                                <td className="p-4 font-medium text-slate-800">{s.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${s.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {s.role}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {s.role !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleDelete(s.id, s.name)}
                                            className="text-slate-400 hover:text-red-600"
                                            title="Delete Account"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {staff.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-400">
                                    No staff found. Add one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full animate-fade-in">
                        <h3 className="font-bold text-lg mb-4">Add New Staff</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Role</label>
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                    <button
                                        onClick={() => setForm({ ...form, role: Role.WAITER })}
                                        className={`py-2 rounded text-sm font-medium border ${form.role === Role.WAITER ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'}`}
                                    >
                                        Waiter
                                    </button>
                                    <button
                                        onClick={() => setForm({ ...form, role: Role.KITCHEN })}
                                        className={`py-2 rounded text-sm font-medium border ${form.role === Role.KITCHEN ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-slate-200 text-slate-600'}`}
                                    >
                                        Kitchen
                                    </button>
                                    <button
                                        onClick={() => setForm({ ...form, role: Role.ADMIN })}
                                        className={`py-2 rounded text-sm font-medium border ${form.role === Role.ADMIN ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}
                                    >
                                        Admin
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Staff ID (Login)</label>
                                <input
                                    value={form.staffId}
                                    onChange={e => setForm({ ...form, staffId: e.target.value.toUpperCase() })}
                                    placeholder={form.role === Role.WAITER ? "e.g. W005" : form.role === Role.KITCHEN ? "e.g. K001" : "e.g. ADMIN02"}
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 uppercase">Full Name</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    className="input w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">PIN Code</label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    value={form.pin}
                                    onChange={e => setForm({ ...form, pin: e.target.value })}
                                    placeholder="4-digit PIN"
                                    className="input w-full font-mono"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-6">
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                            <button onClick={handleSave} className="btn btn-primary">Create Staff</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

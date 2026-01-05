'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Users, QrCode, LogOut, Coffee } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminMenu from './AdminMenu';
import AdminTables from './AdminTables';
import AdminStaff from './AdminStaff';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [admin, setAdmin] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'tables' | 'staff'>('overview');

    useEffect(() => {
        // Check authentication
        const adminData = sessionStorage.getItem('admin');
        if (!adminData) {
            router.push('/admin/login');
            return;
        }
        setAdmin(JSON.parse(adminData));
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem('admin');
        router.push('/admin/login');
    };

    if (!admin) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    }

    const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === id
                    ? 'bg-purple-100 text-purple-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-purple-700 font-bold text-xl">
                        <Coffee className="w-8 h-8" />
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem id="overview" label="Live Monitor" icon={LayoutDashboard} />
                    <NavItem id="menu" label="Menu Management" icon={UtensilsCrossed} />
                    <NavItem id="tables" label="Tables" icon={QrCode} />
                    <NavItem id="staff" label="Staff" icon={Users} />
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                            {admin.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-slate-800 truncate">{admin.name}</p>
                            <p className="text-xs text-slate-500 truncate">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full btn btn-outline btn-sm text-slate-600"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'overview' && <AdminOverview admin={admin} />}
                    {activeTab === 'menu' && <AdminMenu />}
                    {activeTab === 'tables' && <AdminTables />}
                    {activeTab === 'staff' && <AdminStaff />}
                </div>
            </main>
        </div>
    );
}

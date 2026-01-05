'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Clock, CheckCircle2, LogOut, RefreshCw, AlertCircle, Utensils } from 'lucide-react';
import { getKitchenItems } from '@/app/actions/kitchen';
import { updateOrderItemStatus } from '@/app/actions/orders';
import { OrderItemStatus } from '@/lib/types';
import Link from 'next/link';

export default function KitchenDashboardPage() {
    const router = useRouter();
    const [kitchenStaff, setKitchenStaff] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadItems = useCallback(async () => {
        setRefreshing(true);
        const data = await getKitchenItems();
        setItems(data);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        // Check authentication
        const staffData = sessionStorage.getItem('kitchen');
        if (!staffData) {
            router.push('/kitchen/login');
            return;
        }
        setKitchenStaff(JSON.parse(staffData));
        loadItems();
    }, [router, loadItems]);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadItems();
        }, 10000);
        return () => clearInterval(interval);
    }, [loadItems]);

    const handleLogout = () => {
        sessionStorage.removeItem('kitchen');
        router.push('/kitchen/login');
    };

    const handleUpdateStatus = async (itemId: string, newStatus: OrderItemStatus) => {
        setLoading(true);
        await updateOrderItemStatus(itemId, newStatus);
        await loadItems();
        setLoading(false);
    };

    const getElapsedTime = (dateString: string) => {
        const start = new Date(dateString).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 60000); // minutes
        return diff;
    };

    const addedItems = items.filter(i => i.status === OrderItemStatus.ADDED);
    const preparingItems = items.filter(i => i.status === OrderItemStatus.PREPARING);
    const readyItems = items.filter(i => i.status === OrderItemStatus.READY);

    const ItemCard = ({ item, actionButton }: { item: any, actionButton?: React.ReactNode }) => {
        const mins = getElapsedTime(item.createdAt);
        const isLate = mins > 15;

        return (
            <div className={`p-4 rounded-lg border shadow-sm ${isLate ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                }`}>
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded font-bold">
                        Table {item.order.tableSession.table.tableNumber}
                    </span>
                    <div className="flex items-center text-xs font-medium text-slate-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {mins}m ago
                    </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-1">
                    {item.menuItem.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm font-medium text-slate-600">Qty:</span>
                    <span className="text-xl font-bold text-orange-600">{item.quantity}</span>
                </div>

                {item.notes && (
                    <div className="bg-yellow-50 text-yellow-800 text-sm p-2 rounded mb-3 border border-yellow-100">
                        <span className="font-bold">Note:</span> {item.notes}
                    </div>
                )}

                <div className="flex justify-between items-end mt-2">
                    <div className="text-xs text-slate-400">
                        #{item.order.orderNumber} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {actionButton}
                </div>
            </div>
        );
    };

    if (!kitchenStaff) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-600 p-2 rounded-lg">
                            <ChefHat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Kitchen Display</h1>
                            <p className="text-sm text-slate-500">Active Orders: {items.length}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex gap-6 mr-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-semibold text-slate-700">New ({addedItems.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span className="text-sm font-semibold text-slate-700">Preparing ({preparingItems.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm font-semibold text-slate-700">Ready ({readyItems.length})</span>
                            </div>
                        </div>

                        <button
                            onClick={loadItems}
                            disabled={refreshing}
                            className="btn btn-outline p-2"
                            title="Refresh"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={handleLogout} className="btn btn-secondary text-sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Board */}
            <main className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[1000px] md:min-w-0 h-full">

                        {/* New Orders Column */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-t-lg border-b-2 border-blue-500">
                                <h2 className="font-bold text-blue-900 flex items-center gap-2">
                                    <Utensils className="w-5 h-5" />
                                    New Orders
                                </h2>
                                <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                    {addedItems.length}
                                </span>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-b-lg p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
                                {addedItems.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 italic">No new orders</div>
                                ) : (
                                    addedItems.map(item => (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            actionButton={
                                                <button
                                                    onClick={() => handleUpdateStatus(item.id, OrderItemStatus.PREPARING)}
                                                    disabled={loading}
                                                    className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 w-full mt-2"
                                                >
                                                    Start Preparing
                                                </button>
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Preparing Column */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4 bg-orange-50 p-3 rounded-t-lg border-b-2 border-orange-500">
                                <h2 className="font-bold text-orange-900 flex items-center gap-2">
                                    <ChefHat className="w-5 h-5" />
                                    Preparing
                                </h2>
                                <span className="bg-orange-200 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
                                    {preparingItems.length}
                                </span>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-b-lg p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
                                {preparingItems.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 italic">No items preparing</div>
                                ) : (
                                    preparingItems.map(item => (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            actionButton={
                                                <button
                                                    onClick={() => handleUpdateStatus(item.id, OrderItemStatus.READY)}
                                                    disabled={loading}
                                                    className="btn btn-sm bg-orange-600 text-white hover:bg-orange-700 w-full mt-2"
                                                >
                                                    Mark Ready
                                                </button>
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Ready Column */}
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-4 bg-green-50 p-3 rounded-t-lg border-b-2 border-green-500">
                                <h2 className="font-bold text-green-900 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Ready for Pickup
                                </h2>
                                <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                    {readyItems.length}
                                </span>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-b-lg p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-180px)]">
                                {readyItems.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 italic">No items ready</div>
                                ) : (
                                    readyItems.map(item => (
                                        <ItemCard
                                            key={item.id}
                                            item={item}
                                            actionButton={
                                                <div className="text-center w-full mt-2">
                                                    <span className="text-green-600 text-sm font-bold flex items-center justify-center gap-1">
                                                        <CheckCircle2 className="w-4 h-4" /> Waiting for Waiter
                                                    </span>
                                                </div>
                                            }
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

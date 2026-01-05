'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Grid, List, AlertCircle, Trash2, DollarSign } from 'lucide-react';
import { getAllTables } from '@/app/actions/tables';
import { adminRemoveOrderItem, adminApplyDiscount } from '@/app/actions/orders';
import { TableStatus } from '@/lib/types';

export default function AdminOverview({ admin }: { admin: any }) {
    const [tables, setTables] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showOverrideModal, setShowOverrideModal] = useState(false);
    const [overrideAction, setOverrideAction] = useState<any>(null);
    const [overrideReason, setOverrideReason] = useState('');

    const loadTables = async () => {
        setRefreshing(true);
        const allTables = await getAllTables();
        setTables(allTables);
        setRefreshing(false);
    };

    useEffect(() => {
        loadTables();
        const interval = setInterval(loadTables, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleRemoveItem = (itemId: string) => {
        setOverrideAction({ type: 'remove', itemId });
        setShowOverrideModal(true);
    };

    const handleApplyDiscount = (orderId: string) => {
        setOverrideAction({ type: 'discount', orderId });
        setShowOverrideModal(true);
    };

    const executeOverride = async () => {
        if (!overrideReason.trim()) {
            alert('Please provide a reason for this override');
            return;
        }

        setLoading(true);

        if (overrideAction.type === 'remove') {
            await adminRemoveOrderItem(overrideAction.itemId, admin.id, overrideReason);
        } else if (overrideAction.type === 'discount') {
            const amount = parseFloat(prompt('Enter discount amount:') || '0');
            if (amount > 0) {
                await adminApplyDiscount(overrideAction.orderId, admin.id, amount, overrideReason);
            }
        }

        setShowOverrideModal(false);
        setOverrideReason('');
        setOverrideAction(null);
        await loadTables();
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case TableStatus.FREE: return 'bg-green-500';
            case TableStatus.ACTIVE: return 'bg-blue-500';
            case TableStatus.BILL_REQUESTED: return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case TableStatus.FREE: return 'Free';
            case TableStatus.ACTIVE: return 'Active';
            case TableStatus.BILL_REQUESTED: return 'Bill Requested';
            default: return status;
        }
    };

    const activeTables = tables.filter(t => t.status !== TableStatus.FREE);
    const freeTables = tables.filter(t => t.status === TableStatus.FREE);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Live Floor Status</h2>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={loadTables}
                        disabled={refreshing}
                        className="btn btn-outline"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card text-center">
                    <div className="text-3xl font-bold text-emerald-600">{activeTables.length}</div>
                    <div className="text-sm text-slate-600">Active Tables</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-green-600">{freeTables.length}</div>
                    <div className="text-sm text-slate-600">Free Tables</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                        {tables.filter(t => t.status === TableStatus.BILL_REQUESTED).length}
                    </div>
                    <div className="text-sm text-slate-600">Bills Requested</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-blue-600">
                        ₹{activeTables.reduce((sum, t) => {
                            const items = t.tableSessions[0]?.orders.flatMap((o: any) => o.orderItems) || [];
                            return sum + items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
                        }, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600">Total Revenue</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Tables Grid/List */}
                <div className="lg:col-span-1">
                    <div className="card">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">All Tables</h2>
                        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                            {tables.map(table => {
                                const session = table.tableSessions[0];
                                const orderItems = session?.orders.flatMap((o: any) => o.orderItems) || [];
                                const total = orderItems.reduce((sum: number, item: any) =>
                                    sum + item.price * item.quantity, 0
                                );

                                return (
                                    <button
                                        key={table.id}
                                        onClick={() => setSelectedTable(table)}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${selectedTable?.id === table.id
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-slate-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900">{table.tableNumber}</span>
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`} />
                                        </div>
                                        <div className="text-xs text-slate-600">
                                            <div>{getStatusLabel(table.status)}</div>
                                            {session && (
                                                <>
                                                    <div className="mt-1">{orderItems.length} items</div>
                                                    <div className="font-semibold text-emerald-600">₹{(total * 1.1).toFixed(2)}</div>
                                                    {session.assignedWaiter && (
                                                        <div className="mt-1 text-blue-600">{session.assignedWaiter.name}</div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Table Details */}
                <div className="lg:col-span-2">
                    {selectedTable ? (
                        <div className="card">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Table {selectedTable.tableNumber}
                                    </h2>
                                    {selectedTable.tableSessions[0] && (
                                        <p className="text-sm text-slate-600">
                                            Session started {new Date(selectedTable.tableSessions[0].startedAt).toLocaleTimeString()}
                                            {selectedTable.tableSessions[0].assignedWaiter && (
                                                <> • Waiter: {selectedTable.tableSessions[0].assignedWaiter.name}</>
                                            )}
                                        </p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(selectedTable.status)}`}>
                                    {getStatusLabel(selectedTable.status)}
                                </span>
                            </div>

                            {selectedTable.tableSessions[0] ? (
                                <>
                                    {/* Order Items */}
                                    <div className="space-y-4 mb-6">
                                        {selectedTable.tableSessions[0].orders.flatMap((order: any) =>
                                            order.orderItems.map((item: any) => (
                                                <div key={item.id} className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-slate-900">{item.menuItem.name}</h3>
                                                            <p className="text-sm text-slate-600">
                                                                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                                            </p>
                                                            {item.notes && (
                                                                <p className="text-sm text-slate-500 italic mt-1">Note: {item.notes}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-slate-900 mb-2">
                                                                ₹{(item.price * item.quantity).toFixed(2)}
                                                            </div>
                                                            <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Admin Override */}
                                                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            disabled={loading}
                                                            className="btn btn-sm btn-danger"
                                                        >
                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                            Remove (Override)
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    {selectedTable.tableSessions[0].orders.length > 0 && (
                                        <div className="border-t border-slate-200 pt-4">
                                            {selectedTable.tableSessions[0].orders.map((order: any) => {
                                                const subtotal = order.orderItems.reduce(
                                                    (sum: number, item: any) => sum + item.price * item.quantity,
                                                    0
                                                );
                                                const tax = subtotal * 0.1;
                                                const total = subtotal + tax - order.discount;

                                                return (
                                                    <div key={order.id} className="space-y-2">
                                                        <div className="flex justify-between text-slate-600">
                                                            <span>Subtotal</span>
                                                            <span>₹{subtotal.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-slate-600">
                                                            <span>Tax (10%)</span>
                                                            <span>₹{tax.toFixed(2)}</span>
                                                        </div>
                                                        {order.discount > 0 && (
                                                            <div className="flex justify-between text-red-600">
                                                                <span>Discount</span>
                                                                <span>-₹{order.discount.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                                                            <span>Total</span>
                                                            <span>₹{total.toFixed(2)}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => handleApplyDiscount(order.id)}
                                                            disabled={loading}
                                                            className="w-full btn btn-outline mt-4"
                                                        >
                                                            <DollarSign className="w-4 h-4 mr-2" />
                                                            Apply Discount (Override)
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <p>No active session for this table</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Table Selected</h3>
                            <p className="text-slate-600">Select a table to view details and manage orders</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Override Modal */}
            {showOverrideModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Admin Override Required</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Please provide a reason for this override action. This will be logged for audit purposes.
                        </p>
                        <textarea
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            placeholder="Enter reason for override..."
                            className="input min-h-[100px] mb-4"
                            required
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowOverrideModal(false);
                                    setOverrideReason('');
                                    setOverrideAction(null);
                                }}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeOverride}
                                disabled={!overrideReason.trim() || loading}
                                className="flex-1 btn btn-danger"
                            >
                                Confirm Override
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

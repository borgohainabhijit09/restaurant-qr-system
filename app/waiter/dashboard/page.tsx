'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw, Clock, ChefHat, Check, Users, AlertCircle } from 'lucide-react';
import { getAllTables, assignWaiterToTable, closeTableSession } from '@/app/actions/tables';
import { updateOrderItemStatus } from '@/app/actions/orders';
import { TableStatus, OrderItemStatus } from '@/lib/types';

export default function WaiterDashboardPage() {
    const router = useRouter();
    const [waiter, setWaiter] = useState<any>(null);
    const [tables, setTables] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [tableToClose, setTableToClose] = useState<string | null>(null);

    const loadTables = useCallback(async () => {
        setRefreshing(true);
        const allTables = await getAllTables();
        setTables(allTables);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        // Check authentication
        const waiterData = sessionStorage.getItem('waiter');
        if (!waiterData) {
            router.push('/waiter/login');
            return;
        }
        setWaiter(JSON.parse(waiterData));
        loadTables();
    }, [router, loadTables]);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            loadTables();
        }, 5000);
        return () => clearInterval(interval);
    }, [loadTables]);

    // Sync selected table with tables state
    useEffect(() => {
        if (selectedTable && tables.length > 0) {
            const updatedTable = tables.find((t: any) => t.id === selectedTable.id);
            if (updatedTable && JSON.stringify(updatedTable) !== JSON.stringify(selectedTable)) {
                setSelectedTable(updatedTable);
            }
        }
    }, [tables, selectedTable]);

    const handleSelectTable = (table: any) => {
        setSelectedTable(table);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('waiter');
        router.push('/waiter/login');
    };

    const handleAcceptTable = async (tableSession: any) => {
        if (!waiter) return;

        setLoading(true);
        const result = await assignWaiterToTable(tableSession.id, waiter.id);
        if (result.success) {
            await loadTables();
        }
        setLoading(false);
    };

    const handleUpdateItemStatus = async (itemId: string, newStatus: OrderItemStatus) => {
        setLoading(true);
        await updateOrderItemStatus(itemId, newStatus);
        await loadTables();
        setLoading(false);
    };

    const handleCloseTable = async (sessionId: string) => {
        setTableToClose(sessionId);
        setShowCloseModal(true);
    };

    const confirmCloseTable = async () => {
        if (!tableToClose) return;

        setLoading(true);
        setShowCloseModal(false);
        await closeTableSession(tableToClose);
        await loadTables();
        setSelectedTable(null);
        setTableToClose(null);
        setLoading(false);
    };

    const myTables = tables.filter(t =>
        t.tableSessions[0]?.assignedWaiterId === waiter?.id
    );

    const availableTables = tables.filter(t =>
        t.tableSessions[0] && !t.tableSessions[0].assignedWaiterId
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case TableStatus.FREE: return 'bg-green-100 text-green-800';
            case TableStatus.ACTIVE: return 'bg-blue-100 text-blue-800';
            case TableStatus.BILL_REQUESTED: return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (!waiter) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate">Waiter Dashboard</h1>
                            <p className="text-xs sm:text-sm text-slate-600 truncate">Welcome, {waiter.name}</p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
                            <button
                                onClick={loadTables}
                                disabled={refreshing}
                                className="btn btn-outline px-2 sm:px-4 text-sm"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} sm:mr-2`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button onClick={handleLogout} className="btn btn-secondary px-2 sm:px-4 text-sm" title="Logout">
                                <LogOut className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Tables List */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* My Tables */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">My Tables ({myTables.length})</h2>
                            <div className="space-y-2">
                                {myTables.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">No tables assigned</p>
                                ) : (
                                    myTables.map(table => {
                                        const session = table.tableSessions[0];
                                        const orderItems = session?.orders.flatMap((o: any) => o.orderItems) || [];
                                        const total = orderItems.reduce((sum: number, item: any) =>
                                            sum + item.price * item.quantity, 0
                                        );

                                        return (
                                            <button
                                                key={table.id}
                                                onClick={() => handleSelectTable(table)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedTable?.id === table.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-blue-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-slate-900">Table {table.tableNumber}</span>
                                                    <span className={`status-badge ${getStatusColor(table.status)}`}>
                                                        {table.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    <div>{orderItems.length} items</div>
                                                    <div className="font-semibold text-emerald-600">₹{(total * 1.1).toFixed(2)}</div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Available Tables */}
                        <div className="card">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                Available Tables ({availableTables.length})
                            </h2>
                            <div className="space-y-2">
                                {availableTables.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">No available tables</p>
                                ) : (
                                    availableTables.map(table => {
                                        const session = table.tableSessions[0];
                                        return (
                                            <div
                                                key={table.id}
                                                className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold text-slate-900">Table {table.tableNumber}</span>
                                                    <span className={`status-badge ${getStatusColor(table.status)}`}>
                                                        {table.status}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleAcceptTable(session)}
                                                    disabled={loading}
                                                    className="w-full btn btn-primary btn-sm mt-2"
                                                >
                                                    Accept Table
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
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
                                        {selectedTable.tableSessions?.[0]?.startedAt && (
                                            <p className="text-sm text-slate-600">
                                                Session started {new Date(selectedTable.tableSessions[0].startedAt).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                    <span className={`status-badge ${getStatusColor(selectedTable.status)}`}>
                                        {selectedTable.status}
                                    </span>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4">
                                    {selectedTable.tableSessions?.[0]?.orders && selectedTable.tableSessions[0].orders.length > 0 ? (
                                        selectedTable.tableSessions[0].orders.flatMap((order: any) =>
                                            order.orderItems?.map((item: any) => (
                                                <div key={item.id} className="bg-slate-50 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-slate-900">{item.menuItem?.name || 'Unknown Item'}</h3>
                                                            <p className="text-sm text-slate-600">
                                                                Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                                                            </p>
                                                            {item.notes && (
                                                                <p className="text-sm text-slate-500 italic mt-1">Note: {item.notes}</p>
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-slate-900">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    {/* Status Actions */}
                                                    <div className="flex gap-2">
                                                        {item.status === OrderItemStatus.ADDED && (
                                                            <button
                                                                onClick={() => handleUpdateItemStatus(item.id, OrderItemStatus.PREPARING)}
                                                                disabled={loading}
                                                                className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600"
                                                            >
                                                                <ChefHat className="w-4 h-4 mr-1" />
                                                                Mark Preparing
                                                            </button>
                                                        )}
                                                        {item.status === OrderItemStatus.PREPARING && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium border border-orange-200">
                                                                    Preparing...
                                                                </span>
                                                                <button
                                                                    onClick={() => handleUpdateItemStatus(item.id, OrderItemStatus.SERVED)}
                                                                    disabled={loading}
                                                                    className="btn btn-sm btn-outline text-xs py-1 h-auto min-h-0"
                                                                    title="Force mark served"
                                                                >
                                                                    Served
                                                                </button>
                                                            </div>
                                                        )}
                                                        {item.status === OrderItemStatus.READY && (
                                                            <button
                                                                onClick={() => handleUpdateItemStatus(item.id, OrderItemStatus.SERVED)}
                                                                disabled={loading}
                                                                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 animate-pulse shadow-md"
                                                            >
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Serve Now
                                                            </button>
                                                        )}
                                                        {item.status === OrderItemStatus.SERVED && (
                                                            <span className="status-badge status-served">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                Served
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )) || []
                                        )
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded-lg">
                                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-600 font-medium">No orders yet</p>
                                            <p className="text-sm text-slate-500 mt-1">Customer hasn't placed any orders</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-6 pt-6 border-t border-slate-200">
                                    {selectedTable.status === TableStatus.BILL_REQUESTED && (
                                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="font-semibold text-yellow-900">Bill Requested</h3>
                                                <p className="text-sm text-yellow-700">Customer has requested the bill</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTable.tableSessions?.[0]?.id && (
                                        <button
                                            onClick={() => handleCloseTable(selectedTable.tableSessions[0].id)}
                                            disabled={loading}
                                            className="w-full btn btn-danger"
                                        >
                                            Close Table & Collect Payment
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Table Selected</h3>
                                <p className="text-slate-600">Select a table from the list to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close Table Confirmation Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Close Table?</h3>
                        <p className="text-slate-600 mb-6">
                            This will mark all items as billed and free the table. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCloseModal(false);
                                    setTableToClose(null);
                                }}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmCloseTable}
                                disabled={loading}
                                className="flex-1 btn btn-danger"
                            >
                                Close Table
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

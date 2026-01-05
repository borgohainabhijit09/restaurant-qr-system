'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, X, Check, Clock, ChefHat, AlertCircle } from 'lucide-react';
import { addItemToOrder, removeOrderItem, updateOrderItemQuantity, requestBill } from '@/app/actions/orders';
import { TableStatus, OrderItemStatus } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TableOrderingClientProps {
    table: any;
    session: any;
    menuCategories: any[];
    initialOrders: any[];
}

export default function TableOrderingClient({
    table,
    session,
    menuCategories,
    initialOrders,
}: TableOrderingClientProps) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(menuCategories[0]?.id || '');
    const [cart, setCart] = useState<any[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showBillModal, setShowBillModal] = useState(false);

    const isBillRequested = session.status === TableStatus.BILL_REQUESTED;

    // Load cart from orders
    useEffect(() => {
        const allItems = initialOrders.flatMap(order => order.orderItems);
        setCart(allItems);
    }, [initialOrders]);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleAddToCart = async (menuItem: any) => {
        if (isBillRequested) {
            showNotification('error', 'Cannot add items after bill is requested');
            return;
        }

        setLoading(true);
        const result = await addItemToOrder(session.id, menuItem.id, 1);

        if (result.success) {
            showNotification('success', `${menuItem.name} added to cart`);
            router.refresh();
        } else {
            showNotification('error', result.error || 'Failed to add item');
        }
        setLoading(false);
    };

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        setLoading(true);
        const result = await updateOrderItemQuantity(itemId, newQuantity);

        if (result.success) {
            router.refresh();
        } else {
            showNotification('error', result.error || 'Failed to update quantity');
        }
        setLoading(false);
    };

    const handleRemoveItem = async (itemId: string, itemStatus: string) => {
        if (itemStatus !== OrderItemStatus.ADDED) {
            showNotification('error', 'Cannot remove items that are being prepared or served');
            return;
        }

        setLoading(true);
        const result = await removeOrderItem(itemId);

        if (result.success) {
            showNotification('success', 'Item removed from cart');
            router.refresh();
        } else {
            showNotification('error', result.error || 'Failed to remove item');
        }
        setLoading(false);
    };

    const handleRequestBill = async () => {
        if (cart.length === 0) {
            showNotification('error', 'Cart is empty');
            return;
        }

        setShowBillModal(true);
    };

    const confirmRequestBill = async () => {
        setLoading(true);
        setShowBillModal(false);
        const result = await requestBill(session.id);

        if (result.success) {
            showNotification('success', 'Bill requested! Waiter will assist you.');
            router.refresh();
        } else {
            showNotification('error', result.error || 'Failed to request bill');
        }
        setLoading(false);
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            [OrderItemStatus.ADDED]: { label: 'Added', className: 'status-added', icon: Clock },
            [OrderItemStatus.PREPARING]: { label: 'Preparing', className: 'status-preparing', icon: ChefHat },
            [OrderItemStatus.READY]: { label: 'Ready to Serve', className: 'bg-green-100 text-green-800 border-green-200', icon: Check },
            [OrderItemStatus.SERVED]: { label: 'Served', className: 'status-served', icon: Check },
            [OrderItemStatus.BILLED]: { label: 'Billed', className: 'status-billed', icon: Check },
        };

        const badge = badges[status as OrderItemStatus] || badges[OrderItemStatus.ADDED];
        const Icon = badge.icon;

        return (
            <span className={`status-badge ${badge.className} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 px-4 py-3 rounded-lg shadow-lg animate-fade-in ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white text-sm sm:text-base`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">Table {table.tableNumber}</h1>
                            <p className="text-xs sm:text-sm text-slate-500 truncate">
                                {session.assignedWaiter ? `Served by ${session.assignedWaiter.name}` : 'No waiter assigned yet'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCart(true)}
                            className="relative btn btn-primary px-3 sm:px-4 text-sm flex-shrink-0"
                        >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Cart</span>
                            <span className="sm:hidden">({cartCount})</span>
                            <span className="hidden sm:inline"> ({cartCount})</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Category Tabs */}
            <div className="bg-white border-b border-slate-200 sticky top-[57px] sm:top-[73px] z-30">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="flex gap-2 overflow-x-auto py-2 sm:py-3 scrollbar-hide">
                        {menuCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${selectedCategory === category.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {isBillRequested && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 sm:gap-3">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-yellow-900 text-sm sm:text-base">Bill Requested</h3>
                            <p className="text-xs sm:text-sm text-yellow-700">You cannot add more items. Please wait for your waiter.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {menuCategories
                        .find((cat) => cat.id === selectedCategory)
                        ?.menuItems.map((item: any) => (
                            <div key={item.id} className="card group hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg text-slate-900">{item.name}</h3>
                                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                    </div>
                                    {item.isVeg && (
                                        <span className="ml-2 w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center flex-shrink-0">
                                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xl font-bold text-emerald-600">₹{item.price.toFixed(2)}</span>
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={loading || isBillRequested}
                                        className="btn btn-primary btn-sm disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </main>

            {/* Cart Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl animate-slide-in">
                        <div className="flex flex-col h-full">
                            {/* Cart Header */}
                            <div className="p-4 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900">Your Order</h2>
                                    <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">Your cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.id} className="bg-slate-50 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-slate-900">{item.menuItem.name}</h3>
                                                        <p className="text-sm text-slate-600">₹{item.price.toFixed(2)} each</p>
                                                    </div>
                                                    {getStatusBadge(item.status)}
                                                </div>

                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                            disabled={loading || item.status !== OrderItemStatus.ADDED || item.quantity <= 1}
                                                            className="w-8 h-8 rounded-lg bg-white border-2 border-emerald-500 flex items-center justify-center hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-600"
                                                        >
                                                            <Minus className="w-4 h-4 stroke-2" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-slate-900">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                            disabled={loading || item.status !== OrderItemStatus.ADDED}
                                                            className="w-8 h-8 rounded-lg bg-white border-2 border-emerald-500 flex items-center justify-center hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-600"
                                                        >
                                                            <Plus className="w-4 h-4 stroke-2" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-slate-900">
                                                            ₹{(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id, item.status)}
                                                            disabled={loading || item.status !== OrderItemStatus.ADDED}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={item.status !== OrderItemStatus.ADDED ? 'Cannot remove prepared/served items' : 'Remove item'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cart Footer */}
                            {cart.length > 0 && (
                                <div className="border-t border-slate-200 p-4 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-slate-600">
                                            <span>Subtotal</span>
                                            <span>₹{cartTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Tax (10%)</span>
                                            <span>₹{(cartTotal * 0.1).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                                            <span>Total</span>
                                            <span>₹{(cartTotal * 1.1).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {!isBillRequested ? (
                                        <button
                                            onClick={handleRequestBill}
                                            disabled={loading}
                                            className="w-full btn btn-primary"
                                        >
                                            Request Bill
                                        </button>
                                    ) : (
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                            <p className="font-semibold text-green-900">Bill Requested</p>
                                            <p className="text-sm text-green-700">Your waiter will assist you shortly</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bill Request Confirmation Modal */}
            {showBillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Request Bill?</h3>
                        <p className="text-slate-600 mb-6">
                            Once you request the bill, you won't be able to add more items to your order.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBillModal(false)}
                                className="flex-1 btn btn-outline"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRequestBill}
                                disabled={loading}
                                className="flex-1 btn btn-primary"
                            >
                                Request Bill
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

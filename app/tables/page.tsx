import Link from 'next/link';
import { QrCode, Users, CheckCircle, Clock } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { TableStatus } from '@/lib/types';

export default async function TablesPage() {
    const tables = await prisma.table.findMany({
        orderBy: {
            tableNumber: 'asc',
        },
        include: {
            tableSessions: {
                where: {
                    status: {
                        in: [TableStatus.ACTIVE, TableStatus.BILL_REQUESTED],
                    },
                },
                take: 1,
                include: {
                    assignedWaiter: {
                        select: {
                            name: true,
                            staffId: true,
                        },
                    },
                    orders: {
                        include: {
                            orderItems: true,
                        },
                    },
                },
            },
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case TableStatus.FREE:
                return 'bg-green-100 text-green-800 border-green-200';
            case TableStatus.ACTIVE:
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case TableStatus.BILL_REQUESTED:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case TableStatus.FREE:
                return <CheckCircle className="w-4 h-4" />;
            case TableStatus.ACTIVE:
                return <Clock className="w-4 h-4" />;
            case TableStatus.BILL_REQUESTED:
                return <Users className="w-4 h-4" />;
            default:
                return <QrCode className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900">All Tables</h1>
                                <p className="text-xs text-slate-500">Select a table to test</p>
                            </div>
                        </div>
                        <Link href="/" className="btn btn-outline text-sm px-3 sm:px-4">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-green-600">
                            {tables.filter((t: any) => t.status === TableStatus.FREE).length}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Free Tables</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-blue-600">
                            {tables.filter((t: any) => t.status === TableStatus.ACTIVE).length}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Active</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-yellow-600">
                            {tables.filter((t: any) => t.status === TableStatus.BILL_REQUESTED).length}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Bill Requested</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-slate-900">
                            {tables.length}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">Total Tables</div>
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {tables.map((table: any) => {
                        const session = table.tableSessions[0];
                        const orderItems = session?.orders.flatMap((o: any) => o.orderItems) || [];
                        const total = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

                        return (
                            <Link
                                key={table.id}
                                href={`/table/${table.tableNumber}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                    {/* Table Number */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <QrCode className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">
                                                    {table.tableNumber}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Capacity: {table.capacity}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-3 ${getStatusColor(table.status)}`}>
                                        {getStatusIcon(table.status)}
                                        {table.status}
                                    </div>

                                    {/* Session Info */}
                                    {session ? (
                                        <div className="space-y-2 pt-3 border-t border-slate-100">
                                            {session.assignedWaiter && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Users className="w-4 h-4" />
                                                    <span className="truncate">{session.assignedWaiter.name}</span>
                                                </div>
                                            )}
                                            {orderItems.length > 0 && (
                                                <>
                                                    <div className="text-sm text-slate-600">
                                                        {orderItems.length} item{orderItems.length !== 1 ? 's' : ''}
                                                    </div>
                                                    <div className="text-lg font-bold text-emerald-600">
                                                        ₹{(total * 1.1).toFixed(2)}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="pt-3 border-t border-slate-100">
                                            <p className="text-sm text-slate-500 italic">No active session</p>
                                        </div>
                                    )}

                                    {/* Action Hint */}
                                    <div className="mt-4 pt-3 border-t border-slate-100">
                                        <div className="text-sm text-emerald-600 font-medium group-hover:gap-2 flex items-center transition-all">
                                            Open Table
                                            <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Testing Guide */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">🧪 Testing Guide</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Multiple Waiters:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Open waiter dashboard in 2 different browser windows/tabs</li>
                            <li>Login as W001 (PIN: 1111) in first window</li>
                            <li>Login as W002 (PIN: 2222) in second window</li>
                            <li>Each waiter can accept different tables</li>
                            <li>Try accepting the same table - only one waiter can be assigned</li>
                        </ul>
                        <p className="mt-3"><strong>Multiple Tables:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Click any table above to open customer view</li>
                            <li>Open multiple tables in different tabs</li>
                            <li>Add items to different tables</li>
                            <li>Watch waiters manage multiple tables simultaneously</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

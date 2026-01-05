import { notFound, redirect } from 'next/navigation';
import { getTableByNumber, createOrResumeTableSession } from '@/app/actions/tables';
import { getMenuWithCategories } from '@/app/actions/menu';
import { getSessionOrders } from '@/app/actions/orders';
import TableOrderingClient from './TableOrderingClient';

interface PageProps {
    params: Promise<{
        tableNumber: string;
    }>;
}

export default async function TablePage({ params }: PageProps) {
    const { tableNumber } = await params;

    // Get table data
    const table = await getTableByNumber(tableNumber);

    if (!table) {
        notFound();
    }

    // Create or resume session
    let session = table.tableSessions[0];

    if (!session) {
        const newSession = await createOrResumeTableSession(table.id);
        if (!newSession) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                        <p className="text-slate-600">Failed to create table session</p>
                    </div>
                </div>
            );
        }
        session = newSession;
    }

    // Get menu
    const menuCategories = await getMenuWithCategories();

    // Get current orders
    const orders = await getSessionOrders(session.id);

    return (
        <TableOrderingClient
            table={table}
            session={session}
            menuCategories={menuCategories}
            initialOrders={orders}
        />
    );
}

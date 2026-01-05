import { notFound } from 'next/navigation';
import { getTableByNumber, createOrResumeTableSession, getTableSessionById } from '@/app/actions/tables';
import { getMenuWithCategories } from '@/app/actions/menu';
import { getSessionOrders } from '@/app/actions/orders';
import TableOrderingClient from './TableOrderingClient';
import { TableSessionWithDetails } from '@/lib/types';

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

    // 1. Initialize session variable with the explicit Detailed type
    let session: TableSessionWithDetails | null | undefined = table.tableSessions[0] as TableSessionWithDetails | undefined;

    // 2. If no active session exists, create one and fetch its full details
    if (!session) {
        // Create basic session
        const basicSession = await createOrResumeTableSession(table.id);

        if (!basicSession) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                        <p className="text-slate-600">Failed to create table session</p>
                    </div>
                </div>
            );
        }

        // Fetch fully hydrated session with relations (Correct Architectural Pattern)
        // This avoids manually constructing objects and ensures strict type consistency
        const fullSession = await getTableSessionById(basicSession.id);

        if (!fullSession) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
                        <p className="text-slate-600">Failed to load session details</p>
                    </div>
                </div>
            );
        }

        session = fullSession as TableSessionWithDetails;
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

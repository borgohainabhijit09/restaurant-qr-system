'use server';

import { prisma } from '@/lib/prisma';
import { TableStatus, OrderItemStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getTableByQRCode(qrCode: string) {
    try {
        const table = await prisma.table.findUnique({
            where: { qrCode },
            include: {
                tableSessions: {
                    where: {
                        status: {
                            in: [TableStatus.ACTIVE, TableStatus.BILL_REQUESTED],
                        },
                    },
                    orderBy: {
                        startedAt: 'desc',
                    },
                    take: 1,
                    include: {
                        orders: {
                            include: {
                                orderItems: {
                                    include: {
                                        menuItem: {
                                            include: {
                                                category: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        assignedWaiter: {
                            select: {
                                name: true,
                                staffId: true,
                            },
                        },
                    },
                },
            },
        });

        return table;
    } catch (error) {
        console.error('Error fetching table:', error);
        return null;
    }
}

export async function getTableByNumber(tableNumber: string) {
    try {
        const table = await prisma.table.findUnique({
            where: { tableNumber },
            include: {
                tableSessions: {
                    where: {
                        status: {
                            in: [TableStatus.ACTIVE, TableStatus.BILL_REQUESTED],
                        },
                    },
                    orderBy: {
                        startedAt: 'desc',
                    },
                    take: 1,
                    include: {
                        orders: {
                            include: {
                                orderItems: {
                                    include: {
                                        menuItem: {
                                            include: {
                                                category: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        assignedWaiter: {
                            select: {
                                name: true,
                                staffId: true,
                            },
                        },
                    },
                },
            },
        });

        return table;
    } catch (error) {
        console.error('Error fetching table:', error);
        return null;
    }
}

export async function getTableSessionById(sessionId: string) {
    try {
        const session = await prisma.tableSession.findUnique({
            where: { id: sessionId },
            include: {
                orders: {
                    include: {
                        orderItems: {
                            include: {
                                menuItem: {
                                    include: {
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
                assignedWaiter: {
                    select: {
                        name: true,
                        staffId: true,
                    },
                },
            },
        });
        return session;
    } catch (error) {
        console.error('Error fetching session:', error);
        return null;
    }
}

export async function createOrResumeTableSession(tableId: string) {
    try {
        // Check if there's an active session
        const existingSession = await prisma.tableSession.findFirst({
            where: {
                tableId,
                status: {
                    in: [TableStatus.ACTIVE, TableStatus.BILL_REQUESTED],
                },
            },
        });

        if (existingSession) {
            return existingSession;
        }

        // Create new session
        const session = await prisma.tableSession.create({
            data: {
                tableId,
                status: TableStatus.ACTIVE,
            },
        });

        // Update table status
        await prisma.table.update({
            where: { id: tableId },
            data: { status: TableStatus.ACTIVE },
        });

        // Note: revalidatePath cannot be called here as this function is used during render
        // Admin dashboard auto-refreshes every 3 seconds anyway
        return session;
    } catch (error) {
        console.error('Error creating/resuming session:', error);
        return null;
    }
}

export async function getAllTables() {
    try {
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
                                orderItems: {
                                    include: {
                                        menuItem: {
                                            include: {
                                                category: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        return tables;
    } catch (error) {
        console.error('Error fetching tables:', error);
        return [];
    }
}

export async function assignWaiterToTable(tableSessionId: string, waiterId: string) {
    try {
        const session = await prisma.tableSession.update({
            where: { id: tableSessionId },
            data: { assignedWaiterId: waiterId },
        });

        revalidatePath('/waiter/dashboard');
        revalidatePath('/admin/dashboard');
        return { success: true, session };
    } catch (error) {
        console.error('Error assigning waiter:', error);
        return { success: false, error: 'Failed to assign waiter' };
    }
}

export async function closeTableSession(tableSessionId: string) {
    try {
        // Update session
        const session = await prisma.tableSession.update({
            where: { id: tableSessionId },
            data: {
                status: TableStatus.FREE,
                closedAt: new Date(),
            },
        });

        // Update all order items to BILLED
        await prisma.orderItem.updateMany({
            where: {
                order: {
                    tableSessionId,
                },
            },
            data: {
                status: OrderItemStatus.BILLED,
            },
        });

        // Update table status
        await prisma.table.update({
            where: { id: session.tableId },
            data: { status: TableStatus.FREE },
        });

        revalidatePath('/waiter/dashboard');
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error closing session:', error);
        return { success: false, error: 'Failed to close session' };
    }
}

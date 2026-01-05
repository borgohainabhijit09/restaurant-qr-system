'use server';

import { prisma } from '@/lib/prisma';
import { OrderItemStatus } from '@/lib/types';

export async function getKitchenItems() {
    try {
        const items = await prisma.orderItem.findMany({
            where: {
                status: {
                    in: [OrderItemStatus.ADDED, OrderItemStatus.PREPARING, OrderItemStatus.READY] as any,
                },
            },
            include: {
                menuItem: true,
                order: {
                    include: {
                        tableSession: {
                            include: {
                                table: true,
                                assignedWaiter: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return items;
    } catch (error) {
        console.error('Error fetching kitchen items:', error);
        return [];
    }
}

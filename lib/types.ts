// Enums for type safety (matching database string values)

import { Prisma } from '@prisma/client';

export enum Role {
    ADMIN = 'ADMIN',
    WAITER = 'WAITER',
    KITCHEN = 'KITCHEN',
}

export enum TableStatus {
    FREE = 'FREE',
    ACTIVE = 'ACTIVE',
    BILL_REQUESTED = 'BILL_REQUESTED',
}

export enum OrderItemStatus {
    ADDED = 'ADDED',
    PREPARING = 'PREPARING',
    READY = 'READY',
    SERVED = 'SERVED',
    BILLED = 'BILLED',
}

// Type guards
export function isValidRole(role: string): role is Role {
    return Object.values(Role).includes(role as Role);
}

export function isValidTableStatus(status: string): status is TableStatus {
    return Object.values(TableStatus).includes(status as TableStatus);
}

export function isValidOrderItemStatus(status: string): status is OrderItemStatus {
    return Object.values(OrderItemStatus).includes(status as OrderItemStatus);
}

// --- Session Types ---

export type TableSessionBase = Prisma.TableSessionGetPayload<{}>;

// The canonical "Rich" session used in UI
export type TableSessionWithDetails = Prisma.TableSessionGetPayload<{
    include: {
        orders: {
            include: {
                orderItems: {
                    include: {
                        menuItem: {
                            include: {
                                category: true;
                            };
                        };
                    };
                };
            };
        };
        assignedWaiter: {
            select: {
                name: true;
                staffId: true;
            };
        };
    };
}>;

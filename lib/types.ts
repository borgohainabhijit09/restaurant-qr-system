// Enums for type safety (matching database string values)

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

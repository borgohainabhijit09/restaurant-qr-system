'use server';

import { prisma } from '@/lib/prisma';
import { OrderItemStatus, TableStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function addItemToOrder(
    tableSessionId: string,
    menuItemId: string,
    quantity: number,
    notes?: string
) {
    try {
        // Get or create order for this session
        let order = await prisma.order.findFirst({
            where: { tableSessionId },
            orderBy: { createdAt: 'desc' },
        });

        if (!order) {
            // Get the count of orders for this session to determine order number
            const orderCount = await prisma.order.count({
                where: { tableSessionId },
            });

            order = await prisma.order.create({
                data: {
                    tableSessionId,
                    orderNumber: orderCount + 1,
                },
            });
        }

        // Get menu item price
        const menuItem = await prisma.menuItem.findUnique({
            where: { id: menuItemId },
        });

        if (!menuItem) {
            return { success: false, error: 'Menu item not found' };
        }

        // Add order item
        const orderItem = await prisma.orderItem.create({
            data: {
                orderId: order.id,
                menuItemId,
                quantity,
                price: menuItem.price,
                notes,
                status: OrderItemStatus.ADDED,
            },
        });

        // Recalculate order totals
        await recalculateOrderTotals(order.id);

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);

        return { success: true, orderItem };
    } catch (error) {
        console.error('Error adding item to order:', error);
        return { success: false, error: 'Failed to add item' };
    }
}

export async function updateOrderItemQuantity(
    orderItemId: string,
    quantity: number
) {
    try {
        // Check if item can be modified
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
            include: { order: true },
        });

        if (!orderItem) {
            return { success: false, error: 'Order item not found' };
        }

        if (orderItem.status !== OrderItemStatus.ADDED) {
            return {
                success: false,
                error: 'Cannot modify item that is being prepared or has been served',
            };
        }

        // Update quantity
        const updated = await prisma.orderItem.update({
            where: { id: orderItemId },
            data: { quantity },
        });

        // Recalculate order totals
        await recalculateOrderTotals(orderItem.orderId);

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);

        return { success: true, orderItem: updated };
    } catch (error) {
        console.error('Error updating order item:', error);
        return { success: false, error: 'Failed to update item' };
    }
}

export async function removeOrderItem(orderItemId: string) {
    try {
        // Check if item can be removed
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
            include: { order: true },
        });

        if (!orderItem) {
            return { success: false, error: 'Order item not found' };
        }

        if (orderItem.status !== OrderItemStatus.ADDED) {
            return {
                success: false,
                error: 'Cannot remove item that is being prepared or has been served',
            };
        }

        // Delete order item
        await prisma.orderItem.delete({
            where: { id: orderItemId },
        });

        // Recalculate order totals
        await recalculateOrderTotals(orderItem.orderId);

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);

        return { success: true };
    } catch (error) {
        console.error('Error removing order item:', error);
        return { success: false, error: 'Failed to remove item' };
    }
}

export async function updateOrderItemStatus(
    orderItemId: string,
    status: OrderItemStatus
) {
    try {
        const orderItem = await prisma.orderItem.update({
            where: { id: orderItemId },
            data: { status: status as any },
        });

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);
        revalidatePath(`/kitchen/dashboard`);

        return { success: true, orderItem };
    } catch (error) {
        console.error('Error updating order item status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function requestBill(tableSessionId: string) {
    try {
        // Update session status
        const session = await prisma.tableSession.update({
            where: { id: tableSessionId },
            data: {
                status: TableStatus.BILL_REQUESTED,
                billRequestedAt: new Date(),
            },
        });

        // Update table status
        await prisma.table.update({
            where: { id: session.tableId },
            data: { status: TableStatus.BILL_REQUESTED },
        });

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);

        return { success: true };
    } catch (error) {
        console.error('Error requesting bill:', error);
        return { success: false, error: 'Failed to request bill' };
    }
}

export async function getSessionOrders(tableSessionId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: { tableSessionId },
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
            orderBy: { createdAt: 'asc' },
        });

        return orders;
    } catch (error) {
        console.error('Error fetching session orders:', error);
        return [];
    }
}

async function recalculateOrderTotals(orderId: string) {
    try {
        const orderItems = await prisma.orderItem.findMany({
            where: { orderId },
        });

        const subtotal = orderItems.reduce(
            (sum: number, item: any) => sum + item.price * item.quantity,
            0
        );
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        await prisma.order.update({
            where: { id: orderId },
            data: { subtotal, tax, total },
        });
    } catch (error) {
        console.error('Error recalculating order totals:', error);
    }
}

// Admin override to remove any item
export async function adminRemoveOrderItem(
    orderItemId: string,
    adminId: string,
    reason: string
) {
    try {
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
        });

        if (!orderItem) {
            return { success: false, error: 'Order item not found' };
        }

        // Log the override
        await prisma.auditLog.create({
            data: {
                staffId: adminId,
                action: 'REMOVE_ITEM',
                entityType: 'ORDER_ITEM',
                entityId: orderItemId,
                reason,
                metadata: JSON.stringify({
                    itemStatus: orderItem.status,
                    quantity: orderItem.quantity,
                    price: orderItem.price,
                }),
            },
        });

        // Delete the item
        await prisma.orderItem.delete({
            where: { id: orderItemId },
        });

        // Recalculate totals
        await recalculateOrderTotals(orderItem.orderId);

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);

        return { success: true };
    } catch (error) {
        console.error('Error removing order item (admin):', error);
        return { success: false, error: 'Failed to remove item' };
    }
}

export async function adminApplyDiscount(
    orderId: string,
    adminId: string,
    discountAmount: number,
    reason: string
) {
    try {
        // Log the override
        await prisma.auditLog.create({
            data: {
                staffId: adminId,
                action: 'APPLY_DISCOUNT',
                entityType: 'ORDER',
                entityId: orderId,
                reason,
                metadata: JSON.stringify({ discountAmount }),
            },
        });

        // Apply discount
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { discount: discountAmount },
        });

        // Recalculate total
        const total = order.subtotal + order.tax - discountAmount;
        await prisma.order.update({
            where: { id: orderId },
            data: { total },
        });

        revalidatePath(`/table`);
        revalidatePath(`/waiter/dashboard`);
        revalidatePath(`/admin/dashboard`);

        return { success: true };
    } catch (error) {
        console.error('Error applying discount:', error);
        return { success: false, error: 'Failed to apply discount' };
    }
}

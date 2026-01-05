'use server';

import { prisma } from '@/lib/prisma';
import { Role } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// --- Menu Categories ---

export async function getMenuCategories() {
    try {
        return await prisma.menuCategory.findMany({
            orderBy: { sortOrder: 'asc' },
            include: { menuItems: true }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function createMenuCategory(data: { name: string; description?: string; sortOrder?: number }) {
    try {
        const category = await prisma.menuCategory.create({
            data: {
                name: data.name,
                description: data.description,
                sortOrder: data.sortOrder || 0,
            }
        });
        revalidatePath('/admin/dashboard');
        revalidatePath('/table');
        return { success: true, category };
    } catch (error) {
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateMenuCategory(id: string, data: { name?: string; description?: string; sortOrder?: number; isActive?: boolean }) {
    try {
        const category = await prisma.menuCategory.update({
            where: { id },
            data
        });
        revalidatePath('/admin/dashboard');
        return { success: true, category };
    } catch (error) {
        return { success: false, error: 'Failed to update category' };
    }
}

export async function deleteMenuCategory(id: string) {
    try {
        await prisma.menuCategory.delete({ where: { id } });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete category. Ensure it has no items.' };
    }
}

// --- Menu Items ---

export async function upsertMenuItem(data: {
    id?: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    isVeg: boolean;
    isAvailable: boolean;
    image?: string;
}) {
    try {
        let item;
        if (data.id) {
            item = await prisma.menuItem.update({
                where: { id: data.id },
                data: {
                    categoryId: data.categoryId,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    isVeg: data.isVeg,
                    isAvailable: data.isAvailable,
                    image: data.image
                }
            });
        } else {
            item = await prisma.menuItem.create({
                data: {
                    categoryId: data.categoryId,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    isVeg: data.isVeg,
                    isAvailable: data.isAvailable,
                    image: data.image
                }
            });
        }
        revalidatePath('/admin/dashboard');
        revalidatePath('/table');
        return { success: true, item };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to save item' };
    }
}

export async function deleteMenuItem(id: string) {
    try {
        await prisma.menuItem.delete({ where: { id } });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete item' };
    }
}

// --- Tables ---

export async function upsertTable(data: { id?: string; tableNumber: string; capacity: number; location: string }) {
    try {
        let table;
        if (data.id) {
            table = await prisma.table.update({
                where: { id: data.id },
                data: {
                    tableNumber: data.tableNumber,
                    capacity: data.capacity,
                    location: data.location
                } as any
            });
        } else {
            // Check duplicate
            const existing = await prisma.table.findUnique({ where: { tableNumber: data.tableNumber } });
            if (existing) return { success: false, error: 'Table number already exists' };

            table = await prisma.table.create({
                data: {
                    tableNumber: data.tableNumber,
                    capacity: data.capacity,
                    location: data.location || 'AC',
                    qrCode: `QR-${data.tableNumber}` // Simple generation
                } as any
            });
        }
        revalidatePath('/admin/dashboard');
        revalidatePath('/tables');
        return { success: true, table };
    } catch (error) {
        return { success: false, error: 'Failed to save table' };
    }
}

export async function deleteTable(id: string) {
    try {
        await prisma.table.delete({ where: { id } });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete table' };
    }
}

// --- Staff ---

export async function getAllStaff() {
    try {
        return await prisma.staff.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, staffId: true, name: true, role: true, isActive: true } // Exclude PIN
        });
    } catch (error) {
        return [];
    }
}

export async function upsertStaff(data: { id?: string; staffId: string; name: string; pin?: string; role: Role }) {
    try {
        let staff;
        if (data.id) {
            // Update
            const updateData: any = {
                staffId: data.staffId,
                name: data.name,
                role: data.role
            };
            if (data.pin) {
                updateData.pin = await bcrypt.hash(data.pin, 10);
            }
            staff = await prisma.staff.update({
                where: { id: data.id },
                data: updateData
            });
        } else {
            // Create
            if (!data.pin) return { success: false, error: 'PIN required for new staff' };

            const existing = await prisma.staff.findUnique({ where: { staffId: data.staffId } });
            if (existing) return { success: false, error: 'Staff ID already taken' };

            const hashedPin = await bcrypt.hash(data.pin, 10);
            staff = await prisma.staff.create({
                data: {
                    staffId: data.staffId,
                    name: data.name,
                    role: data.role,
                    pin: hashedPin
                }
            });
        }
        revalidatePath('/admin/dashboard');
        return { success: true, staff };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to save staff' };
    }
}

export async function deleteStaff(id: string) {
    try {
        await prisma.staff.delete({ where: { id } });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete staff' };
    }
}

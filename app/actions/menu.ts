'use server';

import { prisma } from '@/lib/prisma';

export async function getMenuWithCategories() {
    try {
        const categories = await prisma.menuCategory.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
                menuItems: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });

        return categories;
    } catch (error) {
        console.error('Error fetching menu:', error);
        return [];
    }
}

export async function getMenuItem(id: string) {
    try {
        const item = await prisma.menuItem.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });

        return item;
    } catch (error) {
        console.error('Error fetching menu item:', error);
        return null;
    }
}

export async function getAllMenuItems() {
    try {
        const items = await prisma.menuItem.findMany({
            where: { isAvailable: true },
            include: {
                category: true,
            },
            orderBy: [
                { category: { sortOrder: 'asc' } },
                { sortOrder: 'asc' },
            ],
        });

        return items;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
}

'use server';

import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { Role } from '@/lib/types';

export interface AuthResult {
    success: boolean;
    message?: string;
    staff?: {
        id: string;
        staffId: string;
        name: string;
        role: string;
    };
}

export async function authenticateStaff(
    staffId: string,
    pin: string
): Promise<AuthResult> {
    try {
        // Find staff by staffId
        const staff = await prisma.staff.findUnique({
            where: { staffId },
            select: {
                id: true,
                staffId: true,
                name: true,
                pin: true,
                role: true,
                isActive: true,
            },
        });

        if (!staff) {
            return {
                success: false,
                message: 'Invalid staff ID or PIN',
            };
        }

        if (!staff.isActive) {
            return {
                success: false,
                message: 'Account is inactive. Please contact administrator.',
            };
        }

        // Verify PIN
        const isValidPin = await bcrypt.compare(pin, staff.pin);

        if (!isValidPin) {
            return {
                success: false,
                message: 'Invalid staff ID or PIN',
            };
        }

        return {
            success: true,
            staff: {
                id: staff.id,
                staffId: staff.staffId,
                name: staff.name,
                role: staff.role,
            },
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return {
            success: false,
            message: 'An error occurred during authentication',
        };
    }
}

export async function verifyRole(staffId: string, requiredRole: Role): Promise<boolean> {
    try {
        const staff = await prisma.staff.findUnique({
            where: { staffId },
            select: { role: true, isActive: true },
        });

        if (!staff || !staff.isActive) {
            return false;
        }

        return staff.role === requiredRole;
    } catch (error) {
        console.error('Role verification error:', error);
        return false;
    }
}

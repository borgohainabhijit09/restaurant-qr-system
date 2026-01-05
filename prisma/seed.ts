import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { Role } from '../lib/types';

async function main() {
    console.log('🌱 Starting minimal database seed...');

    // Check if admin already exists
    const existingAdmin = await prisma.staff.findUnique({
        where: { staffId: 'ADMIN001' }
    });

    if (existingAdmin) {
        console.log('✅ Admin account already exists. Skipping seed.');
        console.log('\n🔑 Admin Login:');
        console.log('   Staff ID: ADMIN001');
        console.log('   PIN: 1234');
        return;
    }

    // Create Admin account only
    console.log('👤 Creating admin account...');
    await prisma.staff.create({
        data: {
            staffId: 'ADMIN001',
            name: 'Restaurant Owner',
            pin: await bcrypt.hash('1234', 10),
            role: Role.ADMIN,
        },
    });

    console.log('✅ Admin account created successfully!');
    console.log('\n🎉 Database seeded!');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   Staff ID: ADMIN001');
    console.log('   PIN: 1234');
    console.log('\n📝 Next Steps:');
    console.log('   1. Login with admin credentials');
    console.log('   2. Use Admin Panel to create:');
    console.log('      - Waiters and Kitchen staff');
    console.log('      - Tables');
    console.log('      - Menu categories and items');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

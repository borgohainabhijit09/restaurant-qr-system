import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { Role, TableStatus, OrderItemStatus } from '../lib/types';



async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.auditLog.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.tableSession.deleteMany();
    await prisma.table.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.staff.deleteMany();

    // Create Staff
    console.log('👥 Creating staff...');
    const admin = await prisma.staff.create({
        data: {
            staffId: 'ADMIN001',
            name: 'Restaurant Owner',
            pin: await bcrypt.hash('1234', 10),
            role: Role.ADMIN,
        },
    });

    const waiter1 = await prisma.staff.create({
        data: {
            staffId: 'W001',
            name: 'John Smith',
            pin: await bcrypt.hash('1111', 10),
            role: Role.WAITER,
        },
    });

    const waiter2 = await prisma.staff.create({
        data: {
            staffId: 'W002',
            name: 'Sarah Johnson',
            pin: await bcrypt.hash('2222', 10),
            role: Role.WAITER,
        },
    });

    console.log('✅ Staff created');

    // Create Tables (10 tables)
    console.log('🪑 Creating tables...');
    const tables = [];
    for (let i = 1; i <= 10; i++) {
        const table = await prisma.table.create({
            data: {
                tableNumber: `T${i.toString().padStart(2, '0')}`,
                qrCode: `QR-TABLE-${i.toString().padStart(2, '0')}`,
                capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
                status: TableStatus.FREE,
            },
        });
        tables.push(table);
    }
    console.log('✅ Tables created');

    // Create Menu Categories
    console.log('📋 Creating menu categories...');
    const appetizers = await prisma.menuCategory.create({
        data: {
            name: 'Appetizers',
            description: 'Start your meal with our delicious starters',
            sortOrder: 1,
        },
    });

    const mainCourse = await prisma.menuCategory.create({
        data: {
            name: 'Main Course',
            description: 'Our signature main dishes',
            sortOrder: 2,
        },
    });

    const desserts = await prisma.menuCategory.create({
        data: {
            name: 'Desserts',
            description: 'Sweet endings to your meal',
            sortOrder: 3,
        },
    });

    const beverages = await prisma.menuCategory.create({
        data: {
            name: 'Beverages',
            description: 'Refreshing drinks',
            sortOrder: 4,
        },
    });

    console.log('✅ Menu categories created');

    // Create Menu Items
    console.log('🍽️ Creating menu items...');

    // Appetizers
    await prisma.menuItem.createMany({
        data: [
            {
                categoryId: appetizers.id,
                name: 'Spring Rolls',
                description: 'Crispy vegetable spring rolls with sweet chili sauce',
                price: 8.99,
                isVeg: true,
                sortOrder: 1,
            },
            {
                categoryId: appetizers.id,
                name: 'Chicken Wings',
                description: 'Spicy buffalo wings with ranch dip',
                price: 12.99,
                isVeg: false,
                sortOrder: 2,
            },
            {
                categoryId: appetizers.id,
                name: 'Garlic Bread',
                description: 'Toasted bread with garlic butter and herbs',
                price: 6.99,
                isVeg: true,
                sortOrder: 3,
            },
            {
                categoryId: appetizers.id,
                name: 'Mozzarella Sticks',
                description: 'Fried mozzarella with marinara sauce',
                price: 9.99,
                isVeg: true,
                sortOrder: 4,
            },
        ],
    });

    // Main Course
    await prisma.menuItem.createMany({
        data: [
            {
                categoryId: mainCourse.id,
                name: 'Margherita Pizza',
                description: 'Classic pizza with tomato, mozzarella, and basil',
                price: 14.99,
                isVeg: true,
                sortOrder: 1,
            },
            {
                categoryId: mainCourse.id,
                name: 'Grilled Chicken Breast',
                description: 'Herb-marinated chicken with seasonal vegetables',
                price: 18.99,
                isVeg: false,
                sortOrder: 2,
            },
            {
                categoryId: mainCourse.id,
                name: 'Pasta Carbonara',
                description: 'Creamy pasta with bacon and parmesan',
                price: 16.99,
                isVeg: false,
                sortOrder: 3,
            },
            {
                categoryId: mainCourse.id,
                name: 'Vegetable Stir Fry',
                description: 'Mixed vegetables in Asian sauce with rice',
                price: 13.99,
                isVeg: true,
                sortOrder: 4,
            },
            {
                categoryId: mainCourse.id,
                name: 'Beef Burger',
                description: 'Angus beef patty with cheese, lettuce, and fries',
                price: 15.99,
                isVeg: false,
                sortOrder: 5,
            },
            {
                categoryId: mainCourse.id,
                name: 'Paneer Tikka Masala',
                description: 'Indian cottage cheese in rich tomato gravy',
                price: 14.99,
                isVeg: true,
                sortOrder: 6,
            },
        ],
    });

    // Desserts
    await prisma.menuItem.createMany({
        data: [
            {
                categoryId: desserts.id,
                name: 'Chocolate Lava Cake',
                description: 'Warm chocolate cake with molten center',
                price: 7.99,
                isVeg: true,
                sortOrder: 1,
            },
            {
                categoryId: desserts.id,
                name: 'Tiramisu',
                description: 'Classic Italian coffee-flavored dessert',
                price: 8.99,
                isVeg: true,
                sortOrder: 2,
            },
            {
                categoryId: desserts.id,
                name: 'Ice Cream Sundae',
                description: 'Three scoops with toppings of your choice',
                price: 6.99,
                isVeg: true,
                sortOrder: 3,
            },
            {
                categoryId: desserts.id,
                name: 'Cheesecake',
                description: 'New York style cheesecake with berry compote',
                price: 8.99,
                isVeg: true,
                sortOrder: 4,
            },
        ],
    });

    // Beverages
    await prisma.menuItem.createMany({
        data: [
            {
                categoryId: beverages.id,
                name: 'Fresh Orange Juice',
                description: 'Freshly squeezed orange juice',
                price: 4.99,
                isVeg: true,
                sortOrder: 1,
            },
            {
                categoryId: beverages.id,
                name: 'Cappuccino',
                description: 'Italian coffee with steamed milk foam',
                price: 4.50,
                isVeg: true,
                sortOrder: 2,
            },
            {
                categoryId: beverages.id,
                name: 'Iced Tea',
                description: 'Refreshing lemon iced tea',
                price: 3.99,
                isVeg: true,
                sortOrder: 3,
            },
            {
                categoryId: beverages.id,
                name: 'Soft Drink',
                description: 'Choice of Coke, Sprite, or Fanta',
                price: 2.99,
                isVeg: true,
                sortOrder: 4,
            },
            {
                categoryId: beverages.id,
                name: 'Mineral Water',
                description: 'Still or sparkling',
                price: 2.50,
                isVeg: true,
                sortOrder: 5,
            },
        ],
    });

    console.log('✅ Menu items created');

    // Create a demo active session for Table 1
    console.log('🎬 Creating demo session...');
    const demoSession = await prisma.tableSession.create({
        data: {
            tableId: tables[0].id,
            assignedWaiterId: waiter1.id,
            status: TableStatus.ACTIVE,
        },
    });

    // Update table status
    await prisma.table.update({
        where: { id: tables[0].id },
        data: { status: TableStatus.ACTIVE },
    });

    // Create a demo order
    const menuItems = await prisma.menuItem.findMany();
    const demoOrder = await prisma.order.create({
        data: {
            tableSessionId: demoSession.id,
            orderNumber: 1,
            subtotal: 0,
            tax: 0,
            total: 0,
        },
    });

    // Add some items to the order
    await prisma.orderItem.createMany({
        data: [
            {
                orderId: demoOrder.id,
                menuItemId: menuItems[0].id,
                quantity: 2,
                price: menuItems[0].price,
                status: OrderItemStatus.ADDED,
            },
            {
                orderId: demoOrder.id,
                menuItemId: menuItems[4].id,
                quantity: 1,
                price: menuItems[4].price,
                status: OrderItemStatus.PREPARING,
            },
        ],
    });

    // Update order totals
    const orderItems = await prisma.orderItem.findMany({
        where: { orderId: demoOrder.id },
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    await prisma.order.update({
        where: { id: demoOrder.id },
        data: { subtotal, tax, total },
    });

    console.log('✅ Demo session created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Staff: ${await prisma.staff.count()}`);
    console.log(`   - Tables: ${await prisma.table.count()}`);
    console.log(`   - Menu Categories: ${await prisma.menuCategory.count()}`);
    console.log(`   - Menu Items: ${await prisma.menuItem.count()}`);
    console.log(`   - Active Sessions: ${await prisma.tableSession.count()}`);
    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: ADMIN001 / PIN: 1234');
    console.log('   Waiter 1: W001 / PIN: 1111');
    console.log('   Waiter 2: W002 / PIN: 2222');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

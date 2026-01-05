# Restaurant QR Ordering System - MVP

A production-ready, table-level ordering system for restaurants with QR code integration. Built with Next.js, Prisma, and SQLite.

## 🎯 Features

### Customer Experience (No Login Required)
- Scan QR code to access table
- Browse menu by categories
- Add items to cart with real-time updates
- View order status (Added → Preparing → Served)
- Cannot remove items once being prepared or served
- Request bill when ready
- View final bill with tax calculation

### Waiter Interface (PIN Login)
- Accept and manage multiple tables
- View live order updates
- Update item status (Added → Preparing → Served)
- Receive bill request notifications
- Close tables and collect payment

### Admin Dashboard (PIN Login)
- Live floor monitoring with grid/list view
- Real-time statistics (active tables, revenue, etc.)
- View all table details
- Override capabilities with mandatory reason logging:
  - Remove any item at any stage
  - Apply discounts
- Full audit trail

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd restaurant-qr-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database is already set up!**
   The SQLite database has been created and seeded with demo data.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Demo Credentials

### Admin Access
- **Staff ID:** `ADMIN001`
- **PIN:** `1234`

### Waiter Access
- **Waiter 1:**
  - Staff ID: `W001`
  - PIN: `1111`

- **Waiter 2:**
  - Staff ID: `W002`
  - PIN: `2222`

### Customer Access
- No login required
- Visit: `/table/T01` (or any table from T01 to T10)
- Table T01 has a demo active session with sample orders

## 📱 User Flows

### Customer Flow
1. Scan QR code (or visit `/table/[tableNumber]`)
2. Browse menu by category
3. Add items to cart
4. View cart and modify quantities
5. Request bill
6. View final bill

### Waiter Flow
1. Login at `/waiter/login`
2. View available tables
3. Accept a table
4. View order items
5. Mark items as "Preparing" then "Served"
6. Respond to bill requests
7. Close table after payment

### Admin Flow
1. Login at `/admin/login`
2. View live floor dashboard
3. Monitor all tables in real-time
4. Click any table to view details
5. Override actions (remove items, apply discounts)
6. All overrides require a reason (logged for audit)

## 🧪 Testing Scenarios

### Scenario 1: Customer Orders
1. Visit `/table/T02`
2. Add items from different categories
3. View cart - items show "ADDED" status
4. Try to remove an item (should work)

### Scenario 2: Waiter Updates Status
1. Login as waiter (W001 / 1111)
2. Accept Table T02
3. Mark items as "Preparing"
4. Customer can no longer remove those items
5. Mark items as "Served"

### Scenario 3: Bill Request
1. As customer, request bill
2. Cart locks (cannot add more items)
3. Waiter sees "Bill Requested" notification
4. Waiter closes table after payment

### Scenario 4: Admin Override
1. Login as admin (ADMIN001 / 1234)
2. View any active table
3. Remove a served item (requires reason)
4. Apply a discount (requires reason)
5. Check audit log (stored in database)

## 📊 Database Schema

The system uses the following main entities:

- **Staff** - Admin and waiter accounts
- **Tables** - Restaurant tables (10 tables: T01-T10)
- **TableSessions** - Active ordering sessions
- **Orders** - Order containers for sessions
- **OrderItems** - Individual items with status tracking
- **MenuCategories** - Menu organization
- **MenuItems** - Available dishes (19 items across 4 categories)
- **AuditLog** - Admin override tracking

## 🔄 Real-time Updates

- Customer view: Auto-refreshes every 5 seconds
- Waiter dashboard: Auto-refreshes every 5 seconds
- Admin dashboard: Auto-refreshes every 3 seconds

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite with Prisma ORM
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Authentication:** PIN-based with bcrypt hashing
- **State Management:** React hooks + Server Actions

## 📁 Project Structure

```
restaurant-qr-system/
├── app/
│   ├── actions/          # Server actions
│   │   ├── auth.ts       # Authentication
│   │   ├── tables.ts     # Table management
│   │   ├── menu.ts       # Menu operations
│   │   └── orders.ts     # Order operations
│   ├── table/[tableNumber]/  # Customer interface
│   ├── waiter/           # Waiter interface
│   │   ├── login/
│   │   └── dashboard/
│   ├── admin/            # Admin interface
│   │   ├── login/
│   │   └── dashboard/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── lib/
│   ├── prisma.ts         # Prisma client
│   └── types.ts          # TypeScript enums
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts           # Seed data
│   └── dev.db            # SQLite database
└── package.json
```

## 🔐 Security Notes

- PINs are hashed using bcrypt
- Session data stored in sessionStorage (client-side)
- Server actions validate permissions
- Admin overrides require mandatory reasons
- All sensitive operations are logged

## 🚀 Production Deployment

For production deployment:

1. **Update environment variables:**
   ```bash
   DATABASE_URL="file:./prod.db"
   NODE_ENV="production"
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start production server:**
   ```bash
   npm start
   ```

4. **Consider:**
   - Use PostgreSQL instead of SQLite for better concurrency
   - Implement proper session management (JWT, cookies)
   - Add HTTPS/SSL
   - Set up proper authentication middleware
   - Implement rate limiting
   - Add monitoring and logging

## 📝 Notes

- This is an MVP focused on core functionality
- No payment gateway integration (manual payment)
- No kitchen display system
- No customer profiles or loyalty programs
- No analytics dashboard
- Real-time updates use polling (not WebSockets)

## 🤝 Support

For issues or questions:
1. Check the implementation documentation in `IMPLEMENTATION.md`
2. Review the database schema in `prisma/schema.prisma`
3. Examine server actions in `app/actions/`

## 📄 License

This is a demo/MVP project for educational purposes.

---

**Built with ❤️ using Next.js, Prisma, and modern web technologies**

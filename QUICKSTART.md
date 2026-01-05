# 🚀 Quick Start Guide - Restaurant QR Ordering System

## ⚡ 5-Minute Setup

### 1. Server is Already Running!
The development server is running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.1.4:3000

### 2. Open Your Browser
Navigate to **http://localhost:3000**

You'll see a beautiful homepage with three options:
- 🛒 **Customer** - Try Demo Table
- 👨‍🍳 **Waiter** - Waiter Login
- 🛡️ **Admin** - Admin Login

## 🎯 Try These 3 Quick Demos

### Demo 1: Customer Experience (2 minutes)
1. Click "Try Demo Table" or go to `/table/T01`
2. Browse the menu (4 categories)
3. Add items to cart
4. Click cart icon to view
5. Try to remove an item (works!)
6. Click "Request Bill"
7. Cart locks - you can't add more items

**What you'll see**:
- Beautiful menu with categories
- Real-time cart updates
- Status badges (Added, Preparing, Served)
- Smooth animations

### Demo 2: Waiter Dashboard (3 minutes)
1. Click "Waiter Login"
2. Enter: `W001` / `1111`
3. See available tables
4. Click "Accept Table" for Table T01
5. View order items
6. Click "Mark Preparing" on an item
7. Go back to customer view - you can't remove that item anymore!
8. Return to waiter, click "Mark Served"
9. If bill was requested, click "Close Table"

**What you'll see**:
- Table assignment system
- Live order updates
- Status management
- Bill request notifications

### Demo 3: Admin Dashboard (2 minutes)
1. Click "Admin Login"
2. Enter: `ADMIN001` / `1234`
3. See live floor dashboard
4. View statistics (active tables, revenue)
5. Click any table to see details
6. Try "Remove (Override)" on any item
7. Enter a reason (mandatory!)
8. Try "Apply Discount"

**What you'll see**:
- Live floor monitoring
- Real-time stats
- Grid/list view toggle
- Override system with audit logging

## 📋 Demo Credentials (Copy-Paste Ready)

### Admin
```
Staff ID: ADMIN001
PIN: 1234
```

### Waiter 1
```
Staff ID: W001
PIN: 1111
```

### Waiter 2
```
Staff ID: W002
PIN: 2222
```

### Customer
```
No login required!
Just visit: /table/T01 (or T02, T03... up to T10)
```

## 🧪 Test the Core Business Rules

### Rule 1: Customer Can't Delete Prepared Items
1. Customer adds items to cart
2. Waiter marks them as "Preparing"
3. Customer tries to delete → ❌ Blocked!

### Rule 2: One Waiter Per Table
1. Waiter 1 accepts Table T02
2. Waiter 2 tries to accept same table → ❌ Not in available list!

### Rule 3: Bill Request Locks Cart
1. Customer requests bill
2. Try to add more items → ❌ Blocked!
3. Cart shows "Bill Requested" status

### Rule 4: Admin Override Requires Reason
1. Admin tries to remove served item
2. Modal appears asking for reason
3. Can't proceed without entering reason
4. Override is logged in database

## 📱 URLs to Bookmark

- **Homepage**: http://localhost:3000
- **Customer (Table 1)**: http://localhost:3000/table/T01
- **Waiter Login**: http://localhost:3000/waiter/login
- **Waiter Dashboard**: http://localhost:3000/waiter/dashboard
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Dashboard**: http://localhost:3000/admin/dashboard

## 🎨 What to Look For

### Beautiful UI
- ✨ Gradient backgrounds
- 🎭 Smooth animations
- 🎨 Color-coded status badges
- 📱 Responsive design
- 🔔 Toast notifications

### Real-time Updates
- ⏱️ Auto-refresh every 3-5 seconds
- 🔄 Live cart updates
- 📊 Live statistics
- 🔴 Status changes reflect immediately

### User Experience
- 🚫 Clear error messages
- ✅ Success notifications
- ⏳ Loading states
- 🔒 Locked items show why
- 💡 Helpful tooltips

## 🛠️ If Something Goes Wrong

### Server Not Running?
```bash
cd restaurant-qr-system
npm run dev
```

### Database Issues?
```bash
npx prisma migrate reset --force
# This will reset and reseed the database
```

### Port 3000 Already in Use?
```bash
# Kill the process on port 3000
# Then restart: npm run dev
```

### Clear Browser Cache
- Press `Ctrl + Shift + R` (Windows/Linux)
- Press `Cmd + Shift + R` (Mac)

## 📚 Next Steps

1. **Read the Full Documentation**:
   - `README.md` - Complete guide
   - `SUMMARY.md` - Feature overview
   - `IMPLEMENTATION.md` - Technical details

2. **Customize the System**:
   - Edit menu in `prisma/seed.ts`
   - Modify styles in `app/globals.css`
   - Add more tables

3. **Deploy to Production**:
   - Follow deployment guide in README
   - Set up PostgreSQL
   - Configure environment variables

## 💡 Pro Tips

1. **Open Multiple Browser Windows**:
   - Window 1: Customer view (`/table/T01`)
   - Window 2: Waiter dashboard
   - Window 3: Admin dashboard
   - Watch real-time updates across all views!

2. **Use Browser DevTools**:
   - Check Network tab for server actions
   - View Console for any errors
   - Inspect database with Prisma Studio: `npx prisma studio`

3. **Test Edge Cases**:
   - Try to remove a served item
   - Request bill with empty cart
   - Close a table that's not yours
   - All should be handled gracefully!

## 🎉 You're All Set!

The system is **fully functional** and ready to use. Explore all three user roles and see how they interact in real-time.

**Enjoy your Restaurant QR Ordering System MVP!** 🍽️

---

**Questions?** Check the documentation files or examine the code in `app/actions/` for business logic.

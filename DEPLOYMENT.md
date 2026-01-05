# 🚀 Vercel Deployment Guide - PostgreSQL Setup

Your code is now ready for Vercel! Follow these steps to complete the deployment.

## ✅ What's Already Done

1. ✅ Prisma schema updated to use PostgreSQL
2. ✅ `postinstall` script configured for Prisma Client generation
3. ✅ Code pushed to GitHub
4. ✅ TypeScript build errors resolved

## 📋 Steps to Deploy

### Step 1: Add Vercel Postgres Database

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `restaurant-qr-system`
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., `restaurant-qr-db`)
7. Select region (choose closest to your users)
8. Click **Create**

**Important:** Vercel will automatically add these environment variables to your project:
- `POSTGRES_PRISMA_URL` (for connection pooling)
- `POSTGRES_URL_NON_POOLING` (for direct connections)
- `POSTGRES_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 2: Trigger Deployment

After adding the database, Vercel will automatically trigger a new deployment. If not:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Check **Use existing Build Cache** (optional)
4. Click **Redeploy**

### Step 3: Initialize Database Schema

Once the deployment succeeds, you need to push your Prisma schema to the database:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run Prisma migration
npx prisma db push
```

**Option B: Add to Build Script**
Update `package.json`:
```json
"scripts": {
  "build": "prisma db push && next build"
}
```
Then commit and push this change to trigger a new deployment.

### Step 4: Seed Initial Data (Optional)

If you want to add demo data:

```bash
# Using Vercel CLI with pulled env vars
npx prisma db seed
```

Or create a seed script in Vercel dashboard:
1. Go to **Settings** → **Functions**
2. Add a serverless function to run the seed

## 🎯 Verification

After deployment completes:

1. Visit your Vercel deployment URL
2. Try accessing the home page
3. Test the QR ordering flow
4. Check admin login

## 🔧 Troubleshooting

### Build Fails with "Prisma Client not generated"
- Make sure `postinstall` script exists in `package.json`
- Check Vercel build logs for errors

### Database Connection Errors
- Verify Postgres database is created in Vercel Storage
- Check that environment variables are set in Vercel project settings
- Ensure `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` are present

### Schema Not Applied
- Run `npx prisma db push` after pulling environment variables
- Or add it to the build script

## 📝 Local Development Note

Your local development is currently using SQLite. If you want to test with PostgreSQL locally:

1. Install PostgreSQL locally or use Docker:
   ```bash
   docker run --name postgres-dev -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
   ```

2. Update your local `.env`:
   ```
   POSTGRES_PRISMA_URL="postgresql://postgres:password@localhost:5432/restaurant_qr_dev?schema=public"
   POSTGRES_URL_NON_POOLING="postgresql://postgres:password@localhost:5432/restaurant_qr_dev?schema=public"
   ```

3. Run migrations:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

## 🎉 Next Steps

Once deployed successfully:
- [ ] Test all features on production
- [ ] Set up custom domain (optional)
- [ ] Configure analytics
- [ ] Set up monitoring/error tracking (e.g., Sentry)
- [ ] Add production environment variables for any API keys

---

**Need Help?** Check the Vercel documentation: https://vercel.com/docs/storage/vercel-postgres

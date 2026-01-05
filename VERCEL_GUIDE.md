# Deploying to Vercel via GitHub

Yes, you can deploy to Vercel easily, but because Vercel uses **Serverless Functions**, you cannot use the file-based **SQLite** database (`dev.db`) for production. It won't save your data.

You must upgrade to a Cloud Database like **Vercel Postgres** (Free Tier available).

## Step-by-Step Migration Guide for Vercel

### 1. Update Prisma Schema
Open `prisma/schema.prisma` and change the datasource provider from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql" // Changed from sqlite
  url      = env("POSTGRES_PRISMA_URL") // Vercel provides this automatically
  directUrl = env("POSTGRES_URL_NON_POOLING") // For migrations
}
```

### 2. Push to GitHub
Commit and push your code to a GitHub repository.

### 3. Create Project in Vercel
1. Go to Vercel Dashboard -> **Add New...** -> **Project**.
2. Select your GitHub repository.
3. **IMPORTANT**: Before clicking Deploy, go to the **Storage** tab (or "Add Integration") in the dashboard setup and add a **Vercel Postgres** database.
   - This will automatically populate the `POSTGRES_PRISMA_URL` and other environment variables for you.
4. Click **Deploy**.

### 4. Run Migrations (Post-Deploy)
Since Vercel builds the app, you need to ensure the database schema is created.
You can add a build command in `package.json` or use the Vercel Command:

**Recommended**: update your `package.json` scripts:
```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma db push && next build"
}
```
*Note: `prisma db push` will sync your schema to the Postgres DB during the build process.*

### 5. Done!
Your app will now run on Vercel with a persistent Cloud Database.

---

## Summary of Changes Required
1. Modify `prisma/schema.prisma` (Provider: `postgresql`).
2. Update `package.json` build script to include `prisma db push`.
3. Connect Vercel Storage integration.

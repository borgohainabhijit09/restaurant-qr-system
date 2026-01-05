# Deployment Guide for cPanel/Node.js (public_html)

Since this application uses a Database (SQLite) and Server Actions, it requires a **Node.js** environment. It cannot be hosted as a static HTML site.

Follow these steps to deploy on cPanel with Node.js support:

## 1. Prepare Local Build
1. Open your terminal in the project folder.
2. Run the build command:
   ```bash
   npm run build
   ```
   This creates a `.next` folder with your production code.

## 2. Upload Files
Upload the following files/folders to your `public_html` directory (or a subdirectory like `restaurant-app`):

- `.next/` (The hidden folder created by build step)
- `public/` (Images and icons)
- `prisma/` (Database schema)
- `node_modules/` (Optional: preferably install on server, but you can upload if specific versions needed)
- `package.json`
- `server.js` (The entry point created for you)
- `.env` (Make sure to set `DATABASE_URL="file:./dev.db"` or path to your prod db)

**Do NOT upload:** `src/`, `app/` (source code is already compiled in `.next`)

## 3. Configure cPanel Node.js Application
1. Log in to cPanel and open "Setup Node.js App".
2. Create New Application:
   - **Node.js Version**: Select 18 or 20.
   - **Application Mode**: Production.
   - **Application Root**: Path to where you uploaded files (e.g., `public_html/restaurant-app`).
   - **Application URL**: Your domain (e.g., `mydomain.com`).
   - **Application Startup File**: `server.js`.
3. Click **Create**.

## 4. Install Dependencies
1. In the Node.js App section, click "Run NPM Install" if available.
2. OR, SSH into your server, navigate to the folder, and run:
   ```bash
   npm install --production
   ```

## 5. Setup Database
Inside the server terminal (SSH or cPanel Terminal):
1. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
2. Push the schema to create the SQLite database:
   ```bash
   npx prisma db push
   ```

## 6. Restart
- Go back to "Setup Node.js App" and click **Restart Application**.
- Your app should now be live!

### Troubleshooting
- If you see a 500 error, check `stderr.log` in your application folder.
- Ensure `.env` has the correct `DATABASE_URL`. For SQLite, `file:./prod.db` works fine on disk.

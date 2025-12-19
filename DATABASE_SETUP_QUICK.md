# Quick Database Setup Guide

## The Issue
Your app is getting 503 errors because the PostgreSQL database isn't running. The backend server is running, but it can't connect to the database on `localhost:5434`.

## Quick Solution: Use Neon (Free Cloud Database) - Recommended

1. **Sign up for Neon** (free tier available):
   - Go to https://neon.tech
   - Create a free account
   - Create a new project

2. **Get your connection string**:
   - Copy the connection string from Neon dashboard
   - It looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

3. **Update your .env file**:
   ```bash
   DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. **Run database migrations**:
   ```bash
   npx drizzle-kit push
   ```

5. **Restart the backend server**:
   ```bash
   npm run dev
   ```

## Alternative: Local PostgreSQL with Docker

If you have Docker installed:

```bash
# Run the setup script
bash setup-dev-db.sh
```

This will:
- Start a PostgreSQL container on port 5434
- Create the database and user
- Run migrations
- Update your .env file

## Alternative: Local PostgreSQL (Manual)

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Create database and user**:
   ```bash
   sudo -u postgres psql
   ```
   
   Then in psql:
   ```sql
   CREATE DATABASE clinicconnect;
   CREATE USER clinicuser WITH PASSWORD 'clinic_dev_2024';
   GRANT ALL PRIVILEGES ON DATABASE clinicconnect TO clinicuser;
   \q
   ```

3. **Update .env** (already configured for port 5434):
   ```bash
   DATABASE_URL=postgresql://clinicuser:clinic_dev_2024@localhost:5434/clinicconnect
   ```

4. **Run migrations**:
   ```bash
   npx drizzle-kit push
   ```

5. **Restart backend**:
   ```bash
   npm run dev
   ```

## Current Configuration

Your `.env` file is currently set to:
```
DATABASE_URL=postgresql://clinicuser:clinic_dev_2024@localhost:5434/clinicconnect
```

This expects a PostgreSQL database running on `localhost:5434`.

## Verify Database Connection

After setting up the database, test the connection:

```bash
# Test with the debug script
npx tsx scripts/debug-database.ts
```

Or test the API:
```bash
curl http://localhost:5001/api/health
```

## Need Help?

- Check server logs: The backend server logs will show database connection errors
- Test connection: Use `scripts/debug-database.ts` to test your database connection
- Verify .env: Make sure `DATABASE_URL` is set correctly in your `.env` file

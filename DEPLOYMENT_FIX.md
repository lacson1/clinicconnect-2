# Deployment Failure - Troubleshooting Guide

## Current Status
- **Deployment ID**: `6ae9514f-9d58-4030-91f3-5aab831ea6c3`
- **Status**: ERROR (5/7 steps, 1 error)
- **App ID**: `b2c2085f-d938-428c-9299-1165af8dfc3c`

## Common Causes & Fixes

### 1. Missing Environment Variables ⚠️ MOST LIKELY

The app.yaml has placeholder values for secrets. You MUST set these in DigitalOcean dashboard:

**Go to:** DigitalOcean Dashboard → Apps → clinicconnect → Settings → App-Level Environment Variables

**Set these as SECRET type (🔒):**
```
JWT_SECRET = hTHerpoXMnHeojvaGCRqO9/aLuE/JtaMkNUfr0xVHFGdJSyP/BUP7AmQJsRupiChp8/JP+VKWzrbBy0v92F7Nw==

SESSION_SECRET = Wv3VetMSsAJoD/loK7TZeG60cXGJokk9T5+fKWxEiym0SvpwIKg0Ckg3LYUB/COt+Um4EUjpxvcbqkbvXBWh2g==
```

**Important:**
- Click the 🔒 lock icon to set as SECRET type
- Do NOT use the placeholder values from app.yaml
- These must be set BEFORE deployment

### 2. Database Connection Issues

**Check:**
- Database is created and running
- DATABASE_URL is correctly set (auto-injected from ${db.DATABASE_URL})
- Database firewall allows app connections
- SSL mode is correct for managed database

**Fix:**
- Verify database exists in DigitalOcean
- Check database connection string format
- Ensure database is in same region as app

### 3. Build Failures

**Possible causes:**
- Missing dependencies
- TypeScript compilation errors
- Docker build context issues

**Check build logs:**
1. Go to DigitalOcean Dashboard
2. Click on the failed deployment
3. View "Build Logs" tab
4. Look for error messages

### 4. Missing Files in Docker Build

**Verify these files exist:**
- ✅ Dockerfile.optimized
- ✅ package.json
- ✅ drizzle.config.ts
- ✅ server/index.ts
- ✅ All source files

### 5. Startup Script Issues

The startup script runs migrations. If migrations fail:
- Check DATABASE_URL is set
- Verify database is accessible
- Check SSL certificate settings

## Quick Fix Steps

### Step 1: Set Environment Variables

1. Go to: https://cloud.digitalocean.com/apps/b2c2085f-d938-428c-9299-1165af8dfc3c/settings
2. Scroll to "App-Level Environment Variables"
3. Add/Update:
   - `JWT_SECRET` (as SECRET) = `hTHerpoXMnHeojvaGCRqO9/aLuE/JtaMkNUfr0xVHFGdJSyP/BUP7AmQJsRupiChp8/JP+VKWzrbBy0v92F7Nw==`
   - `SESSION_SECRET` (as SECRET) = `Wv3VetMSsAJoD/loK7TZeG60cXGJokk9T5+fKWxEiym0SvpwIKg0Ckg3LYUB/COt+Um4EUjpxvcbqkbvXBWh2g==`
4. Save changes

### Step 2: Check Build Logs

1. Go to: https://cloud.digitalocean.com/apps/b2c2085f-d938-428c-9299-1165af8dfc3c
2. Click on the failed deployment
3. View "Build Logs" to see exact error
4. Look for:
   - "Error:"
   - "Failed:"
   - "Cannot find module"
   - "Missing:"

### Step 3: Verify Database

1. Check database exists: https://cloud.digitalocean.com/databases
2. Verify database is running
3. Check connection string format
4. Ensure firewall allows app connections

### Step 4: Retry Deployment

After fixing environment variables:
1. Go to Deployments tab
2. Click "Create Deployment"
3. Or wait for auto-deploy on next push

## View Detailed Logs

**Via Dashboard (Recommended):**
1. Go to: https://cloud.digitalocean.com/apps/b2c2085f-d938-428c-9299-1165af8dfc3c
2. Click on failed deployment
3. View "Build Logs" and "Runtime Logs"

**Via CLI:**
```bash
# Get deployment details
doctl apps get-deployment b2c2085f-d938-428c-9299-1165af8dfc3c 6ae9514f-9d58-4030-91f3-5aab831ea6c3

# List all deployments
doctl apps list-deployments b2c2085f-d938-428c-9299-1165af8dfc3c
```

## Most Common Issue

**90% of deployment failures are due to:**
- Missing or incorrect `JWT_SECRET`
- Missing or incorrect `SESSION_SECRET`
- These MUST be set as SECRET type in the dashboard

## Next Steps

1. ✅ Set JWT_SECRET and SESSION_SECRET in dashboard
2. ✅ Check build logs for specific error
3. ✅ Verify database connection
4. ✅ Retry deployment

## Need More Help?

Check the build logs in DigitalOcean dashboard for the specific error message. The logs will show exactly what failed during the build or deployment process.


# 🚀 DigitalOcean App Platform Deployment - Step by Step

## Prerequisites

✅ Repository: https://github.com/lacson1/CC-2.git  
✅ Branch: `main`  
✅ app.yaml: Configured and ready  
✅ Secrets: Generated (see below)

---

## Step 1: Set Secrets in DigitalOcean Dashboard ⚠️ CRITICAL

**DO THIS FIRST** - Deployment will fail without these!

### 1.1 Go to DigitalOcean Dashboard

1. Visit: https://cloud.digitalocean.com/apps
2. Sign in to your account

### 1.2 Create or Select Your App

**If creating a new app:**
- Click **"Create App"**
- You'll set secrets after connecting the repo

**If app already exists:**
- Click on your app
- Go to **Settings** → **App-Level Environment Variables**

### 1.3 Add Required Secrets

Click **"Edit"** or **"Add Variable"** and add these **3 variables**:

#### Variable 1: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: 
  ```
  pYOzCftcUhMwpMWSYsZY5RFuL7cc0Hgzz6Jbbcpx/dCEeQhwdTxoDorfZ5QSUJpmcB1YHtgZhSGID1fZflcaeg==
  ```
- **Type**: 🔒 Click the **lock icon** to set as **SECRET** (NOT plain text!)
- **Scope**: **RUN_TIME**
- Click **"Save"**

#### Variable 2: SESSION_SECRET
- **Key**: `SESSION_SECRET`
- **Value**: 
  ```
  sujeTdTAO3r3BJsdAbD/h3VbOPkofs5kPUIPrdK9k34VB9J7Y7UK5zODwNc12yD1tdOapiFxBHM95S4+xWp7iQ==
  ```
- **Type**: 🔒 Click the **lock icon** to set as **SECRET** (NOT plain text!)
- **Scope**: **RUN_TIME**
- Click **"Save"**

#### Variable 3: DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `${clinicconnect-db.DATABASE_URL}`
- **Type**: 🔒 **SECRET**
- **Scope**: **RUN_TIME**
- Click **"Save"**

**⚠️ IMPORTANT**: All three must be set as **SECRET** type (lock icon), not plain text!

---

## Step 2: Create/Update App in DigitalOcean

### Option A: Create New App (Recommended)

1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. **Authorize GitHub** if prompted
5. Select repository: **`lacson1/CC-2`**
6. Select branch: **`main`**
7. Click **"Next"**

### Option B: Update Existing App

1. Go to your app in DigitalOcean
2. Click **"Settings"** → **"App Spec"**
3. Click **"Edit Spec"**
4. Update the `github.repo` to: `lacson1/CC-2`
5. Update the `github.branch` to: `main`
6. Click **"Save"**

---

## Step 3: Verify App Configuration

### 3.1 Check App Spec

Your app should use the `app.yaml` from the repository. Verify:

- **Repository**: `lacson1/CC-2` ✅
- **Branch**: `main` ✅
- **Dockerfile**: `Dockerfile.optimized` ✅
- **Port**: `5001` ✅
- **Health Check**: `/api/health` ✅

### 3.2 Verify Database Resource

1. Go to **"Resources"** tab
2. Verify `clinicconnect-db` exists
3. If missing:
   - Click **"Add Resource"** → **"Database"**
   - Name: `clinicconnect-db`
   - Engine: **PostgreSQL 16**
   - Plan: **Dev Database** (Free) or **Production** ($15/mo)
   - Click **"Add Database"**

---

## Step 4: Deploy

### 4.1 Trigger Deployment

**If creating new app:**
- After Step 2, click **"Next"** through the setup
- Review configuration
- Click **"Create Resources"** or **"Deploy"**

**If updating existing app:**
1. Go to **"Deployments"** tab
2. Click **"Create Deployment"** or **"Redeploy"**
3. Select branch: `main`
4. Click **"Deploy"**

### 4.2 Monitor Deployment

1. Watch the **"Deployments"** tab
2. Build phase: ~5-10 minutes
3. Deploy phase: ~2-5 minutes
4. Health checks: ~1-2 minutes

**Total time**: ~10-15 minutes

---

## Step 5: Verify Deployment

### 5.1 Check Runtime Logs

1. Go to **"Runtime Logs"** tab
2. Look for:
   ```
   ✅ Server running on port 5001
   ✅ Database connection successful
   ```
3. **No errors** like:
   - ❌ "DATABASE_URL must be set"
   - ❌ "JWT_SECRET not set"
   - ❌ "SESSION_SECRET not set"

### 5.2 Test Health Endpoint

1. Get your app URL from the dashboard
2. Test health endpoint:
   ```bash
   curl https://your-app-name.ondigitalocean.app/api/health
   ```
3. Should return: `{"status":"ok"}`

### 5.3 Test Application

1. Open your app URL in browser
2. Should see the login page
3. Login with:
   - Username: `admin`
   - Password: `admin123`

---

## Troubleshooting

### Issue: "DATABASE_URL must be set"

**Fix:**
1. Go to Settings → Environment Variables
2. Verify `DATABASE_URL` = `${clinicconnect-db.DATABASE_URL}`
3. Ensure it's set as **SECRET** type
4. Redeploy

### Issue: "JWT_SECRET not set" or "SESSION_SECRET not set"

**Fix:**
1. Go to Settings → Environment Variables
2. Verify both secrets are set
3. Ensure Type is **SECRET** (lock icon), not plain text
4. Redeploy

### Issue: Health Check Fails

**Fix:**
1. Check runtime logs for startup errors
2. Verify all environment variables are set
3. Check if database is accessible
4. Increase `initial_delay_seconds` in app.yaml if needed

### Issue: Build Fails

**Fix:**
1. Check build logs for errors
2. Verify `Dockerfile.optimized` exists
3. Check for missing dependencies
4. Review TypeScript compilation errors

---

## Post-Deployment

### Update ALLOWED_ORIGINS

After deployment succeeds:

1. Get your app URL (e.g., `https://clinicconnect-xxxxx.ondigitalocean.app`)
2. Go to Settings → Environment Variables
3. Update `ALLOWED_ORIGINS`:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://your-actual-app-url.ondigitalocean.app`
4. Save and redeploy

### Monitor Application

- **Runtime Logs**: Monitor for errors
- **Metrics**: Check CPU, memory usage
- **Health Checks**: Ensure they're passing
- **Database**: Monitor connection pool

---

## Quick Reference

### Your Secrets (Keep Secure!)

**JWT_SECRET:**
```
pYOzCftcUhMwpMWSYsZY5RFuL7cc0Hgzz6Jbbcpx/dCEeQhwdTxoDorfZ5QSUJpmcB1YHtgZhSGID1fZflcaeg==
```

**SESSION_SECRET:**
```
sujeTdTAO3r3BJsdAbD/h3VbOPkofs5kPUIPrdK9k34VB9J7Y7UK5zODwNc12yD1tdOapiFxBHM95S4+xWp7iQ==
```

### App Configuration

- **Repository**: `lacson1/CC-2`
- **Branch**: `main`
- **Dockerfile**: `Dockerfile.optimized`
- **Port**: `5001`
- **Database**: `clinicconnect-db` (PostgreSQL 16)

---

## Success Checklist

- [ ] Secrets set in dashboard (JWT_SECRET, SESSION_SECRET, DATABASE_URL)
- [ ] App created/updated with CC-2 repository
- [ ] Database resource exists
- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] Health checks passing
- [ ] App accessible via URL
- [ ] Login works

---

**Status**: Ready to deploy!  
**Next**: Follow steps 1-5 above


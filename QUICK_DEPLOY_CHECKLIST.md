# ⚡ Quick Deploy Checklist - DigitalOcean App Platform

## 🎯 Before You Start

✅ Repository: https://github.com/lacson1/CC-2.git  
✅ Branch: `main`  
✅ app.yaml: Ready  
✅ Secrets: Generated

---

## 📝 5-Minute Deployment Steps

### Step 1: Set Secrets (2 minutes) ⚠️ CRITICAL

1. Go to: https://cloud.digitalocean.com/apps
2. Your App → **Settings** → **App-Level Environment Variables**
3. Add these **3 secrets** (click 🔒 lock icon for SECRET type):

   **JWT_SECRET:**
   ```
   pYOzCftcUhMwpMWSYsZY5RFuL7cc0Hgzz6Jbbcpx/dCEeQhwdTxoDorfZ5QSUJpmcB1YHtgZhSGID1fZflcaeg==
   ```

   **SESSION_SECRET:**
   ```
   sujeTdTAO3r3BJsdAbD/h3VbOPkofs5kPUIPrdK9k34VB9J7Y7UK5zODwNc12yD1tdOapiFxBHM95S4+xWp7iQ==
   ```

   **DATABASE_URL:**
   ```
   ${clinicconnect-db.DATABASE_URL}
   ```

### Step 2: Connect Repository (1 minute)

1. **Settings** → **App Spec** (or create new app)
2. Set repository: `lacson1/CC-2`
3. Set branch: `main`
4. Save

### Step 3: Verify Database (1 minute)

1. **Resources** tab
2. Verify `clinicconnect-db` exists
3. If missing → Add PostgreSQL 16 database

### Step 4: Deploy (1 minute)

1. **Deployments** tab
2. Click **"Create Deployment"** or **"Redeploy"**
3. Wait 10-15 minutes

### Step 5: Verify (1 minute)

1. Check **Runtime Logs** for: `✅ Server running on port 5001`
2. Test: `curl https://your-app.ondigitalocean.app/api/health`
3. Should return: `{"status":"ok"}`

---

## ✅ Success Indicators

- ✅ Build completes without errors
- ✅ Health checks pass
- ✅ Runtime logs show server running
- ✅ App URL is accessible
- ✅ Login page loads

---

## ❌ Common Failures

| Error                      | Fix                                                 |
| -------------------------- | --------------------------------------------------- |
| `DATABASE_URL must be set` | Set `${clinicconnect-db.DATABASE_URL}` in dashboard |
| `JWT_SECRET not set`       | Set as SECRET type in dashboard                     |
| `SESSION_SECRET not set`   | Set as SECRET type in dashboard                     |
| Health check fails         | Fix above issues, then redeploy                     |

---

**Full Guide**: See `DIGITALOCEAN_DEPLOY_STEPS.md` for detailed instructions


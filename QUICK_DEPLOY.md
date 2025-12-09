# Quick Deploy to DigitalOcean

## ✅ Code Status
- ✅ Pushed to GitHub: https://github.com/lacson1/clinicconnect-2.git
- ✅ All seed/mock code removed
- ✅ JWT errors fixed
- ✅ Ready for deployment

## 🔐 Required Secrets

Generate these secrets and save them:

```bash
# JWT_SECRET
hTHerpoXMnHeojvaGCRqO9/aLuE/JtaMkNUfr0xVHFGdJSyP/BUP7AmQJsRupiChp8/JP+VKWzrbBy0v92F7Nw==

# SESSION_SECRET
Wv3VetMSsAJoD/loK7TZeG60cXGJokk9T5+fKWxEiym0SvpwIKg0Ckg3LYUB/COt+Um4EUjpxvcbqkbvXBWh2g==
```

## 🚀 Deploy via DigitalOcean Dashboard (Easiest)

### Step 1: Go to App Platform
Visit: https://cloud.digitalocean.com/apps

### Step 2: Create New App
1. Click **"Create App"**
2. Select **"GitHub"** as source
3. Choose repository: `lacson1/clinicconnect-2`
4. Select branch: `main`
5. Enable **"Autodeploy"** ✅

### Step 3: Configure App
- **Name**: `clinicconnect`
- **Region**: Choose closest (e.g., `nyc`, `sfo`)
- **Build Type**: Docker
- **Dockerfile Path**: `Dockerfile.optimized`
- **HTTP Port**: `5001`

### Step 4: Add Database
1. Click **"Add Resource"** → **"Database"**
2. **Engine**: PostgreSQL 16
3. **Plan**: Dev Database (Free) or Production ($15/mo)
4. **Name**: `clinicconnect-db`

### Step 5: Set Environment Variables

**Required Variables:**
```
NODE_ENV = production
PORT = 5001
DATABASE_URL = ${db.DATABASE_URL}  (auto-injected)
JWT_SECRET = hTHerpoXMnHeojvaGCRqO9/aLuE/JtaMkNUfr0xVHFGdJSyP/BUP7AmQJsRupiChp8/JP+VKWzrbBy0v92F7Nw==
SESSION_SECRET = Wv3VetMSsAJoD/loK7TZeG60cXGJokk9T5+fKWxEiym0SvpwIKg0Ckg3LYUB/COt+Um4EUjpxvcbqkbvXBWh2g==
```

**Important:** 
- Set `JWT_SECRET` and `SESSION_SECRET` as **SECRET** type (not plain text)
- Click the lock icon 🔒 next to the variable name

### Step 6: Deploy
1. Click **"Create Resources"**
2. Wait 10-15 minutes for build
3. Monitor build logs

### Step 7: Verify
After deployment:
- Check app URL: `https://your-app.ondigitalocean.app`
- Test health: `https://your-app.ondigitalocean.app/api/health`
- Check logs - should NOT see "Seeding..." messages

---

## 🖥️ Deploy via CLI (if authenticated)

```bash
# 1. Check authentication
doctl auth list

# 2. Update app.yaml with secrets (if needed)
# Edit .do/app.yaml and replace placeholder values

# 3. Create app
doctl apps create --spec .do/app.yaml

# 4. Check status
doctl apps list
doctl apps get <app-id>
```

---

## 📝 Post-Deployment Checklist

- [ ] App is accessible at provided URL
- [ ] Health check endpoint works: `/api/health`
- [ ] No seed messages in logs
- [ ] Login works correctly
- [ ] Database connection successful
- [ ] JWT tokens are generated properly

---

## 🔄 Updating After Code Changes

Since `deploy_on_push: true` is set in app.yaml:
- Every push to `main` branch automatically triggers deployment
- Monitor deployments in DigitalOcean dashboard
- Check build logs for any issues

---

## 💰 Estimated Cost

- **Basic Plan**: $5/month
- **Dev Database**: Free
- **Production Database**: $15/month (optional)
- **Total**: $5-20/month

---

## 🆘 Need Help?

- Check build logs in DigitalOcean dashboard
- Verify environment variables are set correctly
- Ensure secrets are marked as SECRET type
- Check database connection string format


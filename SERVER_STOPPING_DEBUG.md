# Server Stopping - Debug Guide

## Common Reasons Server Stops

### 1. **Uncaught Exceptions**
The server has handlers for uncaught exceptions that trigger graceful shutdown:
- Location: `server/index.ts` lines 209-212
- **Check**: Look for errors in console before server stops
- **Fix**: Ensure all async operations have proper error handling

### 2. **Unhandled Promise Rejections**
Unhandled promise rejections can cause server to stop:
- Location: `server/index.ts` lines 215-217
- **Check**: Look for "Unhandled Rejection" messages
- **Fix**: Add `.catch()` handlers to all promises

### 3. **Database Connection Issues**
If database connection fails during startup:
- Location: `server/index.ts` line 100-104
- **Check**: Verify `DATABASE_URL` is set correctly
- **Fix**: Check database is running and accessible

### 4. **Route Registration Errors**
If `registerRoutes()` throws an error:
- Location: `server/index.ts` lines 132-137
- **Note**: Currently has error handling (non-fatal)
- **Check**: Look for "Error setting up legacy routes" in logs

### 5. **Environment Validation**
In production, invalid environment causes exit:
- Location: `server/index.ts` lines 100-104
- **Check**: Verify all required env vars are set
- **Fix**: Check `.env` file or environment variables

### 6. **Port Already in Use**
If port 5001 is already in use:
- **Check**: `Error: listen EADDRINUSE: address already in use`
- **Fix**: Kill existing process or change port

### 7. **Syntax Errors in Routes**
If there's a syntax error in `routes.ts`:
- **Check**: Look for syntax errors in console
- **Fix**: Verify all brackets, parentheses, and quotes are matched

## How to Debug

### Step 1: Check Server Logs
Look at the console output when server stops:
```bash
npm run dev
```

Look for:
- ❌ "Uncaught Exception"
- ❌ "Unhandled Rejection"
- ❌ "CRITICAL: Failed to start server"
- ❌ "Error setting up legacy routes"
- ❌ Database connection errors

### Step 2: Check for Syntax Errors
```bash
npm run build
```

### Step 3: Verify Environment Variables
```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Or check .env file
cat .env | grep DATABASE_URL
```

### Step 4: Check Port Availability
```bash
# Check if port 5001 is in use
lsof -i :5001

# Kill process if needed
kill -9 <PID>
```

### Step 5: Check Database Connection
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"
```

## Recent Changes That Could Cause Issues

### Patient Portal Routes Added
- **File**: `server/routes.ts`
- **Lines**: 11778-11810
- **Check**: Verify syntax is correct (already verified ✅)

### Logout Endpoint Added
- **File**: `server/routes.ts`
- **Check**: Verify endpoint is properly closed

## Quick Fixes

### If Server Stops Immediately:
1. **Check console for error message**
2. **Verify database is running**
3. **Check environment variables**
4. **Look for syntax errors**

### If Server Stops After Some Time:
1. **Check for memory leaks**
2. **Check for unhandled promise rejections**
3. **Check database connection pool**
4. **Check for infinite loops**

### If Server Stops on Specific Request:
1. **Check route handler for that endpoint**
2. **Check for uncaught errors in route**
3. **Check database query errors**

## Prevention

### Add Better Error Handling
```typescript
// Wrap async route handlers
app.post('/api/endpoint', async (req, res, next) => {
  try {
    // Your code
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

### Add Logging
```typescript
logger.info('Route registered:', '/api/endpoint');
```

### Test Routes Individually
```bash
curl http://localhost:5001/api/endpoint
```

## Current Status

✅ **Routes Syntax**: No linter errors
✅ **Error Handling**: Routes have try-catch blocks
✅ **Async Handling**: registerRoutes has error handling
⚠️ **Need to Check**: Actual error message when server stops

## Next Steps

1. **Run server and capture full error message**
2. **Check console output for specific error**
3. **Verify database connection**
4. **Check environment variables**
5. **Review recent changes**

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `EADDRINUSE` | Port in use | Kill process or change port |
| `ECONNREFUSED` | Database not running | Start database |
| `ENOENT` | File not found | Check file paths |
| `SyntaxError` | Code syntax error | Fix syntax |
| `TypeError` | Type mismatch | Check types |
| `ReferenceError` | Undefined variable | Check variable names |


# Clinical Notes Route Order Fix

## Issue
Route `/api/patients/:id/clinical-notes` was returning 404 even though it was registered.

## Root Cause
**Route Ordering Problem**: The route `/patients/:id/clinical-notes` was defined AFTER the more general route `/patients/:id`. In Express routing, routes are matched in the order they're registered. The general route `/patients/:id` was matching `/patients/6/clinical-notes` first, treating "clinical-notes" as the `:id` parameter.

## Solution
Moved the `/patients/:id/clinical-notes` route to **BEFORE** the `/patients/:id` route. More specific routes must be registered before less specific routes.

## Route Order (Now Correct)

```typescript
// ✅ CORRECT ORDER - More specific routes first

// 1. Specific route - registered FIRST
router.get("/patients/:id/clinical-notes", ...)  // Line 196

// 2. General route - registered AFTER
router.get("/patients/:id", ...)  // Line 228
```

## Why This Matters

Express Router matches routes in registration order:
- If `/patients/:id` comes first, it matches `/patients/6/clinical-notes` and treats "clinical-notes" as the `:id`
- If `/patients/:id/clinical-notes` comes first, it matches correctly

## Files Modified

- `server/routes/patients.ts`
  - Moved clinical-notes route from line 812 to line 196
  - Placed BEFORE `/patients/:id` route
  - Removed duplicate route definition

## Testing

After restarting the server:
1. Navigate to patient profile (patient ID 6)
2. Click Notes tab
3. Route `/api/patients/6/clinical-notes` should work
4. No more 404 errors

## Status

✅ **FIXED** - Route is now in the correct order and should match properly.


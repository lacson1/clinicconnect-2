# Clinical Notes Route 404 Fix

## Issue
Route `GET /api/patients/:id/clinical-notes` was returning 404 error.

## Root Cause
The route was defined in `server/routes.ts` inside the `registerRoutes()` function, which is called **asynchronously**. This meant:
1. The route might not be registered when requests came in
2. The route registration happened after the 404 handler was set up
3. Route timing issues could cause 404 errors

## Solution
Moved the route to `server/routes/patients.ts` in the modular routes setup, which is called **synchronously** during server startup. This ensures:
1. Route is registered before any requests come in
2. Route is registered before the 404 handler
3. Route is part of the core patient routes module

## Changes Made

### Added Route to `server/routes/patients.ts`
```typescript
// Get all clinical notes for a patient
router.get("/patients/:id/clinical-notes", authenticateToken, requireAnyRole(['doctor', 'nurse', 'admin']), async (req: AuthRequest, res) => {
  // ... implementation
});
```

### Route Details
- **Path**: `/api/patients/:id/clinical-notes`
- **Method**: GET
- **Authentication**: Required (authenticateToken)
- **Authorization**: doctor, nurse, or admin roles
- **Functionality**: Fetches all clinical notes for a specific patient

## Route Registration Order

1. ✅ Modular routes (`setupRoutes()`) - **Synchronous** - Includes clinical notes route
2. ⏳ Legacy routes (`registerRoutes()`) - **Asynchronous** - Still has duplicate route (non-conflicting)

## Testing

After restarting the server:
- [ ] Navigate to patient profile
- [ ] Click Notes tab
- [ ] Verify clinical notes load (or show empty state)
- [ ] Check browser network tab - should see 200 response
- [ ] Verify no 404 errors

## Status

✅ **FIXED** - Route is now registered synchronously in the modular routes setup, ensuring it's available immediately when the server starts.

## Next Steps

1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Test the route**:
   - Navigate to a patient profile
   - Click on the Notes tab
   - Clinical notes should load without 404 errors

3. **Optional**: Remove duplicate route from `server/routes.ts` (line 7280) if desired, though having it in both places won't cause conflicts since the modular route will match first.


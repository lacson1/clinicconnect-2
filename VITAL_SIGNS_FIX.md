# Vital Signs Recording Fix

## Issue
**Error:** "Failed to record vital signs"  
**Location:** POST `/api/patients/:id/vitals`

## Root Cause
The vital signs recording endpoint was missing the `organizationId` field when inserting records into the database. The `vital_signs` table requires `organizationId` for multi-tenant support, but it wasn't being included in the insert statement.

## Solution Applied

### 1. Added Organization Context to POST Endpoint
- Added organizationId retrieval from user context
- Added validation to ensure organizationId exists
- Included organizationId in the insert statement

### 2. Enhanced Security on GET Endpoint
- Added organization filtering to GET endpoint
- Added patient verification to ensure patient belongs to user's organization
- Prevents cross-organization data access

### 3. Improved Error Handling
- Added specific error messages for database constraint violations
- Added development mode error details
- Better error logging

## Changes Made

### File: `server/routes.ts`

**POST `/api/patients/:id/vitals` (lines ~9102-9147)**
```typescript
// Added organizationId retrieval
const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;
if (!organizationId) {
  return res.status(400).json({ message: "Organization context required" });
}

// Added organizationId to insert
.values({
  patientId,
  organizationId, // ← Added this
  bloodPressureSystolic: ...,
  // ... rest of fields
})
```

**GET `/api/patients/:id/vitals` (lines ~9085-9100)**
```typescript
// Added organization filtering and patient verification
const organizationId = req.user?.currentOrganizationId || req.user?.organizationId;

// Verify patient belongs to organization
const [patient] = await db
  .select()
  .from(patients)
  .where(and(
    eq(patients.id, patientId),
    eq(patients.organizationId, organizationId)
  ))
  .limit(1);

// Filter vitals by organization
const vitals = await db
  .select()
  .from(vitalSigns)
  .where(and(
    eq(vitalSigns.patientId, patientId),
    eq(vitalSigns.organizationId, organizationId) // ← Added this
  ))
```

## Testing

After applying this fix, test vital signs recording:

1. **Record Vital Signs:**
   - Navigate to a patient profile
   - Go to Vitals tab
   - Click "Record Vitals"
   - Fill in vital signs data
   - Submit

2. **Expected Result:**
   - ✅ Vital signs should be recorded successfully
   - ✅ No "Failed to record vital signs" error
   - ✅ Data should be saved with correct organizationId

## Security Improvements

- ✅ Multi-tenant isolation enforced
- ✅ Users can only access vital signs for patients in their organization
- ✅ Patient verification before returning data
- ✅ Organization context required for all operations

## Related Files

- `server/routes.ts` - Route handlers (lines ~9085-9147)
- `shared/schema.ts` - Database schema (vitalSigns table)
- `client/src/components/patient-vital-signs-tracker.tsx` - Frontend component


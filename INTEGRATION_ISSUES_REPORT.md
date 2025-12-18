# Integration Issues Report

This document identifies all integration issues found in the application between frontend components and backend API endpoints.

## Critical Issues

### 1. Missing Error Handling in useQuery Hooks

**Issue**: Many `useQuery` calls don't handle errors or loading states properly.

**Affected Files**:
- `client/src/pages/appointments.tsx` (line 159-161) - Missing error handling and loading state for healthcare staff query
- `client/src/pages/user-management-enhanced.tsx` (line 106-108) - Missing error handling for organizations query
- `client/src/components/modern-patient-overview.tsx` (multiple instances)
  - Line 987: `patientLabOrders` - No error handling
  - Line 1535: `fetchedActivityTrail` - Has error but not displayed
- `client/src/pages/dashboard.tsx` (line 42) - `allPatients` query missing error handling
- `client/src/pages/patient-profile.tsx` (line 231) - `labOrderItems` missing error handling

**Impact**: Components may crash or show blank screens when API calls fail.

**Recommendation**: Add error and loading state handling to all useQuery calls.

---

### 2. Missing Response Parsing in Mutations

**Issue**: Some mutations call `apiRequest` but don't parse the response JSON, leading to potential errors.

**Affected Files**:
- `client/src/components/modern-patient-overview.tsx`:
  - Line 792: `updateMedicationStatus` - No response parsing
  - Line 815: `handleEditPrescription` - No response parsing
  - Line 837: `handleSendToDispensary` - No response parsing
- `client/src/pages/role-management.tsx`:
  - Line 71: `createRoleMutation` - No response parsing
  - Line 119: `deleteRoleMutation` - No response parsing
- `client/src/components/wellness-recommendation-engine.tsx`:
  - Line 206: `createWellnessPlanMutation` - No response parsing
  - Line 213: `recordProgressMutation` - No response parsing

**Impact**: Mutations may fail silently or throw errors when trying to access response data.

**Recommendation**: Always parse response.json() after apiRequest calls, or use apiRequestTyped.

---

### 3. Inconsistent Error Handling Patterns

**Issue**: Different components handle errors differently, leading to inconsistent user experience.

**Patterns Found**:
1. Some use `onError` in mutations with toast notifications ✅
2. Some check `isError` in useQuery but don't display it ❌
3. Some catch errors but don't show user feedback ❌
4. Some use `useApiErrorHandler` hook ✅
5. Some manually parse error messages ❌

**Affected Files**:
- `client/src/pages/appointments.tsx` - Manual error parsing (lines 179-207)
- `client/src/pages/user-management-enhanced.tsx` - Basic error handling
- `client/src/components/referral-management.tsx` - Good error handling ✅

**Recommendation**: Standardize on `useApiErrorHandler` hook for all error handling.

---

### 4. Missing API Endpoints (501 Not Implemented)

**Issue**: Several API endpoints return 501 (Not Implemented) status.

**Affected Endpoints**:
- `/api/patient-portal/auth/login` - Returns 501
- `/api/patient-portal/auth/logout` - Returns 501
- `/api/patient-portal/profile` - Returns 501
- `/api/patient-portal/medications` - Returns 501
- `/api/patient-portal/appointments` - Returns 501
- `/api/patient-portal/lab-results` - Returns 501
- `/api/patient-portal/visit-history` - Returns 501

**Location**: `server/routes/patient-portal.ts`

**Impact**: Patient portal features are non-functional.

**Recommendation**: Implement these endpoints or remove references to them in the frontend.

---

### 5. Missing Loading States

**Issue**: Many components don't show loading indicators while fetching data.

**Affected Files**:
- `client/src/pages/appointments.tsx` - Healthcare staff query has no loading state
- `client/src/pages/user-management-enhanced.tsx` - Organizations query has no loading state
- `client/src/components/modern-patient-overview.tsx`:
  - `patientLabOrders` - No loading state
  - `fetchedActivityTrail` - No loading state

**Impact**: Users don't know if data is loading or if there's an error.

**Recommendation**: Add loading states to all data-fetching operations.

---

### 6. Type Mismatches Between API and Components

**Issue**: API responses may not match TypeScript types defined in components.

**Examples**:
- `client/src/components/referral-management.tsx` - `PatientReferral` interface may not match API response
- `client/src/pages/patient-profile.tsx` - Multiple type assumptions without validation

**Impact**: Runtime errors when API response structure changes.

**Recommendation**: Add runtime type validation or use Zod schemas for API responses.

---

### 7. Missing Error Boundaries

**Issue**: No React Error Boundaries to catch component crashes.

**Impact**: Entire app can crash from a single component error.

**Recommendation**: Add Error Boundaries around major sections:
- Patient overview
- Dashboard
- Forms
- Data tables

---

### 8. Inconsistent API Response Format Handling

**Issue**: Some endpoints return `{ success: true, data: ... }` format, others return data directly.

**Examples**:
- `apiRequestTyped` expects `{ success, data, error }` format
- But many endpoints return data directly (e.g., `/api/patients/:id/referrals`)

**Impact**: Type errors and runtime failures.

**Recommendation**: Standardize API response format across all endpoints.

---

### 9. Missing Query Invalidation

**Issue**: Some mutations don't invalidate related queries after success.

**Affected Files**:
- `client/src/components/modern-patient-overview.tsx`:
  - `handleUpdateMedicationStatus` - May not invalidate all related queries
  - `handleSendToDispensary` - May not invalidate pharmacy queries

**Impact**: UI shows stale data after mutations.

**Recommendation**: Ensure all mutations invalidate related queries.

---

### 10. Network Error Handling

**Issue**: Network errors (offline, timeout) aren't handled gracefully.

**Affected Areas**:
- All `useQuery` calls
- All `useMutation` calls

**Impact**: Poor user experience when network is unavailable.

**Recommendation**: Add network status detection and retry logic.

---

## Medium Priority Issues

### 11. Missing Request Validation

**Issue**: Frontend doesn't validate data before sending to API.

**Examples**:
- Form submissions without client-side validation
- Missing required field checks

**Recommendation**: Add Zod validation on frontend before API calls.

---

### 12. Race Conditions

**Issue**: Multiple simultaneous mutations can cause race conditions.

**Examples**:
- Multiple prescription updates
- Concurrent appointment bookings

**Recommendation**: Add request queuing or optimistic updates with rollback.

---

### 13. Missing Pagination

**Issue**: Some endpoints return all data without pagination.

**Examples**:
- `/api/patients` - Returns all patients
- `/api/appointments` - May return all appointments

**Impact**: Performance issues with large datasets.

**Recommendation**: Implement pagination for large data sets.

---

## Low Priority Issues

### 14. Missing Request Cancellation

**Issue**: No way to cancel in-flight requests when component unmounts.

**Impact**: Memory leaks and unnecessary network traffic.

**Recommendation**: Use AbortController for request cancellation.

---

### 15. Missing Request Deduplication

**Issue**: Same query may be called multiple times simultaneously.

**Impact**: Unnecessary API calls.

**Recommendation**: React Query handles this, but verify configuration.

---

## Additional Findings

### 16. Missing Query Error Handling in Appointments Page

**Issue**: `healthcareStaff` query in appointments page has no error or loading handling.

**Location**: `client/src/pages/appointments.tsx` line 159-161

**Impact**: If API fails, component may crash or show undefined data.

**Recommendation**: Add error and loading state handling.

---

## Summary

**Total Issues Found**: 16
- **Critical**: 11
- **Medium**: 3
- **Low**: 2

**Priority Actions**:
1. Add error handling to all useQuery calls
2. Standardize error handling with useApiErrorHandler
3. Implement missing patient portal endpoints
4. Add loading states everywhere
5. Fix response parsing in mutations
6. Add Error Boundaries
7. Standardize API response format

---

## Files Requiring Immediate Attention

1. `client/src/pages/appointments.tsx`
2. `client/src/pages/user-management-enhanced.tsx`
3. `client/src/components/modern-patient-overview.tsx`
4. `client/src/pages/patient-profile.tsx`
5. `server/routes/patient-portal.ts`
6. `client/src/lib/queryClient.ts` (verify configuration)

---

Generated: $(date)


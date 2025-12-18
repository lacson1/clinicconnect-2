# Organizations & Users System Improvements Guide

This document outlines the improvements made to enhance the organizations and users system for better performance, security, and maintainability.

## Overview

The improvements focus on:
1. **Database Integrity**: Constraints and indexes for data consistency
2. **Organization Context**: Better middleware for organization isolation
3. **Performance**: Caching layer for organization lookups
4. **Service Layer**: Centralized organization management logic
5. **Validation**: Schema-based validation for organization operations
6. **Multi-Organization Support**: Better integration between users and organizations

---

## 1. Database Improvements

### Migration: `013_improve_organizations_users.sql`

**Key Changes:**

- **Unique Constraint**: Prevents duplicate user-organization memberships
  ```sql
  ALTER TABLE user_organizations 
  ADD CONSTRAINT unique_user_organization UNIQUE (user_id, organization_id);
  ```

- **Composite Indexes**: Faster lookups for common queries
  - `idx_user_orgs_user_org`: Fast user-organization membership checks
  - `idx_organizations_name_active`: Fast subdomain resolution
  - `idx_organizations_active`: Optimized active organization queries

- **Data Integrity Constraints**:
  - Organization name cannot be empty
  - Valid organization types only
  - CASCADE deletes for referential integrity

- **Partial Indexes**: Optimized for common filtered queries (active organizations only)

**To Apply:**
```bash
psql -d your_database -f server/migrations/013_improve_organizations_users.sql
```

---

## 2. Organization Context Middleware

### File: `server/middleware/organization-context.ts`

**Features:**

- **Multi-Method Resolution**: Tries multiple methods to resolve organization context:
  1. Session (`currentOrganizationId`)
  2. Header (`X-Organization-ID`)
  3. User's default organization
  4. User's first organization
  5. Legacy `organizationId` field (backward compatibility)

- **Caching**: In-memory cache (5-minute TTL) for organization lookups
- **Access Verification**: Verifies user has access to the organization
- **Active Check**: Ensures organization is active

**Usage:**

```typescript
import { resolveOrganizationContext, requireOrganizationContext } from './middleware/organization-context';

// Resolve and validate organization context
app.get('/api/patients', 
  authenticateToken,
  resolveOrganizationContext,
  requireOrganizationContext,
  async (req, res) => {
    // req.organizationContext is now available
    const orgId = req.organizationContext!.id;
    // ... your logic
  }
);
```

**Helper Functions:**

- `verifyUserOrganizationAccess(userId, organizationId)`: Check if user has access
- `getOrganizationScope(organizationId)`: Get query conditions
- `addOrganizationContext(data, organizationId)`: Add org context to data
- `clearOrganizationCache(organizationId?)`: Clear cache

---

## 3. Organization Service Layer

### File: `server/services/organization-service.ts`

**Centralized Logic:**

All organization operations are now handled through a service layer:

```typescript
import { organizationService } from './services/organization-service';

// Create organization
const org = await organizationService.create({
  name: "New Clinic",
  type: "clinic",
  email: "clinic@example.com"
});

// Get organization stats
const stats = await organizationService.getStats(orgId);

// Add user to organization
await organizationService.addUserToOrganization(userId, orgId, roleId, true);

// Set default organization
await organizationService.setDefaultOrganization(userId, orgId);
```

**Key Methods:**

- `create(data)`: Create new organization with validation
- `update(id, data)`: Update organization with uniqueness checks
- `getById(id)`: Get organization by ID
- `getStats(id)`: Get organization statistics
- `getUserOrganizations(userId)`: Get all user's organizations
- `addUserToOrganization(userId, orgId, roleId?, setAsDefault?)`: Add user
- `removeUserFromOrganization(userId, orgId)`: Remove user
- `setDefaultOrganization(userId, orgId)`: Set default org
- `deactivate(id)`: Soft delete organization
- `activate(id)`: Reactivate organization
- `search(query, limit)`: Search organizations

---

## 4. Validation Schemas

### File: `shared/validation/organization-schemas.ts`

**Zod Schemas for Type-Safe Validation:**

```typescript
import { 
  createOrganizationSchema,
  updateOrganizationSchema,
  addUserToOrganizationSchema,
  switchOrganizationSchema
} from '@shared/validation/organization-schemas';

// Validate input
const validated = createOrganizationSchema.parse(req.body);
```

**Schemas Available:**

- `createOrganizationSchema`: Create organization validation
- `updateOrganizationSchema`: Update organization validation
- `addUserToOrganizationSchema`: Add user to org validation
- `switchOrganizationSchema`: Switch organization validation
- `organizationQuerySchema`: Query parameters validation

---

## 5. Improved Route Example

### Before (Old Pattern):

```typescript
app.get('/api/organizations/:id', authenticateToken, async (req, res) => {
  const orgId = parseInt(req.params.id);
  // Manual access check
  const [userOrg] = await db.select()...
  // Manual organization fetch
  const [org] = await db.select()...
  // No validation
  res.json(org);
});
```

### After (New Pattern):

```typescript
import { resolveOrganizationContext } from './middleware/organization-context';
import { organizationService } from './services/organization-service';
import { z } from 'zod';

app.get('/api/organizations/:id', 
  authenticateToken,
  resolveOrganizationContext,
  async (req: OrganizationContextRequest, res) => {
    try {
      const orgId = parseInt(req.params.id);
      
      // Verify access (already done by middleware, but double-check)
      if (req.organizationContext?.id !== orgId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const org = await organizationService.getById(orgId);
      if (!org) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      
      res.json(org);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch organization' });
    }
  }
);
```

---

## 6. Migration Guide

### Step 1: Apply Database Migration

```bash
# Run the migration
psql -d your_database -f server/migrations/013_improve_organizations_users.sql
```

### Step 2: Update Imports

Update your route files to use the new middleware and service:

```typescript
// Old
import { organizations } from '@shared/schema';

// New
import { resolveOrganizationContext } from './middleware/organization-context';
import { organizationService } from './services/organization-service';
```

### Step 3: Update Routes

Replace manual organization lookups with the service layer:

```typescript
// Old
const [org] = await db.select().from(organizations)...

// New
const org = await organizationService.getById(orgId);
```

### Step 4: Add Middleware

Add organization context middleware to routes that need organization isolation:

```typescript
app.get('/api/patients',
  authenticateToken,
  resolveOrganizationContext,  // Add this
  requireOrganizationContext,   // Add this if org is required
  async (req, res) => {
    const orgId = req.organizationContext!.id;
    // ...
  }
);
```

---

## 7. Best Practices

### 1. Always Use Service Layer

Don't query organizations directly. Use `organizationService`:

```typescript
// ❌ Bad
const [org] = await db.select().from(organizations)...

// ✅ Good
const org = await organizationService.getById(orgId);
```

### 2. Use Middleware for Context

Always use `resolveOrganizationContext` middleware:

```typescript
// ❌ Bad
const orgId = req.user?.organizationId;

// ✅ Good
app.get('/api/route',
  authenticateToken,
  resolveOrganizationContext,
  async (req, res) => {
    const orgId = req.organizationContext!.id;
  }
);
```

### 3. Validate Input

Always validate input using schemas:

```typescript
// ❌ Bad
const { name, email } = req.body;

// ✅ Good
const validated = createOrganizationSchema.parse(req.body);
```

### 4. Handle Errors Properly

```typescript
try {
  const org = await organizationService.create(data);
  res.json(org);
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ errors: error.errors });
  }
  if (error.message.includes('already exists')) {
    return res.status(409).json({ message: error.message });
  }
  res.status(500).json({ message: 'Failed to create organization' });
}
```

### 5. Clear Cache on Updates

When updating organizations, clear the cache:

```typescript
await organizationService.update(orgId, data);
// Cache is automatically cleared by the service
```

---

## 8. Performance Considerations

### Caching

- Organization lookups are cached for 5 minutes
- Cache is automatically cleared on updates
- Consider Redis for production (replace in-memory cache)

### Indexes

- All common query patterns are indexed
- Partial indexes for filtered queries (active orgs only)
- Composite indexes for multi-column queries

### Query Optimization

- Use service layer methods (they're optimized)
- Avoid N+1 queries (use joins)
- Use `getStats()` for aggregated data

---

## 9. Security Improvements

### Access Control

- Middleware verifies user access to organization
- Super admins have access to all organizations
- Regular users only see their organizations

### Data Isolation

- Organization context is enforced at middleware level
- All queries should filter by `organizationId`
- Service layer ensures proper isolation

### Validation

- Input validation prevents invalid data
- Uniqueness checks prevent duplicates
- Type safety with Zod schemas

---

## 10. Testing

### Unit Tests

Test the service layer:

```typescript
describe('OrganizationService', () => {
  it('should create organization', async () => {
    const org = await organizationService.create({
      name: 'Test Clinic',
      type: 'clinic'
    });
    expect(org.name).toBe('Test Clinic');
  });
  
  it('should prevent duplicate names', async () => {
    await organizationService.create({ name: 'Test' });
    await expect(
      organizationService.create({ name: 'Test' })
    ).rejects.toThrow('already exists');
  });
});
```

### Integration Tests

Test middleware and routes:

```typescript
describe('Organization Context Middleware', () => {
  it('should resolve organization from session', async () => {
    // Test middleware resolution
  });
  
  it('should verify user access', async () => {
    // Test access verification
  });
});
```

---

## 11. Future Enhancements

### Potential Improvements:

1. **Redis Caching**: Replace in-memory cache with Redis
2. **Organization Hierarchy**: Support parent-child organization relationships
3. **Organization Settings**: Per-organization configuration
4. **Organization Templates**: Pre-configured organization setups
5. **Bulk Operations**: Batch add/remove users from organizations
6. **Organization Analytics**: Advanced statistics and reporting
7. **Multi-Tenant Isolation**: Database-level isolation (if needed)
8. **Organization API Keys**: Per-organization API access

---

## 12. Troubleshooting

### Common Issues:

**Issue**: "No organization context available"
- **Solution**: Ensure user has at least one organization membership
- **Check**: Verify `userOrganizations` table has entries

**Issue**: "Organization not found"
- **Solution**: Check if organization exists and is active
- **Check**: Verify `isActive = true` in organizations table

**Issue**: "Access denied"
- **Solution**: Verify user has membership in `userOrganizations` table
- **Check**: Super admin role should bypass this

**Issue**: Cache showing stale data
- **Solution**: Clear cache manually: `clearOrganizationCache(orgId)`
- **Check**: Updates should automatically clear cache

---

## Summary

These improvements provide:

✅ **Better Data Integrity**: Constraints and indexes  
✅ **Improved Performance**: Caching and optimized queries  
✅ **Better Security**: Access verification and isolation  
✅ **Cleaner Code**: Service layer and middleware  
✅ **Type Safety**: Zod validation schemas  
✅ **Maintainability**: Centralized logic  

The system is now more robust, performant, and easier to maintain!


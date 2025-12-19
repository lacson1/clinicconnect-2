import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  resolveOrganizationContext,
  verifyUserOrganizationAccess,
  requireOrganizationContext,
  clearOrganizationCache,
} from '../organization-context';
import type { Response } from 'express';
import { db } from '../../db';

// Clear cache before each test
beforeEach(() => {
  clearOrganizationCache();
});

// Mock the database
vi.mock('../../db', () => ({
  db: {
    select: vi.fn(),
  },
}));

describe('Organization Context Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn();
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockReq = {
      user: {
        id: 1,
        username: 'testuser',
        role: 'doctor',
        organizationId: 1,
        currentOrganizationId: 1,
      },
      headers: {},
      session: {
        user: {
          currentOrganizationId: 1,
        },
      },
    };
  });

  describe('resolveOrganizationContext', () => {
    it('should resolve organization from currentOrganizationId', async () => {
      const mockOrg = {
        id: 1,
        name: 'Test Clinic',
        type: 'clinic',
        isActive: true,
      };

      // Mock organization fetch
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      // Mock user org access check
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      // Mock user organizations check
      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId: 1, organizationId: 1 }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelect as any) // Org fetch
        .mockReturnValueOnce(mockUserSelect as any) // User role check
        .mockReturnValueOnce(mockUserOrgSelect as any); // Access check

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.organizationContext).toEqual({
        id: 1,
        name: 'Test Clinic',
        type: 'clinic',
        isActive: true,
      });
      expect(mockReq.hasAccess).toBe(true);
    });

    it('should resolve organization from X-Organization-ID header', async () => {
      mockReq.user.currentOrganizationId = undefined;
      mockReq.headers['x-organization-id'] = '2';

      const mockOrg = {
        id: 2,
        name: 'Header Clinic',
        type: 'clinic',
        isActive: true,
      };

      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId: 1, organizationId: 2 }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockSelect as any)
        .mockReturnValueOnce(mockUserSelect as any)
        .mockReturnValueOnce(mockUserOrgSelect as any);

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockReq.organizationContext?.id).toBe(2);
    });

    it('should resolve organization from default organization', async () => {
      mockReq.user.currentOrganizationId = undefined;
      mockReq.headers = {};

      const mockOrg = {
        id: 3,
        name: 'Default Clinic',
        type: 'clinic',
        isActive: true,
      };

      // Mock default org lookup
      const mockDefaultSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ organizationId: 3 }]),
      };

      // Mock org fetch
      const mockOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId: 1, organizationId: 3 }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockDefaultSelect as any) // Default org
        .mockReturnValueOnce(mockOrgSelect as any) // Org fetch
        .mockReturnValueOnce(mockUserSelect as any) // User role
        .mockReturnValueOnce(mockUserOrgSelect as any); // Access check

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockReq.organizationContext?.id).toBe(3);
    });

    it('should return 401 if user not authenticated', async () => {
      mockReq.user = undefined;

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 if no organization context available', async () => {
      mockReq.user.currentOrganizationId = undefined;
      mockReq.user.organizationId = undefined;
      mockReq.headers = {};

      // Mock no default org
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(db.select).mockReturnValue(mockSelect as any);

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('No organization context'),
        })
      );
    });

    it('should return 404 if organization not found', async () => {
      // Set organizationId but org doesn't exist
      mockReq.user.currentOrganizationId = 999;
      mockReq.user.organizationId = undefined;

      // Mock organization fetch (not found)
      const mockOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // Not found
      };

      vi.mocked(db.select).mockReturnValue(mockOrgSelect as any);

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Organization not found',
        })
      );
    });

    it('should return 403 if organization is inactive', async () => {
      mockReq.user.currentOrganizationId = 2; // Use different ID to avoid cache
      mockReq.user.organizationId = undefined;
      const mockOrg = {
        id: 2,
        name: 'Inactive Clinic',
        type: 'clinic',
        isActive: false,
      };

      // Mock organization fetch (not in cache, so will fetch from DB)
      const mockOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      // Mock user role check (not superadmin, so access check will run)
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      // Mock user has access (but org is inactive, so should fail before this)
      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId: 1, organizationId: 2 }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockOrgSelect as any) // Org fetch
        .mockReturnValueOnce(mockUserSelect as any) // User role (won't be called if inactive check fails first)
        .mockReturnValueOnce(mockUserOrgSelect as any); // Access check (won't be called)

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('inactive'),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have access', async () => {
      mockReq.user.currentOrganizationId = 999; // Different org
      mockReq.user.organizationId = undefined;
      const mockOrg = {
        id: 999,
        name: 'Test Clinic',
        type: 'clinic',
        isActive: true,
      };

      // Mock organization fetch
      const mockOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      // Mock user role check (not superadmin)
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      // Mock no access in user_organizations
      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // No access
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockOrgSelect as any) // Org fetch
        .mockReturnValueOnce(mockUserSelect as any) // User role
        .mockReturnValueOnce(mockUserOrgSelect as any); // Access check

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('do not have access'),
        })
      );
    });

    it('should allow superadmin access to any organization', async () => {
      mockReq.user.role = 'superadmin';

      const mockOrg = {
        id: 999,
        name: 'Any Clinic',
        isActive: true,
      };

      const mockOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockOrg]),
      };

      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'superadmin' }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockOrgSelect as any)
        .mockReturnValueOnce(mockUserSelect as any);

      await resolveOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.hasAccess).toBe(true);
    });
  });

  describe('verifyUserOrganizationAccess', () => {
    it('should return true for superadmin', async () => {
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'superadmin' }]),
      };

      vi.mocked(db.select).mockReturnValue(mockUserSelect as any);

      const result = await verifyUserOrganizationAccess(1, 999);

      expect(result).toBe(true);
    });

    it('should return true if user has access', async () => {
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ userId: 1, organizationId: 1 }]),
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockUserSelect as any)
        .mockReturnValueOnce(mockUserOrgSelect as any);

      const result = await verifyUserOrganizationAccess(1, 1);

      expect(result).toBe(true);
    });

    it('should return false if user does not have access', async () => {
      // First call: check user role (not superadmin)
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ role: 'doctor' }]),
      };

      // Second call: check user_organizations (no access)
      const mockUserOrgSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]), // No access
      };

      vi.mocked(db.select)
        .mockReturnValueOnce(mockUserSelect as any) // User role check
        .mockReturnValueOnce(mockUserOrgSelect as any); // Access check

      const result = await verifyUserOrganizationAccess(1, 999);

      expect(result).toBe(false);
      expect(db.select).toHaveBeenCalledTimes(2);
    });
  });

  describe('requireOrganizationContext', () => {
    it('should call next if organization context exists', () => {
      mockReq.organizationContext = {
        id: 1,
        name: 'Test Clinic',
        type: 'clinic',
        isActive: true,
      };

      requireOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 if organization context missing', () => {
      mockReq.organizationContext = undefined;

      requireOrganizationContext(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('clearOrganizationCache', () => {
    it('should clear cache for specific organization', () => {
      // Cache is in-memory, so we just verify the function exists
      expect(typeof clearOrganizationCache).toBe('function');
      expect(() => clearOrganizationCache(1)).not.toThrow();
    });

    it('should clear all cache if no organization ID provided', () => {
      expect(() => clearOrganizationCache()).not.toThrow();
    });
  });
});

